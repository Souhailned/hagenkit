/**
 * Seed images + generate AI demo concepts for the test property
 * Usage: bun scripts/generate-demo-concepts.ts
 */
import { fal, NANO_BANANA_PRO_EDIT } from "../lib/fal";
import prisma from "../lib/prisma";

// Real horeca property images (royalty-free restaurant interiors)
const SEED_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80", // restaurant interior
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80", // bar area
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80", // dining table
];

const STYLES: Record<string, string> = {
  specialty_coffee:
    "Transform this restaurant interior into a specialty coffee bar with exposed brick walls, a beautiful wooden espresso bar counter, industrial pendant lighting, concrete floors, professional barista equipment, and cozy seating with leather and wood accents. Warm ambient lighting, plants on shelves.",
  wine_tapas:
    "Transform this restaurant interior into an intimate wine and tapas bar with dark moody painted walls, velvet banquettes, floor-to-ceiling wine racks filled with bottles, warm candlelight, small marble tables, and a sophisticated European atmosphere with dim romantic lighting.",
  bakery_brunch:
    "Transform this restaurant interior into a bright bakery and brunch cafe with white marble counters, soft pastel colored walls, glass patisserie display cases filled with colorful pastries and cakes, fresh flowers in vases, light wood furniture, and lots of natural daylight.",
  healthy_bar:
    "Transform this restaurant interior into a modern healthy smoothie and juice bar with lush green tropical plants everywhere, light bamboo wood surfaces, a colorful fruit and smoothie prep station, hanging herbs, clean minimalist white walls, and a fresh tropical resort vibe.",
};

async function main() {
  const t0 = Date.now();
  const log = (msg: string) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${msg}`);

  // 1. Find the property
  const property = await prisma.property.findFirst({ include: { images: true } });
  if (!property) { console.error("No property found!"); process.exit(1); }
  log(`Property: "${property.title}" (${property.id})`);
  log(`Existing images: ${property.images.length}`);

  // 2. Seed images if needed
  let sourceImageUrl: string;
  if (property.images.length === 0) {
    log("Seeding images...");
    for (let i = 0; i < SEED_IMAGES.length; i++) {
      await prisma.propertyImage.create({
        data: {
          propertyId: property.id,
          originalUrl: SEED_IMAGES[i],
          isPrimary: i === 0,
          order: i,
        },
      });
    }
    sourceImageUrl = SEED_IMAGES[0];
    log(`Added ${SEED_IMAGES.length} images`);
  } else {
    sourceImageUrl = property.images.find(i => i.isPrimary)?.originalUrl || property.images[0].originalUrl;
  }

  // 3. Upload source to fal.ai
  log("Uploading source to fal.ai...");
  const resp = await fetch(sourceImageUrl);
  if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
  const blob = await resp.blob();
  const falUrl = await fal.storage.upload(new File([blob], "source.jpg", { type: "image/jpeg" }));
  log("Source ready. Generating 4 concepts PARALLEL...\n");

  // 4. Generate all concepts in parallel
  const entries = Object.entries(STYLES);
  const results = await Promise.allSettled(
    entries.map(async ([style, prompt]) => {
      log(`  [${style}] starting...`);
      const result = await fal.subscribe(NANO_BANANA_PRO_EDIT, {
        input: { prompt, image_urls: [falUrl], num_images: 1, output_format: "jpeg" },
      });
      const images = (result as any).data?.images || [];
      const url = images[0]?.url;
      if (!url) throw new Error("No image in response");

      log(`  [${style}] done!`);
      await prisma.propertyDemoConcept.upsert({
        where: { propertyId_style: { propertyId: property.id, style } },
        update: { imageUrl: url, sourceUrl: sourceImageUrl, generatedAt: new Date(), isActive: true },
        create: { propertyId: property.id, style, imageUrl: url, sourceUrl: sourceImageUrl },
      });
      return { style, url };
    })
  );

  // 5. Report
  log("\n--- Results ---");
  let ok = 0;
  for (const [i, r] of results.entries()) {
    const style = entries[i][0];
    if (r.status === "fulfilled") { ok++; console.log(`  OK ${style}`); }
    else console.log(`  FAIL ${style}: ${r.reason}`);
  }
  log(`${ok}/${entries.length} concepts generated.`);
  await prisma.$disconnect();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
