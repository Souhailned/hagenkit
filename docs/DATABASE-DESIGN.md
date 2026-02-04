# DATABASE DESIGN - Horecagrond

> **Status:** Onderzoek & Design fase
> **Doel:** Robuust en schaalbaar datamodel voor horecavastgoed platform

---

## 1. DESIGN PRINCIPES

### 1.1 Uitgangspunten

| Principe | Beschrijving |
|----------|--------------|
| **Evolutie** | Bestaande models behouden, nieuwe toevoegen |
| **Scheiding** | Property los van oude Project model |
| **Flexibiliteit** | Features als key-value voor uitbreidbaarheid |
| **Performance** | Strategische indexen op zoekpatronen |
| **Integriteit** | Cascade deletes waar logisch |
| **Audit** | Timestamps op alle belangrijke models |

### 1.2 Naming Conventions

```
Models:     PascalCase (Property, AgentProfile)
Fields:     camelCase (createdAt, propertyType)
Enums:      SCREAMING_SNAKE_CASE (DARK_KITCHEN, RENT_OR_SALE)
Tables:     snake_case via @@map (agent_profile)
Relations:  Beschrijvende namen (createdBy, assignedTo)
```

---

## 2. ENTITY RELATIONSHIP DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AUTHENTICATION                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────┐          │
│  │   User   │───►│ Session  │    │ Account  │    │ Verification │          │
│  │          │    │          │    │ (OAuth)  │    │              │          │
│  │ role:    │    │ active   │    │          │    │              │          │
│  │ seeker/  │    │ Workspace│    │          │    │              │          │
│  │ agent/   │    │ Id       │    │          │    │              │          │
│  │ admin    │    │          │    │          │    │              │          │
│  └────┬─────┘    └──────────┘    └──────────┘    └──────────────┘          │
│       │                                                                     │
│       │ 1:1                                                                 │
│       ▼                                                                     │
│  ┌──────────────┐    ┌──────────────┐                                      │
│  │SeekerProfile │    │ AgentProfile │                                      │
│  │              │    │              │                                      │
│  │ preferences  │    │ agency ──────┼───────────────────┐                  │
│  │ budget       │    │ verified     │                   │                  │
│  │ alerts       │    │ specialties  │                   │                  │
│  └──────────────┘    └──────────────┘                   │                  │
│                                                         │                  │
└─────────────────────────────────────────────────────────┼──────────────────┘
                                                          │
┌─────────────────────────────────────────────────────────┼──────────────────┐
│                              AGENCY (Multi-tenant)       │                  │
├─────────────────────────────────────────────────────────┼──────────────────┤
│                                                         │                  │
│  ┌──────────┐                                           │                  │
│  │  Agency  │◄──────────────────────────────────────────┘                  │
│  │          │                                                              │
│  │ name     │    ┌──────────────┐    ┌──────────────────┐                 │
│  │ slug     │───►│ AgencyMember │    │ AgencyInvitation │                 │
│  │ verified │    │              │    │                  │                 │
│  │ plan     │    │ role: OWNER/ │    │ token            │                 │
│  └────┬─────┘    │ ADMIN/MEMBER │    │ expiresAt        │                 │
│       │          └──────────────┘    └──────────────────┘                 │
│       │                                                                    │
│       │ 1:N                                                                │
│       ▼                                                                    │
└───────┼────────────────────────────────────────────────────────────────────┘
        │
