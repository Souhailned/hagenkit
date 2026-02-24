# AI Features Plan — Horecagrond
> Status: Draft · Versie 1.0 · Datum: 2026-02-17

---

## 1. Huidige AI Status (Audit Resultaten)

### ✅ Volledig Geïmplementeerd

| Feature | Bestanden | Beschrijving |
|---------|-----------|--------------|
| **AI SDK Stack** | `lib/fal.ts`, `lib/ai/` | Groq → OpenAI → Ollama fallback chain, fal.ai, Trigger.dev |
| **Semantic Search** | `lib/ai/semantic-search.ts`, `app/actions/ai-search.ts` | Groq LLM parseert natural language naar Prisma filters |
| **Virtual Staging backend** | `app/actions/ai-visualize.ts`, `trigger/inpaint-image.ts` | fal.ai nano-banana-pro/edit, 6 stijlen, polling |
| **Video Generation** | `trigger/generate-video.ts`, `trigger/generate-video-clip.ts` | Kling v2.6/pro, transitions, audio, Supabase storage |
| **AI Description Generator** | `app/actions/ai-description.ts` | 150-200w Dutch, tone selector, fallback chain |
| **Concept Name Generator** | `app/actions/ai-name-generator.ts` | 6 namen, taglines, domain check |
| **Revenue Prediction** | `app/actions/ai-revenue.ts` | Per-m² benchmarks, city multipliers, cost breakdown |
| **Pitch Generator** | `app/actions/ai-pitch.ts` | Elevator pitch + market analysis + financials |
| **Location Scoring** | `app/actions/ai-location-score.ts` | Score 0-100, 6 categorieën, city benchmarks |
| **Lead Scoring** | `lib/lead-scoring.ts` | 5 factoren, 🔥 Hot/Warm/Cold thermometer |
| **Startup Checklist** | `app/actions/ai-checklist.ts` | ~30 taken, context-aware per type |
| **Chat Widget (function calling)** | `app/api/chat/route.ts`, `components/chat/` | Streaming, tool calls (searchProperties, getCities) |
| **Concept Suggestions** | `lib/concept-suggestion.ts`, `components/property/concept-suggestions.tsx` | 5 concepttypes, locatie-aware scoring |
| **Buurt Intelligence** | `lib/buurt-intelligence.ts`, `app/actions/buurt-analysis.ts` | OSM Overpass API, bruisindex, concurrentie |
| **Similar Properties** | `app/actions/recommendations.ts` | 4-strategie matching, matchredenen |
| **Market Intelligence** | `app/actions/market-intelligence.ts` | Prijzen, steden, trends |
| **Search Alerts (schema)** | `app/actions/search-alerts.ts` | SavedSearch model, criteria opslag, frequentie |
| **Rate Limiting** | `lib/rate-limit.ts` | Upstash Redis, per-user AI quota |

### ❌ Ontbreekt (uit PDF Strategie)

| Feature | Prioriteit | Gap |
|---------|-----------|-----|
| **"Droom" Slider UI** | 🔴 Hoog | Backend fal.ai klaar, publieke slider UI mist. Cruciaal als conversion tool |
| **SWOT + Social Posts** | 🔴 Hoog | Pitch/description bestaan, gecombineerde one-click workflow mist |
| **Proactieve Match Emails** | 🔴 Hoog | SearchAlert schema klaar, Trigger.dev job + Resend delivery mist |
| **Deal Room** | 🟡 Medium | NDA-gated document ruimte met AI chatbot |
| **Document Analyse (OCR)** | 🟡 Medium | PDF scanning huurcontracten/jaarcijfers |
| **Financial Health Check** | 🟡 Medium | Jaarcijfers trend analyse, inkoopratio alerting |
| **Sentiment Analyse** | 🟡 Medium | Google/TripAdvisor review scanning concurrenten |
| **Active User Profiling** | 🟡 Medium | Klikgedrag → ML matching engine |
| **xAI Video** | 🟢 Laag | Stub klaar |
| **Vector DB / pgvector** | 🟢 Laag | Niet urgent, LLM parsing werkt voor nu |

---

## 2. Quick Win #1 — "Droom" Slider (Publieke Conversie Tool)

### Doel
Bezoekers die NIET ingelogd zijn, overtuigen een account aan te maken door hen de kracht
van AI te laten *ervaren* op de property detail pagina.

### De Kern van de Gedachte

Dit is geen feature — dit is een **growth loop**.

```
Bezoeker op /aanbod/[slug]
    ↓
Ziet echte foto's van het pand
    ↓
"AI Visie" sectie — 1 concept al zichtbaar (pre-generated bij publicatie)
Before/After slider: links de oude zaak, rechts de droom
    ↓
5 andere stijlen → vaag/gesloten
Video walkthrough → gesloten
    ↓
Klikt op een gesloten stijl
    ↓
Modal: "Maak een gratis account op Horecagrond"
(E-mail + naam OF Google OAuth)
    ↓
Na signup: redirect terug naar pand
3x gratis generaties per dag
Video: Pro/Agent tier
```

