# Horecagrond — Strategische Roadmap & Business Plan

## 1. Wie Zijn Je Klanten?

### Primair: Horecamakelaars (B2B SaaS) 💰
**Dit is je geldmachine.** Er zijn ~200 gespecialiseerde horecamakelaars in NL. Ze betalen nu €500-2000/maand aan Funda Business + losse tools.

Wat ze nodig hebben:
- **Listing management** — panden invoeren, beheren, publiceren
- **Lead management** — wie heeft interesse, follow-up, conversie
- **Waardebepaling tools** — onderbouwde prijzen ipv onderbuikgevoel
- **Marketing** — professionele presentaties, social posts, AI-teksten
- **Analytics** — welke panden presteren, waar komen leads vandaan

### Secundair: Horecazoekers (B2C Freemium) 👀
Gratis toegang tot de marktplaats. Ze genereren traffic en leads voor makelaars.
- **Starters** die hun eerste café/restaurant willen openen
- **Bestaande ondernemers** die willen uitbreiden of verhuizen
- **Investeerders** die horeca-vastgoed zoeken als belegging
- **Ketens** (Bagels & Beans, Doppio, etc.) die locaties scouten

### Tertiair: Verkopers/Verhuurders
Pandeigenaren die hun horecapand willen verkopen/verhuren. Komen via de makelaar.

---

## 2. Business Model

### Fase 1: Freemium Marktplaats + Lead Gen
```
Gratis: Zoeken, bekijken, alerts instellen
Betaald (makelaar): €299/mo — onbeperkt listings, lead management, analytics
Premium: €599/mo — AI tools, waardebepaling, staging, deal rooms
Enterprise: €999/mo — API, white-label, multi-kantoor
```

### Fase 2: Transactie-based
- **Succesvergoeding**: 5-10% op bemiddelde deals via platform
- **Boost listings**: €49/listing voor featured placement
- **Waardebepaling rapport**: €149 per rapport (ook voor niet-abonnees)

### Waarom dit werkt:
Funda Business rekent €385/maand voor een BASIC listing pakket. Jij biedt meer voor minder + AI tools die ze nergens anders krijgen.

---

## 3. Feature Roadmap

### Fase 1: Bruikbaar Platform (Week 1-2) 🚀

#### 1.1 Property Wizard (Listing Toevoegen)
**Wat**: Multi-step formulier waarmee een makelaar een pand toevoegt.
**Waarom**: Zonder dit kan niemand het platform gebruiken. Dit is de #1 blocker.
**Hoe**: `app/dashboard/panden/nieuw/page.tsx` — wizard met stappen:
1. Basisinfo (titel, type, adres, beschrijving)
2. Kenmerken (oppervlakte, zitplaatsen, keuken, vergunningen)
3. Financieel (huur/koopprijs, omzet, goodwill)
4. Foto's uploaden (drag & drop, ordering)
5. Preview & publiceren

**Tech**: 
- `PropertyWizard` component met `useReducer` voor state
- Server actions voor `createProperty`, `updateProperty`
- Image upload naar R2/S3 (Cloudflare R2 = gratis egress)
- Auto-save als draft

#### 1.2 Listing Dashboard (Mijn Panden)
**Wat**: Overzicht van alle panden van de makelaar met status, views, inquiries.
**Waarom**: Makelaars moeten hun portfolio kunnen managen.
**Hoe**: `app/dashboard/panden/page.tsx` — tabel/grid met:
- Status badges (concept, actief, onder bod, verkocht)
- Quick actions (bewerken, pauzeren, verwijderen)
- KPI's per pand (views, saves, inquiries)
- Bulk actions (activeren, archiveren)

**Tech**: Al een `/dashboard/panden/[id]` route. Uitbreiden met lijst + CRUD.

#### 1.3 Contactformulier (Lead Capture)
**Wat**: Formulier op property detail page waarmee zoekers interesse tonen.
**Waarom**: Zonder dit geen leads = geen waarde voor makelaars.
**Hoe**: `PropertyInquiry` model bestaat al in schema. Formulier met:
- Naam, email, telefoon, bericht
- Type interesse (bezichtiging, informatie, bod)
- Captcha (Turnstile)
- Email notificatie naar makelaar

**Tech**: Server action `createInquiry` + email via Resend.

#### 1.4 Listing Lifecycle
**Wat**: Status flow voor panden.
**Waarom**: Makelaars moeten de voortgang van elk pand bijhouden.
```
DRAFT → REVIEW → ACTIVE → UNDER_OFFER → SOLD/RENTED → ARCHIVED
```
**Hoe**: Status enum + transitions in Property model. Dashboard toont pipeline view.

---

### Fase 2: Core Platform (Maand 1) 🏗️