┌───────┼────────────────────────────────────────────────────────────────────┐
│       │                         PROPERTY                                    │
├───────┼────────────────────────────────────────────────────────────────────┤
│       │                                                                     │
│       ▼                                                                     │
│  ┌──────────┐                                                              │
│  │ Property │                                                              │
│  │          │                                                              │
│  │ title    │    ┌───────────────┐    ┌────────────────┐                  │
│  │ address  │───►│ PropertyImage │    │ PropertyFeature│                  │
│  │ price    │    │               │    │                │                  │
│  │ type     │    │ original      │    │ category       │                  │
│  │ status   │    │ enhanced (AI) │    │ key/value      │                  │
│  │ score    │    │ order         │    │ verified       │                  │
│  └────┬─────┘    └───────────────┘    └────────────────┘                  │
│       │                                                                     │
│       │                                                                     │
│       ├──────────────────┬──────────────────┐                              │
│       ▼                  ▼                  ▼                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                     │
│  │PropertyView  │  │SavedProperty │  │PropertyInquiry                     │
│  │              │  │              │  │              │                     │
│  │ analytics    │  │ favorites    │  │ leads        │                     │
│  │ viewedAt     │  │ savedAt      │  │ message      │                     │
│  │ duration     │  │              │  │ status       │                     │
│  └──────────────┘  └──────────────┘  └──────────────┘                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           AI IMAGE PROCESSING                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐         ┌──────────┐                                     │
│  │ ImageProject │────────►│  Image   │                                     │
│  │              │   1:N   │          │                                     │
│  │ propertyId?  │◄────────│ original │                                     │
│  │ style        │  (opt)  │ result   │                                     │
│  │ roomType     │         │ prompt   │                                     │
│  │ status       │         │ status   │                                     │
│  └──────────────┘         └──────────┘                                     │
│                                                                             │
│  Koppeling: ImageProject.propertyId → Property.id (optioneel)              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              SEARCH & ALERTS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐                                                          │
│  │ SearchAlert  │                                                          │
│  │              │                                                          │
│  │ userId       │  Saved search criteria that triggers notifications       │
│  │ name         │  when new matching properties are listed                 │
│  │ criteria     │  (JSON: filters, cities, types, price range)             │
│  │ frequency    │  (instant, daily, weekly)                                │
│  │ lastSentAt   │                                                          │
│  │ active       │                                                          │
│  └──────────────┘                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. COMPLETE PRISMA SCHEMA

### 3.1 Enums

```prisma
// ============================================
// USER & AUTH ENUMS (Aangepast)
// ============================================

enum UserRole {
  seeker    // Horeca ondernemer die zoekt
  agent     // Makelaar/aanbieder
  admin     // Platform beheerder
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
}

// ============================================
// AGENCY ENUMS
// ============================================

enum AgencyRole {
  OWNER     // Volledige controle
  ADMIN     // Kan members beheren
  AGENT     // Kan listings beheren
  VIEWER    // Alleen lezen
}

enum AgencyPlan {
  FREE        // 3 actieve listings
  PRO         // Onbeperkt + analytics
  ENTERPRISE  // Team + API + white-label
}

// ============================================
// PROPERTY ENUMS
// ============================================

enum PropertyType {
  RESTAURANT
  CAFE
  BAR
  HOTEL
  DARK_KITCHEN
  NIGHTCLUB
  FOOD_COURT
  FOOD_TRUCK_SPOT
  CATERING
  BAKERY
  OTHER
}

enum PropertyStatus {
  DRAFT           // Nog niet gepubliceerd
  PENDING_REVIEW  // Wacht op admin goedkeuring
  ACTIVE          // Live en zichtbaar
  UNDER_OFFER     // In onderhandeling
  RENTED          // Verhuurd
  SOLD            // Verkocht
  ARCHIVED        // Niet meer actief
  REJECTED        // Afgekeurd door admin
}

enum PriceType {
  RENT          // Alleen te huur
  SALE          // Alleen te koop
  RENT_OR_SALE  // Beide opties
}

enum FeatureCategory {
  LICENSE       // Vergunningen
  FACILITY      // Faciliteiten (keuken, afzuiging)
  UTILITY       // Voorzieningen (parkeren, opslag)
  ACCESSIBILITY // Toegankelijkheid
}

// ============================================
// INQUIRY ENUMS
// ============================================

enum InquiryStatus {
  NEW               // Nieuwe aanvraag
  VIEWED            // Bekeken door agent
  CONTACTED         // Contact opgenomen
  VIEWING_SCHEDULED // Bezichtiging gepland
  NEGOTIATING       // In onderhandeling
  CLOSED_WON        // Deal gesloten
  CLOSED_LOST       // Niet doorgegaan
  SPAM              // Spam/ongeldig
}

enum InquirySource {
  WEBSITE       // Via platform
  PHONE         // Telefonisch
  EMAIL         // Direct email
  REFERRAL      // Doorverwijzing
  WALK_IN       // Spontaan bezoek
}

// ============================================
// SEARCH ALERT ENUMS
// ============================================

enum AlertFrequency {
  INSTANT   // Direct bij match
  DAILY     // Dagelijkse digest
  WEEKLY    // Wekelijkse digest
}
```