### User Experience Design

#### Sectie op property-detail.tsx (openbaar, geen auth)
```
┌──────────────────────────────────────────────────────────────┐
│ ✨ Stel je voor — wat kan dit pand worden?                   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐    │
│ │          VOOR               |          NA             │    │
│ │  [echte foto huidig pand]   | [AI concept: bistro]   │    │
│ │                          ◄●►                         │    │
│ └──────────────────────────────────────────────────────┘    │
│                                                              │
│  AI Concepten:                                               │
│  [✓ Moderne Bistro] [🔒 Espressobar] [🔒 Cocktailbar]       │
│  [🔒 Hotel Boutique] [🔒 Lunchroom] [🔒 Dark Kitchen]       │
│                                                              │
│  🎬 [🔒 Bekijk als video walkthrough — 15 seconden]          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  🔓 Ontgrendel alle AI concepten — Gratis account  │     │
│  │  [Maak gratis account] of [Log in]                 │     │
│  └────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

#### Na Login (zelfde sectie, unlocked)
```
┌──────────────────────────────────────────────────────────────┐
│ ✨ AI Concept Studio                                          │
│                                                              │
│ [Before/After slider — full quality]                         │
│                                                              │
│ Stijl: [Moderne Bistro ✓] [Espressobar] [Cocktailbar]       │
│        [Hotel Boutique] [Lunchroom] [Dark Kitchen]           │
│        [Leeg] [+ Eigen prompt...]                            │
│                                                              │
│ [⚡ Genereer dit concept — ~20 sec]                          │
│                                                              │
│ Gegenereerde concepten:                                      │
│ [img1] [img2] [img3]  ← klikbaar, download/share            │
│                                                              │
│ [🎬 Genereer video walkthrough]  [↓ Download] [↗ Deel]      │
└──────────────────────────────────────────────────────────────┘
```

### Pre-generatie Architectuur

Het kernprincipe: **bezoekers wachten niet**. Bij publicatie van een pand draait al
een Trigger.dev job die 1 concept klaar zet.

```
Property status → PUBLISHED
        ↓
Trigger.dev: auto-generate-demo-concept.ts
        ↓
Kies beste stijl op basis van property type:
  RESTAURANT → restaurant_modern
  CAFE / BAR → cafe_gezellig
  HOTEL      → hotel_boutique
  *          → restaurant_modern (fallback)
        ↓
fal.ai inpaint met eerste foto van property
        ↓
Sla op als PropertyDemoConcept record (public, geen workspace)
        ↓
Property detail pagina toont direct resultaat
```

### Database Uitbreiding

```prisma
model PropertyDemoConcept {
  id           String   @id @default(cuid())
  propertyId   String
  property     Property @relation(fields: [propertyId], references: [id])
  style        String   // "restaurant_modern" etc.
  imageUrl     String   // Supabase public URL
  sourceUrl    String   // originele foto gebruikt
  generatedAt  DateTime @default(now())
  isActive     Boolean  @default(true)

  @@unique([propertyId, style])
  @@index([propertyId])
}
```

### Nieuwe Bestanden

| Bestand | Type | Omschrijving |
|---------|------|--------------|
| `trigger/auto-generate-demo.ts` | Trigger.dev job | Auto-generate bij property publish |
| `app/actions/demo-concepts.ts` | Server action | Haal demo concepts op, maak publieke guest generation mogelijk |
| `components/property/dream-slider.tsx` | Client component | Before/After slider + stijl selector |
| `components/property/dream-studio.tsx` | Client component | Volledige studio voor ingelogde gebruikers |
| `components/property/dream-cta-modal.tsx` | Client component | Modal voor signup/login conversie |
| `prisma/migrations/...` | DB migratie | PropertyDemoConcept tabel |

### Aanpassing Bestaande Bestanden

| Bestand | Wijziging |
|---------|-----------|
| `app/(marketing)/aanbod/[slug]/property-detail.tsx` | Voeg `<DreamSlider>` sectie toe |
| `app/actions/ai-visualize.ts` | Guest mode: zonder workspaceId, gebruik IP rate limit |
| `prisma/schema.prisma` | PropertyDemoConcept model toevoegen |

---

## 3. Quick Win #2 — One-Click Listing Generator

### Doel
Makelaar uploadt ruwe data → AI genereert in <1 minuut een complete listing package:
beschrijvingen voor 3 doelgroepen, SWOT, en social media posts.

### Workflow

```
Makelaar opent property in dashboard
        ↓
[⚡ Genereer volledige listing] knop (1 klik)
        ↓
