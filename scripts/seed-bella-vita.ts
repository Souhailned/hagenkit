import { readFileSync } from "fs";
import { join } from "path";
import prisma from "@/lib/prisma";
import { uploadImage } from "@/lib/storage";

/**
 * Seed script: Bella Vita Hotel & Restaurant
 * Source: horecamakelaardij-knook-verbaas.nl
 * Scraped via Firecrawl on 2026-02-21
 *
 * Reads locally downloaded images from .firecrawl/bella-vita-images/
 * and uploads them to Cloudflare R2.
 *
 * Requires: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *           R2_BUCKET_NAME, R2_PUBLIC_URL
 */

const IMAGES_DIR = join(process.cwd(), ".firecrawl/bella-vita-images");

// ── Setup ──────────────────────────────────────────────────────

const user = await prisma.user.findFirst({ where: { role: "admin" } });
let agency = await prisma.agency.findFirst();

if (!agency && user) {
  agency = await prisma.agency.create({
    data: {
      name: "Horecamakelaardij Knook & Verbaas",
      slug: "knook-verbaas",
      plan: "PRO",
      dreamSliderEnabled: true,
    },
  });
}

if (!user || !agency) {
  console.log("No user or agency found. Please create a user first.");
  await prisma.$disconnect();
  process.exit(1);
}

const slug = "bella-vita-hotel-restaurant-herengracht-54-den-haag";
const existing = await prisma.property.findUnique({ where: { slug } });
if (existing) {
  console.log("Property already exists:", slug);
  await prisma.$disconnect();
  process.exit(0);
}

// ── Property Data ──────────────────────────────────────────────

