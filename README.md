# 🏢 Horecagrond

Het platform voor horecapanden in Nederland. Ondernemers vinden hier restaurants, cafés, bars, hotels en meer. Makelaars presenteren hun aanbod aan duizenden ondernemers.

## Tech Stack

- **Next.js 16** + React 19 + TypeScript
- **Prisma 7** + PostgreSQL
- **Better Auth** (authentication)
- **AI SDK 6** + Groq/Ollama (chatbot)
- **MapLibre GL** (interactieve kaarten)
- **Tailwind CSS** + shadcn/ui
- **Bun** (package manager & runtime)

## Quick Start

```bash
# Install dependencies
bun install

# Start PostgreSQL
docker compose up -d postgres

# Push schema & seed data
bun run prisma:push
bun prisma/seed.ts
bun prisma/seed-extra.ts

# Start dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

### 🔍 Zoeken & Ontdekken
- Zoekbalk met autocomplete
- Uitgebreide filters (type, stad, prijs, oppervlakte, radius, bouwperiode)
- Interactieve kaart met clusters
- Vergelijk tot 4 panden
- Recent bekeken carousel
- Bewaar zoekopdracht + alerts

### 🤖 AI Chatbot
- Guided search wizard (type → stad → budget → resultaten)
- Property cards met foto carousel
- Mini map bij resultaten
- Bewaren & bezichtiging knoppen
- AI beschrijving generator voor makelaars
- Context-aware follow-ups
- Ollama (lokaal) of Groq (cloud)

### 🏠 Panden
- Detail pagina met foto galerij
- Contact formulier + bezichtiging aanvragen
- Vergelijkbare panden suggesties
- View tracking
- SEO (Schema.org, sitemap, meta tags)

### 👤 Dashboard
- Role-based (Zoeker / Makelaar / Admin)
- Pand toevoegen wizard (4 stappen)
- Leads beheer + CSV export
- Analytics (views, conversies, trends)
- Profiel & instellingen

### 💡 AI Features (Makelaars)
- AI beschrijving generator
- Listing optimizer (score + tips)
- Lead thermometer
- Buurtintelligentie
- Concurrentieradar
- Haalbaarheidscheck
- Marktprijzen benchmark

### 💳 Monetisatie
- Subscription plans (Starter/Professional/Premium)
- Promoted listings
- Mollie payments (mock mode)

## Environment Variables

See `.env.example` for all required variables.

## Project Stats

- **138+ commits**
- **561 files**
- **86,000+ lines of code**
- **50+ pages**
- **350+ components**
- **60+ server actions**
- **63 seeded properties** across 12 Dutch cities

## License

Private — All rights reserved.