#### 2.1 Makelaar Profiel & Agency Page
**Wat**: Publieke pagina per makelaarskantoor met team, panden, reviews.
**Waarom**: Vertrouwen opbouwen bij zoekers. SEO voor makelaars.
**Hoe**: `app/(marketing)/makelaars/[slug]/page.tsx`
- Kantoor info, team leden, specialisaties
- Alle actieve listings
- Reviews/beoordelingen

#### 2.2 Search Alerts (Zoeknotificaties)
**Wat**: Zoekers stellen criteria in → krijgen email als nieuw pand matcht.
**Waarom**: Retentie + makelaars krijgen warme leads (mensen die actief zoeken).
**Hoe**: `SearchAlert` model bestaat al. Implementeer:
- Alert instellen vanuit zoekresultaten
- Cron job die nieuwe listings matcht met alerts
- Email digest (instant/dagelijks/wekelijks)

#### 2.3 Favorieten & Vergelijken
**Wat**: Panden opslaan, lijsten maken, 2-3 panden naast elkaar vergelijken.
**Waarom**: Engagement + data over wat zoekers interessant vinden.
**Hoe**: `SavedProperty` model bestaat al. Vergelijk-feature met side-by-side tabel.

#### 2.4 Lead Management (CRM Light)
**Wat**: Dashboard waar makelaar alle inquiries ziet, status bijhoudt, notities toevoegt.
**Waarom**: DIT is waar makelaars het meest om vragen.
**Hoe**: 
- Kanban board (Nieuw → Contact → Bezichtiging → Onderhandeling → Gesloten)
- Per lead: contact info, notities, gekoppeld pand, follow-up datum
- Email templates voor standaard responses

#### 2.5 Analytics Dashboard
**Wat**: Views, clicks, inquiries per pand. Trend grafieken. Conversie funnel.
**Waarom**: Makelaars willen bewijzen dat hun marketing werkt.
**Hoe**: `PropertyView` model bestaat al. Aggregeer met Prisma + Recharts/Tremor.

---

### Fase 3: AI Differentiators (Maand 2-3) 🤖

#### 3.1 AI Listing Generator (One-Click)
**Wat**: Upload foto's + basisgegevens → AI genereert complete listing tekst.
**Waarom**: Bespaart makelaar 30-60 min per listing. Game changer.
**Hoe**: 
- GPT-4o analyseert foto's + kenmerken
- Genereert: wervende titel, beschrijving, highlights, SEO meta
- 3 varianten: zakelijk, emotioneel, kort
- AI SDK 6 + streaming

#### 3.2 Virtual Staging / "Droom" Feature
**Wat**: AI rendert het pand als ander concept (café → cocktailbar, kroeg → bistro).
**Waarom**: JE KILLER FEATURE. Niemand anders heeft dit. Verkoopt dromen ipv muren.
**Hoe**: 
- Image inpainting pipeline staat al klaar (Qwen)
- Fal.ai voor snelle renders
- "Toon potentie" knop op detail pagina
- 3 concept-opties per pand

#### 3.3 Locatie Intelligentie
**Wat**: Bij elk pand: passantendata, demografie, concurrenten, bereikbaarheid.
**Waarom**: Onderbouwt de prijs. Maakt jou anders dan elke andere makelaar.
**Hoe**:
- CBS open data (inkomen per wijk, bevolking)
- Google Places API (concurrenten in 500m radius)
- OpenStreetMap (OV haltes, parkeren)
- Score per locatie (A/B/C classificatie)

#### 3.4 Smart Search (Semantisch)
**Wat**: "Ik zoek een locatie voor een koffieconcept bij kantoren" → AI begrijpt intent.
**Waarom**: Heel anders dan filters. Trekt tech-savvy gebruikers.
**Hoe**: 
- Embeddings van property descriptions (OpenAI embeddings)
- Vector search met pgvector (Prisma + raw SQL)
- Fallback naar gewone filters

#### 3.5 Automated Valuation Model (AVM)
**Wat**: Voer locatie + type + m² in → geschatte huur/koopprijs met onderbouwing.
**Waarom**: Makelaars gebruiken dit intern. Zoekers krijgen vertrouwen.
**Hoe**:
- Train op openbare transactiedata + eigen data
- Regressiemodel (locatie, type, m², bouwjaar, staat)
- Output: bandbreedte + vergelijkbare transacties

---

### Fase 4: Moat Builders (Maand 4-6) 🏰

#### 4.1 Deal Room
**Wat**: Beveiligde omgeving per pand waar serieuze kopers jaarcijfers, contracten en vergunningen kunnen inzien. AI-chatbot beantwoordt vragen over de documenten.
**Waarom**: Versnelt due diligence van weken naar dagen.
**Hoe**: Document upload + RAG chatbot (LangChain/AI SDK) + NDA signing.