const property = await prisma.property.create({
  data: {
    agencyId: agency.id,
    createdById: user.id,

    // Basic Info
    title: "Bella Vita Hotel & Restaurant",
    slug,
    description: `Te koop aangeboden: de horeca-exploitatie van Bella Vita Hotel & Restaurant, een sfeervol en goed onderhouden hotel-restaurant gelegen op een strategische locatie in Den Haag. Bella Vita staat bekend om haar gastvrijheid, combinatie van hotel en restaurant en een stabiele exploitatie met groeipotentie. Deze onderneming biedt een uitstekende kans voor zowel ervaren horecaondernemers als investeerders die op zoek zijn naar een turn-key concept.

Bella Vita combineert een volwaardig restaurant met een kleinschalig hotel, wat zorgt voor meerdere inkomstenstromen en een brede doelgroep.

Highlights:
- Restaurant met professionele keuken en gezellige zitgelegenheid
- Ca. 35 zitplaatsen (uitbreiding mogelijk)
- Hotel met 4 kamers voor circa 14 gasten, geschikt voor zowel zakelijke gasten als toeristen
- Volledig ingericht en operationeel
- Goede reputatie en terugkerende gastenkring

Opvallende kenmerken:
- Combinatie van restaurant en hotel onder een exploitatie
- Direct klaar voor voortzetting zonder ingrijpende investeringen
- Meerdere omzetbronnen (restaurant, overnachtingen, arrangementen)
- Geschikt voor diverse concepten of optimalisatie van het huidige concept
- Goede online vindbaarheid en naamsbekendheid

Aan de achterzijde bevindt zich rechts een sfeervolle bar, ideaal voor ontvangst, borrels en aperitiefmomenten. De professionele keuken is praktisch achter in het restaurant geplaatst, wat zorgt voor een efficiente werkwijze en optimale beleving voor de gast.

Dankzij de doordachte indeling en complete inrichting is het restaurant instapklaar en geschikt voor uiteenlopende horecaconcepten, van casual dining tot een meer verfijnd restaurantconcept.

Locatie:
Bella Vita is gelegen in het centrum van Den Haag nabij het Centraal Station. Den Haag is een stad met een constante stroom van zakelijke bezoekers, toeristen en expats. De locatie profiteert van goede bereikbaarheid met auto en openbaar vervoer, nabijheid van kantoren, internationale organisaties en toeristische trekpleisters.

Huurovereenkomst:
- Huurprijs: EUR 4.320 per maand, exclusief BTW
- Huurtermijn: 1 december 2031, daarna telkens met vijf jaar verlengd
- Huurprijsaanpassing: jaarlijks conform CBS per 1 december
- Huurovereenkomst conform standaardmodel ROZ

Bestemmingsplan: "gemengd-1", horeca categorie "licht" toegestaan.`,
    shortDescription:
      "Sfeervol hotel-restaurant op strategische locatie in Den Haag centrum, nabij Centraal Station. Combinatie restaurant (35 zitplaatsen) en hotel (4 kamers, 14 gasten). Instapklaar en volledig operationeel.",

    // Location
    address: "Herengracht 54",
    city: "Den Haag",
    postalCode: "2511 EJ",
    province: "Zuid-Holland",
    country: "NL",
    latitude: 52.0799,
    longitude: 4.3113,
    neighborhood: "Centrum",

    // Location Classification
    bereikbaarheidAuto: "Goed",
    bereikbaarheidOV: "Uitstekend",
    parkeerType: "Betaald parkeren op straat en parkeergarages",
    toeristischGebied: true,
    kadastralGemeente: "Den Haag",
    kadastralSectie: "F",
    kadastralNummer: "2141",

    // Pricing
    priceType: "SALE",
    salePrice: 34900000, // EUR 349.000 in centen
    rentPrice: 432000, // EUR 4.320 per maand in centen
    priceNegotiable: true,

    // Dimensions
    surfaceTotal: 125,
    surfaceCommercial: 125,
    floors: 2,

    // Classification
    propertyType: "HOTEL_RESTAURANT",
    status: "ACTIVE",

    // Horeca Specifics
    seatingCapacityInside: 35,
    kitchenType: "professional",
    hasBasement: false,
    hasStorage: false,
    hasTerrace: true,
    hasParking: false,

    // Horeca Operational
    currentlyOperating: true,
    operationalHours: "Tot 23:00 uur (volgens APV gemeente)",

    // Previous Use
    wasHoreca: true,
    previousHorecaType: "HOTEL_RESTAURANT",

    // Tags
    tags: [
      "instapklaar",
      "hotel-restaurant",
      "centrum",
      "den-haag",
      "turn-key",
      "meerdere-inkomstenstromen",
    ],

    // SEO
    metaTitle:
      "Bella Vita Hotel & Restaurant te koop - Herengracht 54 Den Haag",
    metaDescription:
      "Te koop: horeca-exploitatie Bella Vita Hotel & Restaurant in Den Haag centrum. Restaurant met 35 zitplaatsen en hotel met 4 kamers. Vraagprijs EUR 349.000.",
    featured: true,

    // Publishing
    publishedAt: new Date(),
  },
});

console.log("Created property:", property.slug, "(id:", property.id, ")");

// ── Upload local images to R2 ─────────────────────────────────

const images = [
  { file: "web1.jpg", type: "EXTERIOR" as const, caption: "Voorgevel Bella Vita Hotel & Restaurant", isPrimary: true },
  { file: "0.jpg", type: "EXTERIOR" as const, caption: "Buitenaanzicht met terras" },
  { file: "1.jpg", type: "INTERIOR" as const, caption: "Restaurant interieur" },
  { file: "2.jpg", type: "INTERIOR" as const, caption: "Restaurant zitgedeelte" },
  { file: "3.jpg", type: "INTERIOR" as const, caption: "Restaurantzaal" },
  { file: "4.jpg", type: "INTERIOR" as const, caption: "Bar en ontvangstruimte" },
  { file: "5.jpg", type: "INTERIOR" as const, caption: "Interieur detail" },
  { file: "6.jpg", type: "INTERIOR" as const, caption: "Zitgedeelte restaurant" },
  { file: "7.jpg", type: "KITCHEN" as const, caption: "Professionele keuken" },
  { file: "8.jpg", type: "INTERIOR" as const, caption: "Hotel ingang/hal" },
  { file: "9.jpg", type: "INTERIOR" as const, caption: "Hotelkamer" },
  { file: "10.jpg", type: "TERRACE" as const, caption: "Terras" },
  { file: "11.jpg", type: "INTERIOR" as const, caption: "Hotelkamer interieur" },
  { file: "12.jpg", type: "INTERIOR" as const, caption: "Hotelkamer detail" },
  { file: "13.jpg", type: "INTERIOR" as const, caption: "Corridor/gang" },
  { file: "14.jpg", type: "BATHROOM" as const, caption: "Badkamer" },
  { file: "15.jpg", type: "INTERIOR" as const, caption: "Aanvullende ruimte" },
  { file: "16.jpg", type: "INTERIOR" as const, caption: "Hotelkamer 3" },
  { file: "17.jpg", type: "INTERIOR" as const, caption: "Hotelkamer 4" },
  { file: "18.jpg", type: "LOCATION" as const, caption: "Locatie omgeving" },
  { file: "19.jpg", type: "LOCATION" as const, caption: "Straatbeeld Herengracht" },
];

