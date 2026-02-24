/**
 * Backfill script: Generate missing AI demo concepts for active properties.
 *
 * Run: bun run scripts/generate-missing-concepts.ts
 *
 * This generates demo concepts for properties that don't have all 6 styles.
 * Uses 10s delay between API calls to avoid rate limits.
 */

import prisma from "../lib/prisma";

const ALL_STYLES = [
  "restaurant_modern",
  "restaurant_klassiek",
  "cafe_gezellig",
  "bar_lounge",
  "hotel_boutique",
  "lunchroom_hip",
];

const DELAY_BETWEEN_CALLS_MS = 10_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("🔍 Finding active properties with missing demo concepts...\n");

  // Get all active properties with their primary image and existing concepts
  const properties = await prisma.property.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      title: true,
      slug: true,
      images: {
        where: { isPrimary: true },
        take: 1,
        select: { originalUrl: true },
      },
      demoConcepts: {
        where: { status: "completed", isActive: true },
        select: { style: true },
      },
    },
  });

  console.log(`Found ${properties.length} active properties.\n`);

  let totalGenerated = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (const property of properties) {
    const primaryImage = property.images[0];
    if (!primaryImage?.originalUrl) {
      console.log(`⏭️  ${property.title} — no primary image, skipping`);
      totalSkipped++;
      continue;
    }

    const existingStyles = new Set(property.demoConcepts.map((c) => c.style));
    const missingStyles = ALL_STYLES.filter((s) => !existingStyles.has(s));

    if (missingStyles.length === 0) {
      console.log(`✅ ${property.title} — all 6 concepts exist`);
      continue;
    }

    console.log(
      `\n🎨 ${property.title} — ${existingStyles.size}/6 concepts, generating ${missingStyles.length} missing...`
    );

    for (const style of missingStyles) {
      try {
        console.log(`   ⏳ Generating "${style}"...`);

        // Dynamic import to avoid issues with server action module scope
        const { generateDemoConcept } = await import("../app/actions/demo-concepts");

        const result = await generateDemoConcept({
          propertyId: property.id,
          style,
          imageUrl: primaryImage.originalUrl,
        });

        if (result.success) {
          // Update status to completed
          await prisma.propertyDemoConcept.update({
            where: { propertyId_style: { propertyId: property.id, style } },
            data: { status: "completed" },
          });
          console.log(`   ✅ "${style}" done`);
          totalGenerated++;
        } else {
          console.log(`   ❌ "${style}" failed`);
          totalFailed++;
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`   ❌ "${style}" error: ${msg}`);

        // Mark as failed in DB
        await prisma.propertyDemoConcept.upsert({
          where: { propertyId_style: { propertyId: property.id, style } },
          update: { status: "failed", errorMessage: msg },
          create: {
            propertyId: property.id,
            style,
            sourceUrl: primaryImage.originalUrl,
            status: "failed",
            errorMessage: msg,
          },
        }).catch(() => {});

        totalFailed++;
      }

      // Wait between calls
      console.log(`   ⏰ Waiting ${DELAY_BETWEEN_CALLS_MS / 1000}s...`);
      await sleep(DELAY_BETWEEN_CALLS_MS);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Generated: ${totalGenerated}`);
  console.log(`   Failed: ${totalFailed}`);
  console.log(`   Skipped (no image): ${totalSkipped}`);

  await prisma.$disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
