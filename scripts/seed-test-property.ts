import prisma from "@/lib/prisma";

const user = await prisma.user.findFirst({ where: { role: "admin" } });
let agency = await prisma.agency.findFirst();

if (!agency && user) {
  agency = await prisma.agency.create({
    data: {
      name: "Test Agency",
      slug: "test-agency",
      plan: "PRO",
      dreamSliderEnabled: true,
    },
  });
}

if (!user || !agency) {
  console.log("No user or agency found");
  process.exit(0);
}

// Ensure agency has dreamSliderEnabled
await prisma.agency.update({
  where: { id: agency.id },
  data: { dreamSliderEnabled: true, plan: "PRO" },
});

const slug = "trendy-restaurant-centrum-amsterdam";
const existing = await prisma.property.findUnique({ where: { slug } });
if (existing) {
  console.log("Already exists:", slug);
  await prisma.$disconnect();
  process.exit(0);
}

const prop = await prisma.property.create({
  data: {
    agencyId: agency.id,
    createdById: user.id,
    title: "Trendy Restaurant Centrum Amsterdam",
    slug,
    description: "Prachtig horecapand in het hart van Amsterdam.",
    address: "Keizersgracht 123",
    city: "Amsterdam",
    postalCode: "1015 CJ",
    province: "Noord-Holland",
    surfaceTotal: 180,
    propertyType: "RESTAURANT",
    priceType: "RENT",
    rentPrice: 450000,
    latitude: 52.3676,
    longitude: 4.8846,
    status: "ACTIVE",
    publishedAt: new Date(),
  },
});

console.log("Created:", prop.slug);
await prisma.$disconnect();