### 3.2 User & Profile Models

```prisma
model User {
  id            String     @id
  email         String     @unique
  name          String?
  role          UserRole   @default(seeker)  // AANGEPAST
  status        UserStatus @default(ACTIVE)
  emailVerified Boolean    @default(false)
  image         String?
  phone         String?
  lastLoginAt   DateTime?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @default(now()) @updatedAt

  // Onboarding
  onboardingCompleted Boolean @default(false)
  onboardingData      Json?

  // Admin plugin fields
  banned        Boolean?
  banReason     String?
  banExpires    DateTime?

  // Auth Relations
  sessions      Session[]
  accounts      Account[]

  // Profile Relations (1:1)
  seekerProfile SeekerProfile?
  agentProfile  AgentProfile?

  // Agency Relations
  agencyMemberships AgencyMember[]
  agencyInvitations AgencyInvitation[] @relation("InvitedBy")

  // Property Relations
  propertiesCreated Property[]        @relation("PropertyCreator")
  savedProperties   SavedProperty[]
  inquiriesMade     PropertyInquiry[] @relation("InquirySeeker")
  inquiriesAssigned PropertyInquiry[] @relation("InquiryAssignee")
  propertyViews     PropertyView[]

  // Search Alerts
  searchAlerts      SearchAlert[]

  // Legacy Relations (behouden voor backwards compatibility)
  workspaces        WorkspaceMember[]
  invitationsSent   WorkspaceInvitation[]
  defaultWorkspaceId String?
  defaultWorkspace   Workspace? @relation("UserDefaultWorkspace", ...)
  imageProjects     ImageProject[]
  images            Image[]
  projectsCreated   Project[]       @relation("ProjectCreator")
  projectMemberships ProjectMember[] @relation("ProjectMembership")
  tasksAssigned     ProjectTask[]   @relation("TaskAssignee")
  filesUploaded     ProjectFile[]   @relation("ProjectFileUploader")

  @@map("user")
}

model SeekerProfile {
  id                String    @id @default(cuid())
  userId            String    @unique
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Business Intent
  businessType      String?             // Wat wil je openen?
  conceptDescription String?   @db.Text // Beschrijf je concept
  experienceYears   Int?                // Jaren ervaring in horeca
  hasBusinessPlan   Boolean   @default(false)

  // Search Preferences
  budgetMin         Int?                // Minimum budget (centen)
  budgetMax         Int?                // Maximum budget (centen)
  preferredCities   String[]            // Voorkeur steden
  preferredProvinces String[]           // Voorkeur provincies
  preferredTypes    PropertyType[]      // Voorkeur pand types
  minSurface        Int?                // Minimum m²
  maxSurface        Int?                // Maximum m²

  // Required Features
  mustHaveFeatures  String[]            // Feature keys die must-have zijn
  niceToHaveFeatures String[]           // Feature keys die nice-to-have zijn

  // Notifications
  emailAlerts       Boolean   @default(true)
  pushAlerts        Boolean   @default(false)
  alertFrequency    AlertFrequency @default(DAILY)

  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@map("seeker_profile")
}

model AgentProfile {
  id                String    @id @default(cuid())
  userId            String    @unique
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  agencyId          String
  agency            Agency    @relation(fields: [agencyId], references: [id], onDelete: Cascade)

  // Professional Info
  title             String?             // Functietitel
  phone             String?
  phonePublic       Boolean   @default(false)
  bio               String?   @db.Text
  avatar            String?             // Profielfoto URL

  // Specialization
  specializations   PropertyType[]      // Specialisaties
  regions           String[]            // Werkgebied (steden/provincies)
  languages         String[]            // Gesproken talen

  // Verification
  verified          Boolean   @default(false)
  verifiedAt        DateTime?
  verificationNotes String?

  // Performance Stats (cached, updated periodically)
  listingsCount     Int       @default(0)
  activeListings    Int       @default(0)
  dealsClosedCount  Int       @default(0)
  avgResponseMinutes Int?               // Gemiddelde reactietijd
  rating            Float?              // 1-5 rating

  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([agencyId])
  @@map("agent_profile")
}
```

