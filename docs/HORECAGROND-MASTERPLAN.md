# HORECAGROND MASTERPLAN

> **Doel:** Transformatie van HagenKit naar een horecavastgoed platform
> **Status:** Planning fase - Nog geen implementatie
> **Laatste update:** 2026-01-22

---

## INHOUDSOPGAVE

1. [Project Visie](#1-project-visie)
2. [Stakeholders & Rollen](#2-stakeholders--rollen)
3. [Herbruikbare Assets](#3-herbruikbare-assets)
4. [Database Architectuur](#4-database-architectuur)
5. [Implementatie Fases](#5-implementatie-fases)
6. [Technische Dependencies](#6-technische-dependencies)
7. [Open Vragen](#7-open-vragen)

---

## 1. PROJECT VISIE

### Wat bouwen we?
Een **niche vastgoedplatform** specifiek voor horecabedrijven met:
- Slimme zoekfunctionaliteit voor horeca-ondernemers
- Professionele listing tools voor makelaars
- AI-gestuurde foto verbetering (Proppi)
- Markt intelligence via MCP webcrawler

### Unique Selling Points
| Feature | Beschrijving | Status |
|---------|--------------|--------|
| AI Foto Verbetering | Interieur fotos optimaliseren | Bestaand (Proppi) |
| MCP Webcrawler | Automatisch aanbod scrapen | Bestaand |
| Horeca-specifieke Filters | Vergunningen, keuken, terras | Te bouwen |
| Business Case Calculator | Omzet/rendement berekening | Te bouwen |
| Concept Visualisatie | AI renders van jouw concept | Uitbreiding Proppi |

---

## 2. STAKEHOLDERS & ROLLEN

### 2.1 Rol Definitie

```
┌─────────────────────────────────────────────────────────────────┐
│  HUIDIGE ROLLEN                    NIEUWE ROLLEN                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  UserRole {                        UserRole {                   │
│    user    ──────────────────────►   seeker   (zoeker)         │
│    admin   ──────────────────────►   agent    (makelaar)       │
│  }                                   admin    (platform)        │
│                                    }                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Rol Rechten Matrix

| Actie | Seeker | Agent | Admin |
|-------|--------|-------|-------|
| Panden zoeken/bekijken | ✅ | ✅ | ✅ |
| Favorieten opslaan | ✅ | ❌ | ✅ |
| Aanvraag doen | ✅ | ❌ | ✅ |
| Pand toevoegen | ❌ | ✅ | ✅ |
| Leads ontvangen | ❌ | ✅ | ✅ |
| AI foto's verbeteren | ✅ (limited) | ✅ | ✅ |
| Team beheren | ❌ | ✅ | ✅ |
| Platform beheer | ❌ | ❌ | ✅ |
| Alle users zien | ❌ | ❌ | ✅ |

### 2.3 User Journeys

#### Seeker (Horeca Ondernemer)
```
Landing → Sign-up → Onboarding (seeker) → Dashboard
                         │
                         ├─ Zoeken
                         ├─ Favorieten beheren
                         ├─ Aanvragen versturen
                         ├─ Alerts instellen
                         └─ AI Visualisaties maken
```

#### Agent (Makelaar)
```
Landing → Sign-up → Onboarding (agent) → Verificatie → Dashboard
                         │
                         ├─ Kantoor aanmaken
                         ├─ Panden beheren
                         ├─ Leads afhandelen
                         ├─ AI Foto's verbeteren
                         └─ Analytics bekijken
```

---

## 3. HERBRUIKBARE ASSETS

### 3.1 Database Patterns (100% herbruikbaar)

| Pattern | Huidige Gebruik | Nieuwe Gebruik |
|---------|-----------------|----------------|
| Multi-tenancy (Workspace) | Project workspaces | Makelaarskantoor (Agency) |
| WorkspaceMember | Team leden | Kantoor medewerkers |
| WorkspaceInvitation | Team uitnodigen | Agent uitnodigen |
| User + Session | Auth | Auth (met nieuwe roles) |
| ImageProject + Image | AI foto verwerking | Property foto's verbeteren |

### 3.2 Server Actions (Direct herbruikbaar)

| Action Groep | File | Hergebruik |
|--------------|------|------------|
| User management | `app/actions/user.ts` | ✅ 100% |
| Workspace CRUD | `app/actions/workspace-settings.ts` | ✅ Rename naar Agency |
| Members | `app/actions/workspace-members.ts` | ✅ 100% |
| Invitations | `app/actions/workspace-invitations.ts` | ✅ 100% |
| Onboarding | `app/actions/onboarding.ts` | 🔄 Aanpassen voor rollen |
| Images | `app/actions/images.ts` | ✅ 100% |
| Email | `app/actions/email.ts` | ✅ 100% |
| Projects | `app/actions/projects.ts` | 🔄 Basis voor Properties |

### 3.3 UI Componenten (Direct herbruikbaar)

| Component | Locatie | Hergebruik |
|-----------|---------|------------|
| ContentCard pattern | `components/dashboard/content-card.tsx` | ✅ |
| Project Wizard | `components/project-wizard/` | 🔄 Wordt Property Wizard |
| Settings tabs | `components/settings/` | ✅ |
| Empty states | `components/dashboard/empty-state*.tsx` | ✅ |
| Data tables | `components/data-table/` | ✅ |
| Sidebar | `components/app-sidebar.tsx` | 🔄 Aanpassen navigatie |
| All shadcn/ui | `components/ui/` | ✅ |

### 3.4 Validatie Schemas (Basis herbruikbaar)

| Schema | File | Status |
|--------|------|--------|
| User settings | `lib/validations/user-settings.ts` | ✅ |
| Workspace | `lib/validations/workspace.ts` | ✅ Rename |
| Project → Property | `lib/validations/project.ts` | 🔄 Aanpassen |

### 3.5 Utilities (100% herbruikbaar)

| Utility | File | Functie |
|---------|------|---------|
| Auth | `lib/auth.ts` | Better Auth setup |
| Email | `lib/notifications/email-service.ts` | Resend integratie |
| Supabase | `lib/supabase.ts` | File storage |
| Prompts | `lib/prompts.ts` | 🔄 Uitbreiden voor property |

### 3.6 Trigger.dev (Herbruikbaar)

| Task | File | Hergebruik |
|------|------|------------|
| process-image | `trigger/process-image.ts` | ✅ Property foto's |

---

## 4. DATABASE ARCHITECTUUR

### 4.1 Strategie: Evolutie vs Revolutie

**Gekozen aanpak: EVOLUTIE**
- Bestaande models behouden waar mogelijk
- Nieuwe models toevoegen
- Geleidelijke migratie

### 4.2 Model Mapping

```
BESTAAND                          NIEUW/AANGEPAST
─────────────────────────────────────────────────────────────
User                         →    User (+ role: seeker/agent/admin)
Workspace                    →    Agency (makelaarskantoor)
WorkspaceMember              →    AgencyMember
WorkspaceInvitation          →    AgencyInvitation
Project                      →    [BEHOUDEN voor intern gebruik]
ImageProject                 →    [BEHOUDEN + koppeling naar Property]
Image                        →    [BEHOUDEN]

                             +    Property (NIEUW - horecapand)
                             +    PropertyImage (NIEUW)
                             +    PropertyFeature (NIEUW - kenmerken)
                             +    PropertyInquiry (NIEUW - leads)
                             +    SavedProperty (NIEUW - favorieten)
                             +    PropertyView (NIEUW - analytics)
                             +    SeekerProfile (NIEUW)
                             +    AgentProfile (NIEUW)
                             +    SearchAlert (NIEUW)
```

### 4.3 Nieuwe Enums

```prisma
// Property Types
enum PropertyType {
  RESTAURANT
  CAFE
  BAR
  HOTEL
  DARK_KITCHEN
  NIGHTCLUB
  FOOD_COURT
  CATERING
  OTHER
}

// Listing Status
enum PropertyStatus {
  DRAFT
  PENDING_REVIEW    // Voor admin moderatie
  ACTIVE
  UNDER_OFFER
  RENTED
  SOLD
  ARCHIVED
  REJECTED
}

// Price Type
enum PriceType {
  RENT
  SALE
  RENT_OR_SALE
}

// Inquiry Status
enum InquiryStatus {
  NEW
  VIEWED
  CONTACTED
  VIEWING_SCHEDULED
  NEGOTIATING
  CLOSED_WON
  CLOSED_LOST
}

// User Role (aangepast)
enum UserRole {
  seeker    // Horeca ondernemer
  agent     // Makelaar
  admin     // Platform beheer
}
```

### 4.4 Core Property Model (Concept)

```prisma
model Property {
  id              String          @id @default(cuid())

  // Ownership
  agencyId        String
  agency          Agency          @relation(...)
  createdById     String
  createdBy       User            @relation(...)

  // Basic Info
  title           String
  description     String?         @db.Text
  slug            String          @unique

  // Location
  address         String
  city            String
  postalCode      String
  province        String?
  country         String          @default("NL")
  latitude        Float?
  longitude       Float?

  // Pricing
  priceType       PriceType
  rentPrice       Int?            // Per maand in centen
  salePrice       Int?            // In centen
  servicesCosts   Int?            // Bijkomende kosten

  // Dimensions
  surfaceTotal    Int             // m²
  surfaceCommercial Int?          // Commercieel m²
  floors          Int             @default(1)

  // Classification
  propertyType    PropertyType
  status          PropertyStatus  @default(DRAFT)

  // Horeca Specifics
  seatingCapacity Int?            // Zitplaatsen
  terraceSqm      Int?            // Terras m²
  kitchenReady    Boolean         @default(false)
  hasBasement     Boolean         @default(false)

  // Scores (AI berekend)
  horecaScore     String?         // A+ tot F
  locationScore   Int?            // 1-100

  // Previous Use
  previousUse     String?         // Wat was het eerder?
  wasHoreca       Boolean         @default(false)

  // Timestamps
  availableFrom   DateTime?
  publishedAt     DateTime?
  expiresAt       DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  // Relations
  images          PropertyImage[]
  features        PropertyFeature[]
  inquiries       PropertyInquiry[]
  savedBy         SavedProperty[]
  views           PropertyView[]

  @@index([agencyId])
  @@index([city])
  @@index([status])
  @@index([propertyType])
  @@index([priceType])
}
```

### 4.5 Property Features (Vergunningen & Kenmerken)

```prisma
model PropertyFeature {
  id          String    @id @default(cuid())
  propertyId  String
  property    Property  @relation(...)

  category    FeatureCategory
  key         String              // Bijv: "alcohol_license"
  value       String?             // Bijv: "24_hours"
  verified    Boolean   @default(false)

  @@unique([propertyId, key])
  @@index([propertyId])
}

enum FeatureCategory {
  LICENSE       // Vergunningen
  FACILITY      // Faciliteiten
  UTILITY       // Voorzieningen
  ACCESSIBILITY // Toegankelijkheid
}
```

**Standaard Feature Keys:**
```
LICENSE:
- alcohol_license (none/day/evening/24h)
- terrace_license (boolean + m²)
- music_license (none/background/live)
- kitchen_license (boolean)
- hotel_license (boolean)

FACILITY:
- kitchen (none/basic/professional)
- extraction (none/standard/industrial)
- cold_storage (boolean)
- gas_connection (boolean)
- three_phase_power (boolean)
- grease_trap (boolean)

UTILITY:
- parking_nearby (boolean + count)
- loading_zone (boolean)
- storage (boolean + m²)
- basement (boolean + m²)
- outdoor_seating (boolean)

ACCESSIBILITY:
- wheelchair_accessible (boolean)
- elevator (boolean)
- public_transport (distance_meters)
```

### 4.6 Inquiry/Lead Model

```prisma
model PropertyInquiry {
  id            String        @id @default(cuid())

  // Parties
  propertyId    String
  property      Property      @relation(...)
  seekerId      String
  seeker        User          @relation(...)

  // Contact Info (voor niet-ingelogde users)
  name          String?
  email         String
  phone         String?

  // Inquiry Details
  message       String        @db.Text
  intendedUse   String?       // Wat wil je openen?
  budget        Int?
  timeline      String?       // Wanneer wil je starten?

  // Status Tracking
  status        InquiryStatus @default(NEW)

  // Agent Notes (intern)
  agentNotes    String?       @db.Text
  assignedToId  String?
  assignedTo    User?         @relation(...)

  // Follow-up
  viewingDate   DateTime?
  lastContactAt DateTime?

  // Timestamps
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([propertyId])
  @@index([seekerId])
  @@index([status])
}
```

### 4.7 Seeker & Agent Profiles

```prisma
model SeekerProfile {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(...)

  // Business Intent
  businessType    String?   // Restaurant, café, etc.
  conceptDescription String? @db.Text
  experience      String?   // Ervaring in horeca

  // Search Preferences
  budgetMin       Int?
  budgetMax       Int?
  preferredCities String[]  // Array van steden
  preferredTypes  PropertyType[]
  minSurface      Int?
  maxSurface      Int?

  // Required Features
  requiredFeatures String[] // Feature keys die must-have zijn

  // Notifications
  emailAlerts     Boolean   @default(true)
  alertFrequency  String    @default("daily") // instant/daily/weekly

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model AgentProfile {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(...)
  agencyId        String
  agency          Agency    @relation(...)

  // Professional Info
  title           String?   // Functie titel
  phone           String?
  phonePublic     Boolean   @default(false)
  bio             String?   @db.Text
  avatar          String?   // URL

  // Specialization
  specializations PropertyType[]
  regions         String[]  // Werkgebied

  // Verification
  verified        Boolean   @default(false)
  verifiedAt      DateTime?

  // Stats (cached)
  listingsCount   Int       @default(0)
  dealsCount      Int       @default(0)
  avgResponseTime Int?      // Minuten

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([agencyId])
}
```

### 4.8 Agency Model (Workspace Evolution)

```prisma
model Agency {
  id              String    @id @default(cuid())

  // Basic Info
  name            String
  slug            String    @unique
  description     String?   @db.Text
  logo            String?

  // Contact
  email           String?
  phone           String?
  website         String?

  // Address
  address         String?
  city            String?
  postalCode      String?

  // Business
  kvkNumber       String?   // KvK registratie
  verified        Boolean   @default(false)
  verifiedAt      DateTime?

  // Subscription
  plan            AgencyPlan @default(FREE)
  planExpiresAt   DateTime?

  // Stats (cached)
  listingsCount   Int       @default(0)
  activeListings  Int       @default(0)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  members         AgencyMember[]
  invitations     AgencyInvitation[]
  properties      Property[]
  agents          AgentProfile[]
}

enum AgencyPlan {
  FREE        // 3 listings
  PRO         // Unlimited + analytics
  ENTERPRISE  // Team + API
}
```

---

## 5. IMPLEMENTATIE FASES

### FASE 0: Voorbereiding (Week 0)
**Doel:** Fundament leggen zonder bestaande code te breken

- [ ] **0.1** Database schema ontwerp finaliseren
- [ ] **0.2** Migratie strategie bepalen
- [ ] **0.3** Feature flags systeem opzetten
- [ ] **0.4** Test omgeving prepareren

### FASE 1: Database & Auth (Week 1-2)
**Doel:** Nieuwe data laag bouwen

- [ ] **1.1** UserRole enum uitbreiden (seeker/agent/admin)
- [ ] **1.2** Agency model toevoegen (gebaseerd op Workspace)
- [ ] **1.3** AgencyMember & AgencyInvitation models
- [ ] **1.4** Property model met alle relaties
- [ ] **1.5** PropertyFeature model (vergunningen/kenmerken)
- [ ] **1.6** PropertyInquiry model (leads)
- [ ] **1.7** SeekerProfile & AgentProfile models
- [ ] **1.8** SavedProperty model (favorieten)
- [ ] **1.9** Database migratie uitvoeren
- [ ] **1.10** Seed data voor development

### FASE 2: Onboarding Flow (Week 2-3)
**Doel:** Gebruikers kunnen registreren met juiste rol

- [ ] **2.1** Rol selectie stap toevoegen aan onboarding
- [ ] **2.2** Seeker onboarding flow (voorkeuren, budget)
- [ ] **2.3** Agent onboarding flow (kantoor, verificatie)
- [ ] **2.4** Server actions voor nieuwe onboarding data
- [ ] **2.5** Redirect logic per rol na onboarding

### FASE 3: Makelaar Dashboard (Week 3-5)
**Doel:** Makelaars kunnen panden beheren

- [ ] **3.1** Makelaar sidebar navigatie
- [ ] **3.2** Dashboard overview pagina
- [ ] **3.3** Panden lijst pagina
- [ ] **3.4** Pand toevoegen wizard (gebaseerd op Project Wizard)
- [ ] **3.5** Pand bewerken pagina
- [ ] **3.6** Foto upload met AI verbetering
- [ ] **3.7** Leads/aanvragen pagina
- [ ] **3.8** Lead detail pagina
- [ ] **3.9** Basis analytics

### FASE 4: Publieke Pagina's (Week 5-6)
**Doel:** Bezoekers kunnen panden bekijken

- [ ] **4.1** Nieuwe landing page
- [ ] **4.2** Zoekpagina met filters
- [ ] **4.3** Pand detail pagina
- [ ] **4.4** Makelaar/kantoor profiel pagina
- [ ] **4.5** Contact formulier (inquiry)
- [ ] **4.6** SEO optimalisatie

### FASE 5: Zoeker Dashboard (Week 6-7)
**Doel:** Zoekers hebben eigen dashboard

- [ ] **5.1** Zoeker sidebar navigatie
- [ ] **5.2** Dashboard met aanbevelingen
- [ ] **5.3** Favorieten pagina
- [ ] **5.4** Mijn aanvragen pagina
- [ ] **5.5** Zoek alerts instellen
- [ ] **5.6** AI visualisatie feature (Proppi uitbreiding)

### FASE 6: Admin Panel (Week 7-8)
**Doel:** Platform beheer

- [ ] **6.1** Users overzicht (alle rollen)
- [ ] **6.2** Agencies beheer
- [ ] **6.3** Properties moderatie
- [ ] **6.4** Verificatie workflows
- [ ] **6.5** Platform analytics

### FASE 7: Integraties (Week 8+)
**Doel:** Unieke waarde toevoegen

- [ ] **7.1** MCP Crawler integratie
- [ ] **7.2** Business case calculator
- [ ] **7.3** Email notificaties (alerts)
- [ ] **7.4** Horeca score berekening

---

## 6. TECHNISCHE DEPENDENCIES

### Per Fase Dependencies

```
FASE 0 (Voorbereiding)
└── Geen dependencies, kan parallel

FASE 1 (Database)
├── Depends on: FASE 0
└── Blocks: FASE 2, 3, 4, 5

FASE 2 (Onboarding)
├── Depends on: FASE 1 (UserRole, Profiles)
└── Blocks: FASE 3, 5 (need role-based routing)

FASE 3 (Makelaar Dashboard)
├── Depends on: FASE 1 (Property, Agency models)
├── Depends on: FASE 2 (agent role flow)
└── Blocks: FASE 4 (need properties to display)

FASE 4 (Publieke Pagina's)
├── Depends on: FASE 1 (Property model)
├── Depends on: FASE 3 (need content)
└── Blocks: FASE 5 (need inquiries working)

FASE 5 (Zoeker Dashboard)
├── Depends on: FASE 1 (SeekerProfile)
├── Depends on: FASE 2 (seeker role flow)
├── Depends on: FASE 4 (need inquiry flow)
└── Blocks: Nothing

FASE 6 (Admin Panel)
├── Depends on: FASE 1, 2, 3
└── Blocks: Nothing (can be parallel with 5)

FASE 7 (Integraties)
├── Depends on: FASE 1-6
└── Blocks: Nothing
```

### Dependency Diagram

```
FASE 0
   │
   ▼
FASE 1 ─────────────────────────────────────────┐
   │                                             │
   ├─────────────┐                               │
   ▼             ▼                               ▼
FASE 2        FASE 6 (parallel mogelijk)      FASE 4
   │             │                               │
   ├─────┬───────┘                               │
   ▼     ▼                                       │
FASE 3   │                                       │
   │     │                                       │
   ├─────┘                                       │
   ▼                                             │
FASE 4 ◄─────────────────────────────────────────┘
   │
   ▼
FASE 5
   │
   ▼
FASE 7
```

---

## 7. OPEN VRAGEN

### Business Vragen
- [ ] **Q1:** Wat is het revenue model? (Subscription, commission, freemium?)
- [ ] **Q2:** Moeten makelaars geverifieerd worden? (KvK check?)
- [ ] **Q3:** Willen we moderatie van listings? (Admin approval?)
- [ ] **Q4:** Geografische scope? (Alleen NL of ook BE/DE?)

### Technische Vragen
- [ ] **Q5:** Behouden we de Project models voor intern gebruik?
- [ ] **Q6:** Hoe koppelen we ImageProject aan Property?
- [ ] **Q7:** Willen we een apart publiek domein? (horecagrond.nl vs app.horecagrond.nl)
- [ ] **Q8:** Hoe integreren we de MCP crawler? (Admin tool, makelaar import, of achtergrond sync?)

### Data Vragen
- [ ] **Q9:** Welke feature keys zijn essentieel voor launch?
- [ ] **Q10:** Hoe berekenen we de Horeca Score?
- [ ] **Q11:** Welke data crawlen we en waar vandaan?

---

## VOLGENDE STAPPEN

1. **Review dit document** - Is de structuur logisch?
2. **Beantwoord open vragen** - Business beslissingen nodig
3. **Database schema finaliseren** - Na vragen beantwoord
4. **Start FASE 0** - Voorbereiding

---

*Document gegenereerd door Claude Code - Horecagrond Planning Session*