Parallel AI calls:
  A) Beschrijving × 3 doelgroepen (starter / investeerder / keten)
  B) SWOT analyse (4 kwadranten, property-specifiek)
  C) LinkedIn post (professioneel, 200w)
  D) Instagram caption (emoji's, hashtags, 150w)
        ↓
Tabbed resultaat interface:
  [📝 Beschrijvingen] [📊 SWOT] [💼 LinkedIn] [📱 Instagram]
        ↓
Per tab: [Kopieer] [Bewerk] [Gebruik in listing]
```

### SWOT Template

```typescript
interface SWOTAnalysis {
  strengths: string[];    // Locatie A1, keuken aanwezig, groot terras
  weaknesses: string[];   // Gedateerde inrichting, kleine berging
  opportunities: string[]; // Opkomende buurt, tekort aan koffie concepten
  threats: string[];       // Nieuw winkelcentrum 200m, hoge huur
}
```

### Nieuwe Bestanden

| Bestand | Type | Omschrijving |
|---------|------|--------------|
| `app/actions/ai-listing-package.ts` | Server action | Orchestreert alle 4 AI calls parallel |
| `components/dashboard/listing-generator.tsx` | Client component | Tabbed output interface |

### Aanpassing Bestaande Bestanden

| Bestand | Wijziging |
|---------|-----------|
| `app/dashboard/projects/[id]/page.tsx` | Voeg generator knop toe |
| `app/actions/ai-description.ts` | Uitbreiden met doelgroep parameter |

---

## 4. Quick Win #3 — Proactieve Match Email

### Doel
Zodra een nieuw pand gepubliceerd wordt, krijgen geïnteresseerden die een SavedSearch
hebben aangemaakt automatisch een email.

### Trigger Flow

```
Property status → PUBLISHED
        ↓
Trigger.dev: match-search-alerts.ts
        ↓
Query alle actieve SearchAlerts:
  - Stad/provincie match
  - Property type match
  - Prijs binnen range
  - Oppervlakte binnen range
        ↓
Voor elke match:
  - Check lastNotifiedAt (geen duplicate binnen 24u)
  - Render Resend email template
  - Verzend gepersonaliseerde email
  - Update lastNotifiedAt op SearchAlert
        ↓
Rapporteer: X matches gevonden, Y emails verzonden
```

### Email Template Inhoud

```
Subject: "Nieuw pand gevonden dat past bij jouw zoekopdracht 🏪"

Body:
- Property thumbnail + naam
- Prijs, oppervlakte, stad
- "Dit pand matcht jouw zoekcriteria:"
  ✓ Stad: Amsterdam (jouw zoekgebied)
  ✓ Type: Restaurant (jouw voorkeur)
  ✓ Prijs: €2.800/mnd (binnen jouw budget van €3.500)
- [Bekijk dit pand] CTA knop
- Meld je af / pas zoekopdracht aan link
```

### Nieuwe Bestanden

| Bestand | Type | Omschrijving |
|---------|------|--------------|
| `trigger/match-search-alerts.ts` | Trigger.dev job | Matching + email dispatch |
| `emails/templates/new-property-match.tsx` | React Email | Email template |

### Aanpassing Bestaande Bestanden

| Bestand | Wijziging |
|---------|-----------|
| `prisma/schema.prisma` | `lastNotifiedAt` field op SearchAlert |
| `app/actions/properties.ts` | Trigger job bij status change naar PUBLISHED |

---

## 5. Implementatie Volgorde (Aanbevolen)

```
Week 1:
  Dag 1-2: Quick Win #3 — Proactieve Match Email
    (simpelste, meest directe waarde, geen UI nodig)

  Dag 3-5: Quick Win #2 — One-Click Listing Generator
    (interne tool, geen publieke surface changes)

Week 2:
  Dag 1-5: Quick Win #1 — "Droom" Slider
    (meest complex: DB migratie + Trigger job + 3 nieuwe componenten)
```

---

## 6. Technische Stack Referentie

| Tool | Gebruik | Kosten indicatie |
|------|---------|-----------------|
| fal.ai nano-banana-pro | Virtual staging per image | ~$0.02-0.05 per image |
| Kling v2.6/pro | Video generatie | ~$0.10-0.50 per clip |
| Groq llama-3.3-70b | Tekst generatie | Gratis tier voldoende |
| Trigger.dev | Background jobs | Inclusief in plan |
| Resend | Email delivery | 3.000 gratis/mnd |
| Upstash Redis | Rate limiting | Gratis tier voldoende |

---

## 7. Toekomstige AI Features (Fase 2+)

Op volgorde van businesswaarde:

1. **Deal Room** — NDA-gated document sectie per property + AI Q&A chatbot op uploads
2. **Financial Health Check** — PDF jaarcijfers upload → trend analyse, inkoopratio
3. **Document Analyse (OCR)** — Huurcontract risico-scanning via LLM
4. **Sentiment Analyse** — Google Places reviews scrapen voor locatie intelligence
5. **Active User Profiling** — Klikgedrag opslaan, matching engine verbeteren
6. **AVM (echte ML)** — Train model op eigen transactiedata voor goodwill prijsadvies
7. **Vector Embeddings** — pgvector voor betere semantic property matching

---

*Document bijgehouden door: Claude Code · Horecagrond project*