### 3.3 Agency Models

```prisma
model Agency {
  id                String    @id @default(cuid())

  // Basic Info
  name              String
  slug              String    @unique
  description       String?   @db.Text
  logo              String?             // Logo URL

  // Contact
  email             String?
  phone             String?
  website           String?

  // Address
  address           String?
  city              String?
  postalCode        String?
  province          String?
  country           String    @default("NL")

  // Business Registration
  kvkNumber         String?             // KvK nummer
  vatNumber         String?             // BTW nummer

  // Verification
  verified          Boolean   @default(false)
  verifiedAt        DateTime?
  verificationNotes String?

  // Subscription
  plan              AgencyPlan @default(FREE)
  planExpiresAt     DateTime?
  stripeCustomerId  String?             // Voor betalingen
  stripeSubscriptionId String?

  // Limits based on plan
  maxListings       Int       @default(3)  // FREE = 3
  maxAgents         Int       @default(1)  // FREE = 1

  // Stats (cached)
  totalListings     Int       @default(0)
  activeListings    Int       @default(0)
  totalDeals        Int       @default(0)

  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  members           AgencyMember[]
  invitations       AgencyInvitation[]
  properties        Property[]
  agents            AgentProfile[]

  @@map("agency")
}

model AgencyMember {
  id          String     @id @default(cuid())
  role        AgencyRole @default(AGENT)
  joinedAt    DateTime   @default(now())

  // Relations
  userId      String
  agencyId    String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  agency      Agency     @relation(fields: [agencyId], references: [id], onDelete: Cascade)

  @@unique([userId, agencyId])
  @@index([agencyId])
  @@index([userId])
  @@map("agency_member")
}

model AgencyInvitation {
  id          String     @id @default(cuid())
  email       String
  role        AgencyRole @default(AGENT)
  token       String     @unique @default(cuid())
  message     String?              // Persoonlijk bericht
  expiresAt   DateTime
  acceptedAt  DateTime?
  createdAt   DateTime   @default(now())

  // Relations
  agencyId    String
  invitedById String
  agency      Agency     @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  invitedBy   User       @relation("InvitedBy", fields: [invitedById], references: [id])

  @@index([email])
  @@index([agencyId])
  @@map("agency_invitation")
}
```

### 3.4 Property Models