#### 4.2 AI Business Plan Generator
**Wat**: Genereer concept-ondernemingsplan voor een specifiek pand + concept.
**Waarom**: Starters (grootste doelgroep) hebben dit nodig voor de bank.
**Hoe**: GPT-4o + templates + locatiedata → PDF export.

#### 4.3 Makelaar API / White-label
**Wat**: API voor makelaars om listings te embedden op hun eigen website.
**Waarom**: Lock-in. Makelaars worden afhankelijk van jouw data.
**Hoe**: REST API + widget embed code.

#### 4.4 Multi-tenancy & Teams
**Wat**: Meerdere makelaars per kantoor, rollen, permissies.
**Waarom**: Enterprise klanten (grote kantoren).
**Hoe**: Workspace/Agency modellen bestaan al. Uitbreiden met RBAC.

---

## 4. Listing Management (Detail)

### Hoe voegt een makelaar een listing toe?

**Property Wizard** (5-stappen):
```
Stap 1: Basis → Type, titel, adres (auto-complete), beschrijving
Stap 2: Details → m², zitplaatsen, keuken, verdiepingen, bouwjaar
Stap 3: Financieel → Huur/koop, prijs, BTW, servicekosten
Stap 4: Media → Foto's (drag & drop), volgorde, AI-enhance optie
Stap 5: Review → Preview hoe het eruitziet → Publiceren of als concept opslaan
```

**Alternatieve input**:
- Bulk import via CSV/Excel
- "AI Quick Add" — plak een bestaande Funda listing URL → AI haalt alles over

### Lifecycle van een listing:
```
DRAFT ──→ ACTIVE ──→ UNDER_OFFER ──→ SOLD ──→ ARCHIVED
  │                       │
  └── PAUSED ◄────────────┘
```

### Monitoring:
- **Per pand**: views (graph), unieke bezoekers, saves, inquiries, conversieratio
- **Portfolio**: totaal actieve panden, gemiddelde views, response time, pipeline waarde
- **Vergelijking**: jouw panden vs marktgemiddelde

---

## 5. De 3 "Wow" Factoren

### 1. 🎨 "Toon Potentie" Button (Virtual Staging)
Een makelaar uploadt foto's van een verouderd café. Met één klik genereert AI drie renders: als espressobar, als wine bar, als brunchroom. De koper ziet niet wat het IS, maar wat het kan WORDEN.

**Impact**: Conversie stijgt 40-60%. Geen enkele concurrent heeft dit.

### 2. 📊 One-Click Listing (AI Generator)
De makelaar uploadt 5 foto's en vult 10 velden in. De AI genereert binnen 30 seconden: professionele titel, beschrijving in 3 toonsoorten, SEO tags, social media posts, en een SWOT-analyse.

**Impact**: Bespaart 45 min per listing. Bij 20 panden/maand = 15 uur bespaard.

### 3. 🎯 Smart Matching (Proactieve Leads)
Het systeem volgt wat zoekers bekijken en opslaan. Zodra een nieuw pand binnenkomt dat matcht met iemands zoekgedrag, krijgen ze een gepersonaliseerde notificatie. De makelaar krijgt alleen gekwalificeerde leads.

**Impact**: Geen gelukszoekers meer. Alleen serieuze gesprekken.

---

## 6. Eerste Monetization (Vandaag al)

### Direct verkoopbaar:
1. **Waardebepaling rapport** (€149) — AI-onderbouwde waardebepaling van een horecapand. Kan je nu al als losse service aanbieden, zelfs zonder platform.

2. **Listing service** (€99/listing) — "Wij schrijven uw listing met AI". Foto's insturen, professionele tekst terugkrijgen. Marketing service terwijl het platform groeit.

3. **Beta access voor makelaars** (€0) — Bied 5-10 makelaars gratis toegang in ruil voor feedback en content (hun panden op je platform). Dit geeft je echte data en sociale proof.

### Maand 1-2:
4. **Freemium SaaS launch** — Gratis basis, €299/mo voor pro features. Target: 10 betalende makelaars = €2.990 MRR.

---

## 7. Volgende Stappen (Deze Week)

1. **Property Wizard bouwen** — DIT is de #1 prioriteit. Zonder listing input is het platform een demosite.
2. **Contactformulier** — Lead capture op detail pagina.
3. **Makelaar dashboard** — Mijn panden + inquiries overzicht.
4. **Image upload** — R2/S3 pipeline voor property foto's.
5. **Email notificaties** — Resend integratie voor inquiry alerts.

Met deze 5 features heb je een **MVP dat je aan makelaars kunt demonstreren**.