const R2_PREFIX = `properties/${slug}`;

console.log("\nUploading images to R2...");

let uploadedCount = 0;
for (let i = 0; i < images.length; i++) {
  const img = images[i];
  const localPath = join(IMAGES_DIR, img.file);
  const r2Path = `${R2_PREFIX}/${String(i).padStart(2, "0")}-${img.file}`;

  process.stdout.write(`  [${i + 1}/${images.length}] ${img.caption}... `);

  try {
    const buffer = readFileSync(localPath);
    const publicUrl = await uploadImage(buffer, r2Path, "image/jpeg");

    if (publicUrl) {
      await prisma.propertyImage.create({
        data: {
          propertyId: property.id,
          originalUrl: publicUrl,
          type: img.type,
          caption: img.caption,
          altText: img.caption,
          order: i,
          isPrimary: img.isPrimary ?? false,
          filename: img.file,
          mimeType: "image/jpeg",
          fileSize: buffer.length,
        },
      });
      uploadedCount++;
      console.log("OK");
    } else {
      console.log("UPLOAD FAILED");
    }
  } catch (err) {
    console.log("ERROR:", (err as Error).message);
  }
}

console.log(`\nUploaded ${uploadedCount}/${images.length} images to R2`);

// ── Property Features ──────────────────────────────────────────

const features = [
  { key: "professional_kitchen", category: "FACILITY" as const, value: "Professionele keuken", booleanValue: true },
  { key: "licenses_present", category: "LICENSE" as const, value: "Vergunningen aanwezig", booleanValue: true },
  { key: "seating_inside", category: "FACILITY" as const, value: "35 zitplaatsen binnen", numericValue: 35 },
  { key: "hotel_rooms", category: "FACILITY" as const, value: "4 hotelkamers (14 gasten)", numericValue: 4 },
  { key: "bar", category: "FACILITY" as const, value: "Sfeervolle bar", booleanValue: true },
  { key: "terrace", category: "FACILITY" as const, value: "Terras", booleanValue: true },
  { key: "public_transport", category: "ACCESSIBILITY" as const, value: "Goede OV bereikbaarheid" },
  { key: "parking_nearby", category: "UTILITY" as const, value: "Parkeergarages nabij", booleanValue: true },
  { key: "fully_operational", category: "FACILITY" as const, value: "Volledig ingericht en operationeel", booleanValue: true },
  { key: "roz_lease", category: "LICENSE" as const, value: "ROZ huurovereenkomst", booleanValue: true },
  { key: "zoning_mixed_1", category: "LICENSE" as const, value: "Bestemming gemengd-1 (horeca licht)" },
];

const featureRecords = await prisma.propertyFeature.createMany({
  data: features.map((f, index) => ({
    propertyId: property.id,
    key: f.key,
    category: f.category,
    value: f.value,
    numericValue: f.numericValue ?? null,
    booleanValue: f.booleanValue ?? null,
    displayOrder: index,
  })),
});

console.log("Created", featureRecords.count, "features");

// ── Done ───────────────────────────────────────────────────────

console.log("\nBella Vita Hotel & Restaurant successfully seeded!");
console.log("View at: /aanbod/" + property.slug);

await prisma.$disconnect();