```prisma
model Property {
  id                String          @id @default(cuid())

  // Ownership
  agencyId          String
  agency            Agency          @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  createdById       String
  createdBy         User            @relation("PropertyCreator", fields: [createdById], references: [id])

  // Basic Info
  title             String
  slug              String          @unique
  description       String?         @db.Text
  shortDescription  String?         // Voor previews (max 200 chars)

  // Location
  address           String
  addressLine2      String?
  city              String
  postalCode        String
  province          String?
  country           String          @default("NL")
  latitude          Float?
  longitude         Float?
  neighborhood      String?         // Buurt/wijk

  // Pricing
  priceType         PriceType
  rentPrice         Int?            // Per maand in CENTEN (dus €4500 = 450000)
  rentPriceMin      Int?            // Voor onderhandelbaar
  salePrice         Int?            // In CENTEN
  salePriceMin      Int?            // Voor onderhandelbaar
  priceNegotiable   Boolean         @default(true)
  servicesCosts     Int?            // Servicekosten per maand (centen)
  depositMonths     Int?            // Aantal maanden borg

  // Dimensions
  surfaceTotal      Int             // Totaal m²
  surfaceCommercial Int?            // Commercieel/horeca m²
  surfaceKitchen    Int?            // Keuken m²
  surfaceStorage    Int?            // Opslag m²
  surfaceTerrace    Int?            // Terras m²
  surfaceBasement   Int?            // Kelder m²
  floors            Int             @default(1)
  ceilingHeight     Float?          // Plafondhoogte in meters

  // Classification
  propertyType      PropertyType
  status            PropertyStatus  @default(DRAFT)

  // Horeca Specifics
  seatingCapacityInside  Int?       // Zitplaatsen binnen
  seatingCapacityOutside Int?       // Zitplaatsen buiten/terras
  standingCapacity       Int?       // Staanplaatsen
  kitchenType       String?         // "none", "basic", "professional", "industrial"
  hasBasement       Boolean         @default(false)
  hasStorage        Boolean         @default(false)
  hasTerrace        Boolean         @default(false)
  hasParking        Boolean         @default(false)
  parkingSpaces     Int?

  // Previous Use
  previousUse       String?         // Beschrijving vorig gebruik
  wasHoreca         Boolean         @default(false)
  previousHorecaType PropertyType?  // Als het horeca was, welk type?
  yearsHoreca       Int?            // Hoe lang was het horeca?

  // Building Info
  buildYear         Int?
  lastRenovation    Int?
  monumentStatus    Boolean         @default(false)  // Monumentaal pand?
  energyLabel       String?         // A+++ tot G

  // Scores (AI/Platform berekend)
  horecaScore       String?         // A+ tot F
  horecaScoreDetails Json?          // Breakdown van de score
  locationScore     Int?            // 1-100
  footfallEstimate  Int?            // Geschatte passanten/dag

  // SEO & Marketing
  metaTitle         String?
  metaDescription   String?
  featured          Boolean         @default(false)  // Homepage featured
  featuredUntil     DateTime?
  boostUntil        DateTime?       // Betaalde boost

  // Availability
  availableFrom     DateTime?
  availableUntil    DateTime?       // Voor tijdelijke verhuur
  minimumLeaseTerm  Int?            // Minimum huurtermijn in maanden

  // Publishing
  publishedAt       DateTime?
  expiresAt         DateTime?       // Auto-expire listing
  viewCount         Int             @default(0)      // Cached view count
  inquiryCount      Int             @default(0)      // Cached inquiry count
  savedCount        Int             @default(0)      // Cached favorites count

  // Admin
  adminNotes        String?         @db.Text
  rejectionReason   String?

  // Timestamps
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  // Relations
  images            PropertyImage[]
  features          PropertyFeature[]
  inquiries         PropertyInquiry[]
  savedBy           SavedProperty[]
  views             PropertyView[]
  imageProjects     ImageProject[]  // Link naar AI processing

  // Indexes voor zoeken
  @@index([agencyId])
  @@index([createdById])
  @@index([city])
  @@index([province])
  @@index([status])
  @@index([propertyType])
  @@index([priceType])
  @@index([publishedAt])
  @@index([status, propertyType])
  @@index([status, city])
  @@index([rentPrice])
  @@index([salePrice])
  @@index([surfaceTotal])

  @@map("property")
}

model PropertyImage {
  id              String    @id @default(cuid())
  propertyId      String
  property        Property  @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  // URLs
  originalUrl     String              // Originele upload
  thumbnailUrl    String?             // Thumbnail (300px)
  mediumUrl       String?             // Medium (800px)
  largeUrl        String?             // Large (1600px)
  enhancedUrl     String?             // AI verbeterde versie

  // Metadata
  type            PropertyImageType @default(INTERIOR)
  caption         String?
  altText         String?
  order           Int       @default(0)
  isPrimary       Boolean   @default(false)  // Hoofdafbeelding

  // AI Processing
  aiProcessed     Boolean   @default(false)
  aiPrompt        String?
  aiStyle         String?             // Style template gebruikt

  // File Info
  filename        String?
  mimeType        String?
  fileSize        Int?                // Bytes
  width           Int?
  height          Int?

  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([propertyId])
  @@index([propertyId, order])
  @@map("property_image")
}

enum PropertyImageType {
  EXTERIOR        // Buitenkant
  INTERIOR        // Binnenkant algemeen
  KITCHEN         // Keuken
  TERRACE         // Terras
  BATHROOM        // Sanitair
  STORAGE         // Opslag/kelder
  FLOORPLAN       // Plattegrond
  LOCATION        // Locatie/buurt
  RENDER          // AI render/visualisatie
  OTHER
}

model PropertyFeature {
  id          String          @id @default(cuid())
  propertyId  String
  property    Property        @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  // Feature Definition
  category    FeatureCategory
  key         String                    // Bijv: "alcohol_license"
  value       String?                   // Bijv: "24_hours" of "true"
  numericValue Int?                     // Voor numerieke waarden
  booleanValue Boolean?                 // Voor ja/nee waarden

  // Verification
  verified    Boolean         @default(false)
  verifiedAt  DateTime?
  verifiedBy  String?                   // Admin user ID
  documentUrl String?                   // Bewijs document

  // Display
  displayOrder Int            @default(0)
  highlighted  Boolean        @default(false)  // Uitgelicht in listing

  @@unique([propertyId, key])
  @@index([propertyId])
  @@index([propertyId, category])
  @@map("property_feature")
}
```

