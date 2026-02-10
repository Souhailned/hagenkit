import { PrismaClient } from "@prisma/client";
import { createHash, randomUUID } from "crypto";

const prisma = new PrismaClient();

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop",
];

// Helper: hash password with scrypt (Better Auth compatible format)
async function hashPassword(password: string): Promise<string> {
  const { scrypt, randomBytes } = await import("crypto");
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString("hex");
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  console.log("🧹 Cleaning existing data...");
  await prisma.propertyInstallation.deleteMany();
  await prisma.propertyFinancials.deleteMany();
  await prisma.propertyFeature.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.propertyView.deleteMany();
  await prisma.propertyInquiry.deleteMany();
  await prisma.savedProperty.deleteMany();
  await prisma.propertyLicense.deleteMany();
  await prisma.propertyObligation.deleteMany();
  await prisma.propertyHistory.deleteMany();
  await prisma.propertyBuilding.deleteMany();
  await prisma.propertyStaffing.deleteMany();
  await prisma.property.deleteMany();
  await prisma.agentProfile.deleteMany();
  await prisma.agencyMember.deleteMany();
  await prisma.agencyInvitation.deleteMany();
  await prisma.agency.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  // Don't delete all users - just the test user if exists
  await prisma.user.deleteMany({ where: { email: "test@horecagrond.nl" } });

  // 1. Create test user
  console.log("👤 Creating test user...");
  const userId = randomUUID();
  const user = await prisma.user.create({
    data: {
      id: userId,
      email: "test@horecagrond.nl",
      name: "Test Makelaar",
      role: "agent",
      emailVerified: true,
      status: "ACTIVE",
    },
  });

  // Create account (Better Auth credential)
  const hashedPassword = await hashPassword("Test1234!");
  await prisma.account.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      accountId: user.id,
      providerId: "credential",
      password: hashedPassword,
    },
  });

  // 2. Create agency
  console.log("🏢 Creating agency...");
  const agency = await prisma.agency.create({
    data: {
      name: "Horeca Makelaardij Amsterdam",
      slug: "horeca-makelaardij-amsterdam",
      description: "Specialist in horeca vastgoed in de Randstad. Met jarenlange ervaring helpen wij u bij de aan- en verkoop van horecapanden.",
      email: "info@horecamakelaardij.nl",
      phone: "+31 20 123 4567",
      website: "https://horecamakelaardij.nl",
      address: "Herengracht 500",
      city: "Amsterdam",
      postalCode: "1017 CB",
      province: "Noord-Holland",
      verified: true,
      verifiedAt: new Date(),
      plan: "PRO",
      maxListings: 50,
      maxAgents: 10,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
      agents: {
        create: {
          userId: user.id,
          title: "Senior Horeca Makelaar",
          phone: "+31 6 12345678",
          phonePublic: true,
          bio: "Meer dan 15 jaar ervaring in horeca vastgoed.",
          specializations: ["RESTAURANT", "CAFE", "BAR", "HOTEL"],
          regions: ["Amsterdam", "Utrecht", "Rotterdam"],
          languages: ["Nederlands", "Engels"],
          verified: true,
          verifiedAt: new Date(),
        },
      },
    },
  });

  // 3. Create 18 properties
  console.log("🏪 Creating 18 properties...");

  const properties = [
    {
      title: "Restaurant De Gouden Leeuw",
      slug: "restaurant-de-gouden-leeuw-amsterdam",
      description: "Prachtig gelegen restaurant in het hart van Amsterdam met een volledig ingerichte keuken en groot terras. Het pand bevindt zich op een van de mooiste grachten van de stad, met een levendig uitzicht op de boten en de historische gevels. De keuken is professioneel uitgerust met industriële apparatuur, geschikt voor zowel à la carte als banqueting. Het terras biedt plek aan 40 gasten en is voorzien van verwarmingselementen voor het naseizoen.",
      shortDescription: "Sfeervol grachtenpand restaurant met terras aan de Prinsengracht",
      address: "Prinsengracht 123", city: "Amsterdam", postalCode: "1015 DH", province: "Noord-Holland",
      priceType: "SALE" as const, salePrice: 17500000,
      surfaceTotal: 180, surfaceKitchen: 35, surfaceTerrace: 45,
      propertyType: "RESTAURANT" as const,
      seatingCapacityInside: 60, seatingCapacityOutside: 40,
      hasTerrace: true, hasStorage: true, hasBasement: false, hasParking: false,
      featured: true, kitchenType: "professional",
      buildYear: 1890, lastRenovation: 2022, energyLabel: "C",
      currentlyOperating: true, wasHoreca: true, yearsHoreca: 25,
    },
    {
      title: "Grand Café Het Station",
      slug: "grand-cafe-het-station-utrecht",
      description: "Sfeervolle grand café met authentieke details, gelegen nabij het centraal station. Groot terras aan de gracht met uitzicht op de Dom. Het interieur combineert klassieke elementen met modern comfort. De bovenwoning is volledig gerenoveerd.",
      shortDescription: "Karakteristiek grand café bij Utrecht CS met uitzicht op de Dom",
      address: "Oudegracht 45", city: "Utrecht", postalCode: "3511 AB", province: "Utrecht",
      priceType: "RENT" as const, rentPrice: 350000,
      surfaceTotal: 250, surfaceKitchen: 30, surfaceTerrace: 60,
      propertyType: "GRAND_CAFE" as const,
      seatingCapacityInside: 80, seatingCapacityOutside: 50,
      hasTerrace: true, hasStorage: true, hasBasement: true, hasParking: false,
      featured: true, kitchenType: "basic",
      buildYear: 1920, lastRenovation: 2021, energyLabel: "D",
      currentlyOperating: true, wasHoreca: true, yearsHoreca: 40,
    },
    {
      title: "Pizzeria Napoli",
      slug: "pizzeria-napoli-rotterdam",
      description: "Authentieke Italiaanse pizzeria met echte steenoven. Lopende zaak met vaste klantenkring in populaire wijk. De steenoven is op maat gemaakt en bereikt temperaturen tot 450°C.",
      shortDescription: "Authentieke pizzeria met steenoven op de Witte de Withstraat",
      address: "Witte de Withstraat 78", city: "Rotterdam", postalCode: "3012 BR", province: "Zuid-Holland",
      priceType: "SALE" as const, salePrice: 9500000,
      surfaceTotal: 120, surfaceKitchen: 40,
      propertyType: "PIZZERIA" as const,
      seatingCapacityInside: 45,
      hasTerrace: false, hasStorage: false, hasBasement: false, hasParking: false,
      featured: false, kitchenType: "professional",
      buildYear: 1960, lastRenovation: 2023, energyLabel: "B",
      currentlyOperating: true, wasHoreca: true, yearsHoreca: 12,
    },
    {
      title: "Eetcafé De Buren",
      slug: "eetcafe-de-buren-groningen",
      description: "Gezellig eetcafé in het bruisende centrum van Groningen. Inclusief bovenwoning voor de exploitant. De kelder is geschikt als opslag en biedt extra ruimte.",
      shortDescription: "Gezellig eetcafé met bovenwoning op de Grote Markt",
      address: "Grote Markt 12", city: "Groningen", postalCode: "9711 LV", province: "Groningen",
      priceType: "RENT" as const, rentPrice: 220000,
      surfaceTotal: 140, surfaceKitchen: 20, surfaceBasement: 30,
      propertyType: "CAFE" as const,
      seatingCapacityInside: 50, seatingCapacityOutside: 20,
      hasTerrace: true, hasStorage: false, hasBasement: true, hasParking: false,
      featured: false, kitchenType: "basic",
      buildYear: 1935, energyLabel: "E",
      currentlyOperating: true, wasHoreca: true, yearsHoreca: 18,
    },
    {
      title: "Snackbar De Hoek",
      slug: "snackbar-de-hoek-eindhoven",
      description: "Drukbezochte snackbar op toplocatie nabij winkelcentrum. Volledig gerenoveerd in 2024 met nieuwe apparatuur en modern interieur. Hoge omzet door combinatie van afhaal, bezorging en zitplaatsen.",
      shortDescription: "Populaire snackbar bij winkelcentrum met hoge omzet",
      address: "Woenselse Markt 3", city: "Eindhoven", postalCode: "5612 CW", province: "Noord-Brabant",
      priceType: "SALE" as const, salePrice: 6500000,
      surfaceTotal: 75, surfaceKitchen: 30,
      propertyType: "SNACKBAR" as const,
      seatingCapacityInside: 20,
      hasTerrace: false, hasStorage: false, hasBasement: false, hasParking: true,
      featured: false, kitchenType: "professional",
      buildYear: 1985, lastRenovation: 2024, energyLabel: "A",
      currentlyOperating: true, wasHoreca: true, yearsHoreca: 30,
      parkingSpaces: 5,
    },
    {
      title: "Boutique Hotel De Oranje Nassau",
      slug: "boutique-hotel-de-oranje-nassau-den-haag",
      description: "Charmant boutique hotel met 12 kamers in monumentaal pand. Inclusief restaurant en bar op de begane grond. Het pand is recentelijk gerestaureerd met behoud van originele elementen.",
      shortDescription: "Monumentaal boutique hotel met 12 kamers en restaurant",
      address: "Noordeinde 88", city: "Den Haag", postalCode: "2514 GH", province: "Zuid-Holland",
      priceType: "SALE" as const, salePrice: 89000000,
      surfaceTotal: 650, surfaceKitchen: 45, surfaceStorage: 40,
      propertyType: "HOTEL" as const,
      seatingCapacityInside: 60,
      hasTerrace: false, hasStorage: true, hasBasement: true, hasParking: true,
      featured: true, kitchenType: "professional", monumentStatus: true,
      buildYear: 1850, lastRenovation: 2020, energyLabel: "C",
      currentlyOperating: true, wasHoreca: true, yearsHoreca: 50,
      parkingSpaces: 8,
    },
    {
      title: "Bar & Lounge Velvet",
      slug: "bar-lounge-velvet-amsterdam",
      description: "Stijlvolle cocktailbar in De Pijp. Modern interieur, uitstekende geluidsisolatie. Ideaal voor nachthoreca. Professionele cocktailbar met alle benodigde apparatuur.",
      shortDescription: "Trendy cocktailbar in De Pijp met top geluidsisolatie",
      address: "Albert Cuypstraat 200", city: "Amsterdam", postalCode: "1073 BL", province: "Noord-Holland",
      priceType: "RENT" as const, rentPrice: 420000,
      surfaceTotal: 160, surfaceBasement: 40,
      propertyType: "BAR" as const,
      seatingCapacityInside: 70, standingCapacity: 120,
      hasTerrace: false, hasStorage: true, hasBasement: true, hasParking: false,
      featured: false, kitchenType: "none",
      buildYear: 1970, lastRenovation: 2023, energyLabel: "B",
      currentlyOperating: false, wasHoreca: true, yearsHoreca: 8,
    },
    {
      title: "Lunchroom 't Zonnetje",
      slug: "lunchroom-t-zonnetje-haarlem",
      description: "Lichte en vrolijke lunchroom in het centrum van Haarlem. Inclusief achtertuin met terras. De inrichting is modern en uitnodigend, met veel daglicht en een open keuken.",
      shortDescription: "Zonnige lunchroom met achtertuin in het centrum van Haarlem",
      address: "Kruisstraat 15", city: "Haarlem", postalCode: "2011 LC", province: "Noord-Holland",
      priceType: "RENT" as const, rentPrice: 180000,
      surfaceTotal: 90, surfaceKitchen: 18, surfaceTerrace: 25,
      propertyType: "LUNCHROOM" as const,
      seatingCapacityInside: 30, seatingCapacityOutside: 20,
      hasTerrace: true, hasStorage: false, hasBasement: false, hasParking: false,
      featured: false, kitchenType: "basic",
      buildYear: 1955, lastRenovation: 2022, energyLabel: "B",
      currentlyOperating: true, wasHoreca: true, yearsHoreca: 5,
    },
    {
      title: "Partycentrum De Feestzaal",
      slug: "partycentrum-de-feestzaal-tilburg",
      description: "Groot partycentrum met meerdere zalen, geschikt voor bruiloften en feesten tot 500 personen. Professionele keuken, ruime parkeerplaats en goede bereikbaarheid via snelweg.",
      shortDescription: "Groot partycentrum tot 500 personen met parkeerplaats",
      address: "Spoorlaan 434", city: "Tilburg", postalCode: "5038 CH", province: "Noord-Brabant",
      priceType: "SALE" as const, salePrice: 45000000,
      surfaceTotal: 1200, surfaceKitchen: 80, surfaceStorage: 60,
      propertyType: "PARTYCENTRUM" as const,
      seatingCapacityInside: 500, standingCapacity: 700,
      hasTerrace: false, hasStorage: true, hasBasement: false, hasParking: true,
      featured: true, kitchenType: "industrial",
      buildYear: 1990, lastRenovation: 2019, energyLabel: "C",
      currentlyOperating: true, wasHoreca: true, yearsHoreca: 20,
      parkingSpaces: 80,
    },
    {
      title: "Brasserie Le Coin",
      slug: "brasserie-le-coin-maastricht",
      description: "Sfeervolle Franse brasserie in het hart van Maastricht. Compleet ingericht met authentieke details. Het groot terras op het Vrijthof biedt uitzicht op de Sint-Servaasbasiliek.",
      shortDescription: "Franse brasserie met terras op het Vrijthof",
      address: "Vrijthof 22", city: "Maastricht", postalCode: "6211 LD", province: "Limburg",
      priceType: "SALE" as const, salePrice: 22500000,
      surfaceTotal: 200, surfaceKitchen: 35, surfaceTerrace: 50,
      propertyType: "BRASSERIE" as const,
      seatingCapacityInside: 65, seatingCapacityOutside: 45,
      hasTerrace: true, hasStorage: false, hasBasement: true, hasParking: false,
      featured: false, kitchenType: "professional",
      buildYear: 1910, energyLabel: "D",
      currentlyOperating: true, wasHoreca: true, yearsHoreca: 15,
    },
    {
      title: "Restaurant Asia Garden",
      slug: "restaurant-asia-garden-arnhem",
      description: "Aziatisch restaurant met moderne uitstraling. Wok-keuken en sushi-bar aanwezig. Professionele afzuiginstallatie en koeling. Geschikt voor bezorging via platforms.",
      shortDescription: "Modern Aziatisch restaurant met wok-keuken en sushi-bar",
      address: "Korenmarkt 8", city: "Arnhem", postalCode: "6811 GZ", province: "Gelderland",
      priceType: "SALE" as const, salePrice: 14500000,
      surfaceTotal: 220, surfaceKitchen: 55,
      propertyType: "RESTAURANT" as const,
      seatingCapacityInside: 80,
      hasTerrace: false, hasStorage: true, hasBasement: false, hasParking: false,
      featured: false, kitchenType: "professional",
      buildYear: 1975, lastRenovation: 2021, energyLabel: "B",
      currentlyOperating: true, wasHoreca: true, yearsHoreca: 10,
    },
    {
      title: "Café 't Bruin Paard",
      slug: "cafe-t-bruin-paard-leiden",
      description: "Traditioneel bruin café met rijke historie. Vaste klantenkring en gezellige sfeer. De authentieke inrichting trekt zowel locals als toeristen aan.",
      shortDescription: "Authentiek bruin café met vaste klantenkring",
      address: "Breestraat 120", city: "Leiden", postalCode: "2311 CW", province: "Zuid-Holland",
      priceType: "SALE" as const, salePrice: 8500000,
      surfaceTotal: 100, surfaceBasement: 25,
      propertyType: "CAFE" as const,
      seatingCapacityInside: 45, seatingCapacityOutside: 15,
      hasTerrace: true, hasStorage: false, hasBasement: true, hasParking: false,
      featured: false, kitchenType: "none",
      buildYear: 1880, energyLabel: "E",
      currentlyOperating: true, wasHoreca: true, yearsHoreca: 60,
    },
    {
      title: "Hotel Restaurant De Zwaan",
      slug: "hotel-restaurant-de-zwaan-zwolle",
      description: "Karakteristiek hotel-restaurant aan de IJssel. 20 hotelkamers en restaurant met 80 zitplaatsen. Het terras aan het water biedt een unieke beleving voor gasten.",
      shortDescription: "Hotel-restaurant aan de IJssel met 20 kamers",
      address: "IJsselkade 5", city: "Zwolle", postalCode: "8011 AK", province: "Overijssel",
      priceType: "RENT" as const, rentPrice: 1200000,
      surfaceTotal: 800, surfaceKitchen: 60, surfaceTerrace: 80,
      propertyType: "HOTEL" as const,
      seatingCapacityInside: 80, seatingCapacityOutside: 40,
      hasTerrace: true, hasStorage: true, hasBasement: true, hasParking: true,
      featured: true, kitchenType: "professional",
      buildYear: 1905, lastRenovation: 2018, energyLabel: "C",
      currentlyOperating: true, wasHoreca: true, yearsHoreca: 70,
      parkingSpaces: 25,
    },
    {
      title: "Snackbar 't Hoekje",
      slug: "snackbar-t-hoekje-nijmegen",
      description: "Gevestigde snackbar met sterke naamsbekendheid. Populair bij studenten en bewoners. Goed draaiende zaak met hoge dagomzet.",
      shortDescription: "Populaire snackbar met sterke naamsbekendheid",
      address: "Marikenstraat 50", city: "Nijmegen", postalCode: "6511 PS", province: "Gelderland",
      priceType: "SALE" as const, salePrice: 5500000,
      surfaceTotal: 60, surfaceKitchen: 25,
      propertyType: "SNACKBAR" as const,
      seatingCapacityInside: 15,
      hasTerrace: false, hasStorage: false, hasBasement: false, hasParking: false,
      featured: false, kitchenType: "basic",
      buildYear: 1970, lastRenovation: 2020, energyLabel: "C",
      currentlyOperating: true, wasHoreca: true, yearsHoreca: 35,
    },
    {
      title: "Grand Café Central",
      slug: "grand-cafe-central-breda",
      description: "Monumentaal grand café op de Grote Markt. Hoge plafonds, originele details en groot terras. De kelder biedt extra opslagruimte.",
      shortDescription: "Monumentaal grand café op de Grote Markt van Breda",
      address: "Grote Markt 31", city: "Breda", postalCode: "4811 XS", province: "Noord-Brabant",
      priceType: "SALE" as const, salePrice: 28500000,
      surfaceTotal: 320, surfaceKitchen: 40, surfaceBasement: 50, surfaceTerrace: 70,
      propertyType: "GRAND_CAFE" as const,
      seatingCapacityInside: 100, seatingCapacityOutside: 60,
      hasTerrace: true, hasStorage: true, hasBasement: true, hasParking: false,
      featured: false, kitchenType: "professional", monumentStatus: true,
      buildYear: 1870, lastRenovation: 2021, energyLabel: "D",
      currentlyOperating: true, wasHoreca: true, yearsHoreca: 45,
    },
    {
      title: "Pizzeria Roma",
      slug: "pizzeria-roma-enschede",
      description: "Traditionele pizzeria met afhaal en bezorging. Goed draaiende zaak met loyale klanten. Volledig ingerichte keuken met professionele pizzaoven.",
      shortDescription: "Goed draaiende pizzeria met afhaal en bezorging",
      address: "Marktstraat 25", city: "Enschede", postalCode: "7511 GC", province: "Overijssel",
      priceType: "RENT" as const, rentPrice: 140000,
      surfaceTotal: 85, surfaceKitchen: 30,
      propertyType: "PIZZERIA" as const,
      seatingCapacityInside: 35,
      hasTerrace: false, hasStorage: false, hasBasement: false, hasParking: false,
      featured: false, kitchenType: "professional",
      buildYear: 1965, lastRenovation: 2022, energyLabel: "B",
      currentlyOperating: true, wasHoreca: true, yearsHoreca: 8,
    },
    {
      title: "Lunchroom De Bakkerij",
      slug: "lunchroom-de-bakkerij-amersfoort",
      description: "Charmante lunchroom in voormalige bakkerij. Originele oven nog aanwezig als decoratie. Sfeervolle inrichting met mix van vintage en modern.",
      shortDescription: "Sfeervolle lunchroom in voormalige bakkerij",
      address: "Langestraat 88", city: "Amersfoort", postalCode: "3811 NJ", province: "Utrecht",
      priceType: "SALE" as const, salePrice: 12500000,
      surfaceTotal: 110, surfaceKitchen: 22,
      propertyType: "LUNCHROOM" as const,
      seatingCapacityInside: 40, seatingCapacityOutside: 15,
      hasTerrace: true, hasStorage: false, hasBasement: false, hasParking: false,
      featured: false, kitchenType: "basic",
      buildYear: 1930, energyLabel: "D",
      currentlyOperating: true, wasHoreca: true, yearsHoreca: 6,
    },
    {
      title: "Bar & Grill The Ranch",
      slug: "bar-grill-the-ranch-almere",
      description: "Amerikaanse bar & grill met live muziek mogelijkheid. Groot terras aan het water met uitzicht op het Weerwater. Ruime parkeerplaats direct voor de deur.",
      shortDescription: "Bar & grill aan het Weerwater met groot terras",
      address: "Strandweg 15", city: "Almere", postalCode: "1358 AB", province: "Flevoland",
      priceType: "SALE" as const, salePrice: 16500000,
      surfaceTotal: 280, surfaceKitchen: 45, surfaceTerrace: 90,
      propertyType: "BAR" as const,
      seatingCapacityInside: 80, seatingCapacityOutside: 60, standingCapacity: 150,
      hasTerrace: true, hasStorage: true, hasBasement: false, hasParking: true,
      featured: false, kitchenType: "professional",
      buildYear: 2005, energyLabel: "A",
      currentlyOperating: true, wasHoreca: true, yearsHoreca: 15,
      parkingSpaces: 40,
    },
  ];

  const createdProperties: any[] = [];

  for (let i = 0; i < properties.length; i++) {
    const p = properties[i];
    const imgStartIdx = i % SAMPLE_IMAGES.length;

    const prop = await prisma.property.create({
      data: {
        ...p,
        agencyId: agency.id,
        createdById: user.id,
        status: "ACTIVE",
        country: "NL",
        publishedAt: new Date(Date.now() - (properties.length - i) * 86400000),
        viewCount: Math.floor(Math.random() * 500) + 50,
        inquiryCount: Math.floor(Math.random() * 20),
        savedCount: Math.floor(Math.random() * 30),
        floors: p.propertyType === "HOTEL" ? 3 : p.surfaceTotal > 300 ? 2 : 1,
        priceNegotiable: true,
        images: {
          create: [
            {
              originalUrl: SAMPLE_IMAGES[imgStartIdx],
              thumbnailUrl: SAMPLE_IMAGES[imgStartIdx] + "&w=300&h=200",
              mediumUrl: SAMPLE_IMAGES[imgStartIdx] + "&w=800&h=600",
              type: "EXTERIOR",
              altText: `${p.title} - Buitenaanzicht`,
              order: 0,
              isPrimary: true,
            },
            {
              originalUrl: SAMPLE_IMAGES[(imgStartIdx + 1) % SAMPLE_IMAGES.length],
              thumbnailUrl: SAMPLE_IMAGES[(imgStartIdx + 1) % SAMPLE_IMAGES.length] + "&w=300&h=200",
              mediumUrl: SAMPLE_IMAGES[(imgStartIdx + 1) % SAMPLE_IMAGES.length] + "&w=800&h=600",
              type: "INTERIOR",
              altText: `${p.title} - Interieur`,
              order: 1,
              isPrimary: false,
            },
            {
              originalUrl: SAMPLE_IMAGES[(imgStartIdx + 2) % SAMPLE_IMAGES.length],
              thumbnailUrl: SAMPLE_IMAGES[(imgStartIdx + 2) % SAMPLE_IMAGES.length] + "&w=300&h=200",
              mediumUrl: SAMPLE_IMAGES[(imgStartIdx + 2) % SAMPLE_IMAGES.length] + "&w=800&h=600",
              type: p.kitchenType !== "none" ? "KITCHEN" : "INTERIOR",
              altText: `${p.title} - ${p.kitchenType !== "none" ? "Keuken" : "Interieur 2"}`,
              order: 2,
              isPrimary: false,
            },
          ],
        },
      },
    });

    createdProperties.push(prop);
  }

  // 4. Create PropertyFeatures
  console.log("✨ Creating property features...");

  const featureData: Array<{
    propIdx: number;
    category: "LICENSE" | "FACILITY" | "UTILITY" | "ACCESSIBILITY";
    key: string;
    value?: string;
    booleanValue?: boolean;
    highlighted?: boolean;
  }> = [
    // Licenses for various properties
    { propIdx: 0, category: "LICENSE", key: "alcohol_license", booleanValue: true, highlighted: true },
    { propIdx: 0, category: "LICENSE", key: "terrace_license", booleanValue: true },
    { propIdx: 0, category: "LICENSE", key: "exploitation_license", booleanValue: true },
    { propIdx: 1, category: "LICENSE", key: "alcohol_license", booleanValue: true, highlighted: true },
    { propIdx: 1, category: "LICENSE", key: "terrace_license", booleanValue: true },
    { propIdx: 2, category: "LICENSE", key: "food_license", booleanValue: true },
    { propIdx: 3, category: "LICENSE", key: "alcohol_license", booleanValue: true },
    { propIdx: 3, category: "LICENSE", key: "terrace_license", booleanValue: true },
    { propIdx: 5, category: "LICENSE", key: "alcohol_license", booleanValue: true },
    { propIdx: 5, category: "LICENSE", key: "exploitation_license", booleanValue: true },
    { propIdx: 6, category: "LICENSE", key: "alcohol_license", booleanValue: true, highlighted: true },
    { propIdx: 6, category: "LICENSE", key: "late_night_license", booleanValue: true },
    { propIdx: 8, category: "LICENSE", key: "alcohol_license", booleanValue: true },
    { propIdx: 8, category: "LICENSE", key: "music_license", booleanValue: true },

    // Facilities
    { propIdx: 0, category: "FACILITY", key: "professional_kitchen", booleanValue: true, highlighted: true },
    { propIdx: 0, category: "FACILITY", key: "extraction_system", booleanValue: true },
    { propIdx: 0, category: "FACILITY", key: "cold_storage", booleanValue: true },
    { propIdx: 2, category: "FACILITY", key: "professional_kitchen", booleanValue: true },
    { propIdx: 2, category: "FACILITY", key: "extraction_system", booleanValue: true },
    { propIdx: 4, category: "FACILITY", key: "professional_kitchen", booleanValue: true },
    { propIdx: 5, category: "FACILITY", key: "professional_kitchen", booleanValue: true },
    { propIdx: 5, category: "FACILITY", key: "cold_storage", booleanValue: true },
    { propIdx: 6, category: "FACILITY", key: "bar_setup", booleanValue: true, highlighted: true },
    { propIdx: 6, category: "FACILITY", key: "sound_system", booleanValue: true },
    { propIdx: 8, category: "FACILITY", key: "professional_kitchen", booleanValue: true },
    { propIdx: 8, category: "FACILITY", key: "sound_system", booleanValue: true },
    { propIdx: 10, category: "FACILITY", key: "professional_kitchen", booleanValue: true },
    { propIdx: 10, category: "FACILITY", key: "extraction_system", booleanValue: true },

    // Utilities
    { propIdx: 0, category: "UTILITY", key: "air_conditioning", booleanValue: true },
    { propIdx: 0, category: "UTILITY", key: "wifi", booleanValue: true },
    { propIdx: 5, category: "UTILITY", key: "security_system", booleanValue: true },
    { propIdx: 5, category: "UTILITY", key: "cctv", booleanValue: true },
    { propIdx: 8, category: "UTILITY", key: "air_conditioning", booleanValue: true },
    { propIdx: 12, category: "UTILITY", key: "wifi", booleanValue: true },

    // Accessibility
    { propIdx: 1, category: "ACCESSIBILITY", key: "wheelchair_accessible", booleanValue: true },
    { propIdx: 5, category: "ACCESSIBILITY", key: "wheelchair_accessible", booleanValue: true },
    { propIdx: 5, category: "ACCESSIBILITY", key: "elevator", booleanValue: true },
    { propIdx: 8, category: "ACCESSIBILITY", key: "wheelchair_accessible", booleanValue: true },
    { propIdx: 16, category: "ACCESSIBILITY", key: "wheelchair_accessible", booleanValue: true },
  ];

  for (const f of featureData) {
    await prisma.propertyFeature.create({
      data: {
        propertyId: createdProperties[f.propIdx].id,
        category: f.category,
        key: f.key,
        value: f.value,
        booleanValue: f.booleanValue,
        verified: Math.random() > 0.5,
        highlighted: f.highlighted ?? false,
        displayOrder: 0,
      },
    });
  }

  // 5. Create PropertyFinancials for some properties
  console.log("💰 Creating property financials...");

  const financialsData = [
    {
      propIdx: 0, // Restaurant De Gouden Leeuw
      goodwill: 5000000, // €50k
      inventarisWaarde: 3500000, // €35k
      overnameSom: 17500000, // €175k
      overnameType: "ACTIVA_PASSIVA" as const,
      jaaromzet: 65000000, // €650k
      omzetJaar: 2025,
      omzetTrend: "STIJGEND" as const,
      winst: 12000000, // €120k
    },
    {
      propIdx: 1, // Grand Café Het Station
      huurcontractType: "290-bedrijfsruimte",
      huurcontractIngangsdatum: new Date("2020-01-01"),
      huurcontractEinddatum: new Date("2030-01-01"),
      huurprijsIndexatie: "CPI",
      opzegtermijnMaanden: 12,
      borgMaanden: 3,
      jaaromzet: 48000000, // €480k
      omzetJaar: 2025,
      omzetTrend: "STABIEL" as const,
    },
    {
      propIdx: 2, // Pizzeria Napoli
      goodwill: 2500000,
      inventarisWaarde: 1500000,
      overnameSom: 9500000,
      overnameType: "ACTIVA_PASSIVA" as const,
      jaaromzet: 35000000,
      omzetJaar: 2025,
      omzetTrend: "STIJGEND" as const,
      winst: 8000000,
    },
    {
      propIdx: 5, // Hotel
      goodwill: 15000000,
      inventarisWaarde: 25000000,
      overnameSom: 89000000,
      overnameType: "AANDELEN" as const,
      jaaromzet: 120000000,
      omzetJaar: 2025,
      omzetTrend: "STIJGEND" as const,
      winst: 30000000,
      discreteVerkoop: true,
    },
    {
      propIdx: 8, // Partycentrum
      goodwill: 10000000,
      inventarisWaarde: 8000000,
      overnameSom: 45000000,
      overnameType: "ACTIVA_PASSIVA" as const,
      jaaromzet: 80000000,
      omzetJaar: 2025,
      omzetTrend: "STABIEL" as const,
      winst: 18000000,
    },
  ];

  for (const f of financialsData) {
    const { propIdx, ...data } = f;
    await prisma.propertyFinancials.create({
      data: {
        propertyId: createdProperties[propIdx].id,
        ...data,
      },
    });
  }

  // 6. Create PropertyInstallations for some properties
  console.log("🔧 Creating property installations...");

  const installationData = [
    // Restaurant De Gouden Leeuw
    { propIdx: 0, category: "KEUKEN" as const, name: "Professioneel fornuis 6-pits", brand: "Rational", condition: "GOED" as const, yearInstalled: 2022 },
    { propIdx: 0, category: "KEUKEN" as const, name: "Combi-steamer", brand: "Rational", condition: "GOED" as const, yearInstalled: 2022 },
    { propIdx: 0, category: "KEUKEN" as const, name: "Koelcel walk-in", brand: "Gram", condition: "GOED" as const, yearInstalled: 2020 },
    { propIdx: 0, category: "KLIMAAT" as const, name: "Airconditioning", brand: "Daikin", condition: "GOED" as const, yearInstalled: 2022 },
    { propIdx: 0, category: "DRANK" as const, name: "Tapsysteem 8-taps", brand: "Heineken", condition: "GOED" as const, yearInstalled: 2021, ownership: "HUUR" as const },

    // Pizzeria Napoli
    { propIdx: 2, category: "KEUKEN" as const, name: "Napolitaanse steenoven", brand: "Valoriani", condition: "GOED" as const, yearInstalled: 2020 },
    { propIdx: 2, category: "KEUKEN" as const, name: "Deegkneedmachine", brand: "Häussler", condition: "GOED" as const, yearInstalled: 2021 },
    { propIdx: 2, category: "KLIMAAT" as const, name: "Afzuiginstallatie", condition: "GOED" as const, yearInstalled: 2023 },

    // Bar & Lounge Velvet
    { propIdx: 6, category: "DRANK" as const, name: "Cocktailbar setup compleet", condition: "NIEUW" as const, yearInstalled: 2023 },
    { propIdx: 6, category: "DRANK" as const, name: "Tapsysteem 12-taps", brand: "Heineken", condition: "GOED" as const, yearInstalled: 2022, ownership: "HUUR" as const },
    { propIdx: 6, category: "OVERIG" as const, name: "DJ-booth met geluidssysteem", brand: "Pioneer", condition: "GOED" as const, yearInstalled: 2023 },
    { propIdx: 6, category: "KLIMAAT" as const, name: "Airconditioning 3-zones", brand: "Mitsubishi", condition: "NIEUW" as const, yearInstalled: 2023 },

    // Hotel
    { propIdx: 5, category: "KEUKEN" as const, name: "Professionele keuken compleet", brand: "MKN", condition: "GOED" as const, yearInstalled: 2020 },
    { propIdx: 5, category: "KLIMAAT" as const, name: "Centraal verwarmings- en koelsysteem", condition: "GOED" as const, yearInstalled: 2020 },
    { propIdx: 5, category: "VEILIGHEID" as const, name: "Brandmeld- en sprinklerinstallatie", condition: "GOED" as const, yearInstalled: 2020 },

    // Partycentrum
    { propIdx: 8, category: "KEUKEN" as const, name: "Industriële keuken", condition: "GOED" as const, yearInstalled: 2019 },
    { propIdx: 8, category: "DRANK" as const, name: "Tapsysteem 16-taps", brand: "Grolsch", condition: "GOED" as const, yearInstalled: 2019, ownership: "HUUR" as const },
    { propIdx: 8, category: "OVERIG" as const, name: "Licht- en geluidssysteem", condition: "GOED" as const, yearInstalled: 2019 },
    { propIdx: 8, category: "KLIMAAT" as const, name: "Airconditioning grote zaal", condition: "REDELIJK" as const, yearInstalled: 2015 },
  ];

  for (const inst of installationData) {
    const { propIdx, ownership, ...data } = inst;
    await prisma.propertyInstallation.create({
      data: {
        propertyId: createdProperties[propIdx].id,
        ownership: ownership ?? "EIGENDOM",
        included: true,
        ...data,
      },
    });
  }

  console.log("✅ Seeding complete!");
  console.log(`   👤 1 user (test@horecagrond.nl / Test1234!)`);
  console.log(`   🏢 1 agency`);
  console.log(`   🏪 ${createdProperties.length} properties`);
  console.log(`   ✨ ${featureData.length} features`);
  console.log(`   💰 ${financialsData.length} financials`);
  console.log(`   🔧 ${installationData.length} installations`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