### 3.5 Inquiry & Interaction Models

```prisma
model PropertyInquiry {
  id              String        @id @default(cuid())

  // Parties
  propertyId      String
  property        Property      @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  seekerId        String?       // Null als niet ingelogd
  seeker          User?         @relation("InquirySeeker", fields: [seekerId], references: [id], onDelete: SetNull)

  // Contact Info (voor niet-ingelogde of aanvullende info)
  name            String
  email           String
  phone           String?
  company         String?                 // Bedrijfsnaam indien van toepassing

  // Inquiry Content
  message         String        @db.Text
  intendedUse     String?                 // "restaurant", "cafe", etc.
  conceptDescription String?    @db.Text  // Beschrijving van hun concept
  budget          Int?                    // Budget in centen
  timeline        String?                 // "asap", "1-3 months", etc.
  financing       String?                 // "eigen", "bank", "investor"

  // Source Tracking
  source          InquirySource @default(WEBSITE)
  utmSource       String?
  utmMedium       String?
  utmCampaign     String?
  referrer        String?

  // Status & Assignment
  status          InquiryStatus @default(NEW)
  assignedToId    String?
  assignedTo      User?         @relation("InquiryAssignee", fields: [assignedToId], references: [id], onDelete: SetNull)

  // Agent Notes (intern, niet zichtbaar voor seeker)
  agentNotes      String?       @db.Text
  qualityScore    Int?                    // 1-5 lead kwaliteit
  priority        String?                 // "hot", "warm", "cold"

  // Follow-up
  viewingDate     DateTime?
  viewingNotes    String?
  lastContactAt   DateTime?
  nextFollowUpAt  DateTime?
  followUpCount   Int           @default(0)

  // Outcome
  closedAt        DateTime?
  closedReason    String?                 // Reden van sluiten
  dealValue       Int?                    // Waarde van deal (indien gewonnen)

  // Timestamps
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([propertyId])
  @@index([seekerId])
  @@index([assignedToId])
  @@index([status])
  @@index([createdAt])
  @@map("property_inquiry")
}

model SavedProperty {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  propertyId  String
  property    Property  @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  // Optional notes
  notes       String?   @db.Text
  folder      String?             // Voor organisatie ("favorites", "maybe", "compare")

  savedAt     DateTime  @default(now())

  @@unique([userId, propertyId])
  @@index([userId])
  @@index([propertyId])
  @@map("saved_property")
}

model PropertyView {
  id          String    @id @default(cuid())
  propertyId  String
  property    Property  @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  userId      String?             // Null als niet ingelogd
  user        User?     @relation(fields: [userId], references: [id], onDelete: SetNull)

  // Session tracking
  sessionId   String?             // Voor anonymous tracking
  ipHash      String?             // Gehashte IP voor unique views

  // View details
  viewedAt    DateTime  @default(now())
  duration    Int?                // Seconden op pagina
  source      String?             // "search", "direct", "email", "social"
  deviceType  String?             // "mobile", "desktop", "tablet"

  // Engagement
  viewedImages      Boolean @default(false)
  viewedMap         Boolean @default(false)
  viewedContact     Boolean @default(false)
  clickedPhone      Boolean @default(false)
  clickedEmail      Boolean @default(false)
  savedProperty     Boolean @default(false)
  madeInquiry       Boolean @default(false)

  @@index([propertyId])
  @@index([userId])
  @@index([viewedAt])
  @@index([propertyId, viewedAt])
  @@map("property_view")
}
```

### 3.6 Search Alert Model

```prisma
model SearchAlert {
  id            String          @id @default(cuid())
  userId        String
  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Alert Info
  name          String                    // "Café in Amsterdam"
  active        Boolean         @default(true)

  // Search Criteria (stored as JSON for flexibility)
  criteria      Json                      // Alle filter criteria

  // Structured criteria for common filters (voor queries)
  cities        String[]
  provinces     String[]
  propertyTypes PropertyType[]
  priceMin      Int?
  priceMax      Int?
  surfaceMin    Int?
  surfaceMax    Int?
  priceType     PriceType?
  mustHaveFeatures String[]

  // Notification Settings
  frequency     AlertFrequency  @default(DAILY)
  emailEnabled  Boolean         @default(true)
  pushEnabled   Boolean         @default(false)

  // Stats
  lastSentAt    DateTime?
  matchCount    Int             @default(0)  // Totaal matches ooit
  lastMatchCount Int            @default(0)  // Matches sinds laatste notificatie

  // Timestamps
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  @@index([userId])
  @@index([active])
  @@map("search_alert")
}
```

### 3.7 ImageProject Update (Link naar Property)

```prisma
// AANGEPAST: Toevoegen van optionele property link
model ImageProject {
  id              String        @id @default(cuid())
  workspaceId     String
  workspace       Workspace     @relation(...)
  userId          String
  user            User          @relation(...)

  // NIEUW: Optionele link naar Property
  propertyId      String?
  property        Property?     @relation(fields: [propertyId], references: [id], onDelete: SetNull)

  name            String
  styleTemplateId String        @default("modern")
  roomType        String?
  thumbnailUrl    String?

  status          ProjectStatus @default(PENDING)
  imageCount      Int           @default(0)
  completedCount  Int           @default(0)

  images          Image[]

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([workspaceId])
  @@index([userId])
  @@index([propertyId])  // NIEUW
  @@map("image_project")
}
```

---

## 4. FEATURE KEYS REFERENCE

### 4.1 License Features (Vergunningen)

| Key | Values | Beschrijving |
|-----|--------|--------------|
| `alcohol_license` | `none`, `day`, `evening`, `24h` | Alcoholvergunning |
| `terrace_license` | `true/false` + `m²` in numericValue | Terrasvergunning |
| `music_license` | `none`, `background`, `live`, `dj` | Muziekvergunning |
| `kitchen_license` | `true/false` | Horeca exploitatievergunning |
| `hotel_license` | `true/false` | Hotelvergunning |
| `night_permit` | `true/false` | Nachtvergunning (na 01:00) |
| `gambling_license` | `true/false` | Kansspelvergunning |
| `delivery_license` | `true/false` | Bezorgvergunning |

### 4.2 Facility Features (Faciliteiten)

| Key | Values | Beschrijving |
|-----|--------|--------------|
| `kitchen_type` | `none`, `basic`, `professional`, `industrial` | Type keuken |
| `extraction` | `none`, `standard`, `industrial` | Afzuiging |
| `cold_storage` | `true/false` + m² | Koeling |
| `freezer_storage` | `true/false` + m² | Vriesruimte |
| `gas_connection` | `true/false` | Gasaansluiting |
| `three_phase_power` | `true/false` | Krachtstroom |
| `grease_trap` | `true/false` | Vetafscheider |
| `dishwasher_setup` | `true/false` | Afwasmachine aansluiting |
| `bar_setup` | `true/false` | Bar aanwezig |
| `tap_system` | `none`, `basic`, `professional` | Tapsysteem |

### 4.3 Utility Features (Voorzieningen)

| Key | Values | Beschrijving |
|-----|--------|--------------|
| `parking_public` | `true/false` + distance | Openbaar parkeren |
| `parking_private` | `true/false` + count | Eigen parkeren |
| `loading_zone` | `true/false` | Laad/loszone |
| `storage_internal` | `true/false` + m² | Interne opslag |
| `storage_external` | `true/false` + m² | Externe opslag |
| `basement` | `true/false` + m² | Kelder |
| `attic` | `true/false` + m² | Zolder |
| `outdoor_area` | `true/false` + m² | Buitenruimte |
| `delivery_entrance` | `true/false` | Aparte leveranciersingang |

### 4.4 Accessibility Features

| Key | Values | Beschrijving |
|-----|--------|--------------|
| `wheelchair_accessible` | `true/false` | Rolstoeltoegankelijk |
| `accessible_toilet` | `true/false` | Invalidentoilet |
| `elevator` | `true/false` | Lift aanwezig |
| `ground_floor` | `true/false` | Begane grond |
| `step_free_entrance` | `true/false` | Drempelloos |
| `public_transport_distance` | meters | Afstand OV |
| `parking_disabled` | `true/false` + count | Invalidenparkeren |

---

## 5. INDEXING STRATEGIE

### 5.1 Search Performance Indexes

```prisma
// Op Property model
@@index([status, city])                    // Zoeken in stad
@@index([status, province])                // Zoeken in provincie
@@index([status, propertyType])            // Zoeken op type
@@index([status, priceType])               // Huur vs koop
@@index([status, rentPrice])               // Prijsfilter huur
@@index([status, salePrice])               // Prijsfilter koop
@@index([status, surfaceTotal])            // Oppervlakte filter
@@index([city, propertyType, status])      // Compound search
@@index([publishedAt])                     // Nieuwste eerst
@@index([featured, publishedAt])           // Featured listings
```

### 5.2 Analytics Indexes

```prisma
// PropertyView
@@index([propertyId, viewedAt])            // Views per property over tijd
@@index([viewedAt])                        // Totale views per dag

// PropertyInquiry
@@index([propertyId, createdAt])           // Inquiries per property
@@index([assignedToId, status])            // Agent workload
@@index([status, createdAt])               // Pipeline overview
```

---

## 6. MIGRATIE STRATEGIE

### 6.1 Fase 1: Additive Changes

```sql
-- Nieuwe enums toevoegen (geen breaking changes)
ALTER TYPE "UserRole" ADD VALUE 'seeker';
ALTER TYPE "UserRole" ADD VALUE 'agent';

-- Nieuwe tabellen toevoegen
CREATE TABLE "agency" (...);
CREATE TABLE "agency_member" (...);
CREATE TABLE "property" (...);
-- etc.
```

### 6.2 Fase 2: Data Migration

```typescript
// Bestaande users met role 'user' worden 'seeker'
await prisma.user.updateMany({
  where: { role: 'user' },
  data: { role: 'seeker' }
});

// Optioneel: Workspace → Agency migratie
// (alleen als we willen dat bestaande workspaces agencies worden)
```

### 6.3 Fase 3: Cleanup (Later)

```sql
-- Pas na volledige migratie en testing
-- Verwijder oude/ongebruikte tabellen indien nodig
```

---

## 7. OPEN DESIGN VRAGEN

### Te Beantwoorden

| # | Vraag | Impact |
|---|-------|--------|
| 1 | Willen we soft deletes op Properties? | Data model, GDPR |
| 2 | Hoe lang bewaren we PropertyViews? | Storage, privacy |
| 3 | Moeten Inquiries anoniem kunnen? | Auth flow |
| 4 | Willen we prijshistorie bijhouden? | Extra model nodig |
| 5 | Hoe berekenen we HorecaScore? | Algorithm, data needed |
| 6 | Multi-language support nodig? | Content model |
| 7 | Willen we draft/revision systeem? | Complexiteit |

---

*Document gegenereerd voor Horecagrond Database Design*
