# AI Feature Migration Plan — Horecagrond

## Doel
Migreer AI image/video pipeline van Trigger.dev naar AI SDK 6 + Next.js API routes.
Surface AI features op pand-detailpagina's voor klanten.

## Storage Beslissing: Cloudflare R2

### Waarom R2?
| | Supabase Storage | Cloudflare R2 |
|--|--|--|
| Opslag | $0.021/GB | **$0.015/GB** |
| Egress | ~$0.09/GB | **GRATIS** |
| Free tier | 1 GB | **10 GB** |
| CDN | Optioneel | **Ingebouwd** |
| S3-compatible | Ja | Ja |

Real-world: Bij 1000 projecten/maand: Supabase ~$500/m vs R2 ~$2/m.

### Strategie
- **Nu**: Supabase storage blijft (al geïntegreerd, werkt)
- **Sprint 2**: Migreer naar Cloudflare R2 (drop-in replacement via S3 SDK)
- **Videos**: R2 voor opslag + optioneel Cloudflare Stream voor streaming

---

## Sprints

### Sprint 0 — Foundation (1-2 dagen)
**Doel**: Infrastructuur klaar voor AI SDK 6 + R2

- [ ] AI SDK 6 installeren + koppelen
- [ ] Cloudflare R2 bucket aanmaken + credentials
- [ ] R2 adapter schrijven (compatible met bestaande lib/supabase.ts interface)
- [ ] API route structuur aanmaken: `app/api/ai/`

### Sprint 1 — Images AI (2-3 dagen)
**Doel**: Trigger.dev vervangen voor images, AI SDK 6 prompts

- [ ] `POST /api/ai/images/process` — vervangt `trigger/process-image.ts`
  - Roept fal.ai direct aan
  - SSE streaming voor progress
  - DB status updates
- [ ] `POST /api/ai/images/inpaint` — vervangt `trigger/inpaint-image.ts`
- [ ] AI SDK 6: `generatePrompt()` op basis van pand-metadata
  - Input: pand type, locatie, ruimte type
  - Output: geoptimaliseerde styling prompt
- [ ] Frontend: progress via EventSource/useChat
- [ ] Trigger.dev imports verwijderen uit `app/actions/images.ts`

### Sprint 2 — Videos AI (3-4 dagen)
**Doel**: Trigger.dev vervangen voor videos, FFmpeg alternatief

- [ ] `POST /api/ai/videos/generate-clip` — vervangt `trigger/generate-video-clip.ts`
  - Parallel clip generatie via `Promise.all()`
  - Kling Video Pro via fal.ai (ongewijzigd)
- [ ] FFmpeg compilatie oplossing:
  - Optie A: Cloudflare Workers + R2 (serverless FFmpeg via WASM)
  - Optie B: Simple concatenatie via fal.ai (als ze dat bieden)
  - Optie C: Keep Trigger.dev alleen voor compilatie (pragmatisch)
- [ ] `POST /api/ai/videos/start` — orchestrator
- [ ] R2 migratie: lib/supabase.ts → lib/storage.ts (R2 adapter)
- [ ] Trigger.dev imports verwijderen uit `app/actions/video-projects.ts`

### Sprint 3 — Pand Integratie (2-3 dagen)
**Doel**: AI features op pand-detailpagina voor klanten

- [ ] Nieuw tabblad "AI Media" op pand detail pagina
  - "Genereer AI foto's" flow (vanuit pand context)
  - "Maak video tour" flow
- [ ] Context-aware prompts: pand-data → AI SDK → fal.ai prompt
  - Gebruik pand type (restaurant, café, hotel, etc.)
  - Gebruik locatie, oppervlakte, beschrijving
- [ ] ImageProject/VideoProject koppelen aan `Property` model (Prisma relatie)
- [ ] Client-facing UI: simpel, clean, geen technische details zichtbaar

### Sprint 4 — Polish & Productie (1-2 dagen)
**Doel**: Stabiel, veilig, schaalbaar

- [ ] Error handling + retry UI
- [ ] Rate limiting op AI API routes
- [ ] Usage tracking per workspace
- [ ] R2 storage volledig migreren (indien niet Sprint 2)
- [ ] Build + type check alles groen

---

## Architectuur Overzicht (na migratie)

```
Pand Detail Pagina
│
├─ "AI Media" tab
│   ├─ "Genereer foto's"
│   │   ├─ POST /api/ai/images/process
│   │   │   ├─ AI SDK: generatePrompt(pandData) → prompt
│   │   │   ├─ fal.ai: nano-banana-pro → resultaat
│   │   │   └─ R2: opslaan + DB update
│   │   └─ EventSource: real-time progress
│   │
│   └─ "Video tour"
│       ├─ POST /api/ai/videos/start
│       │   ├─ Promise.all: clips genereren (Kling via fal.ai)
│       │   ├─ Compilatie (TBD)
│       │   └─ R2: final.mp4 opslaan
│       └─ Polling: status updates
```

---

## Beslissingen Log

| Datum | Beslissing | Reden |
|-------|-----------|-------|
| 2026-02-18 | Cloudflare R2 als storage | Zero egress fees, 10x goedkoper |
| 2026-02-18 | AI SDK 6 voor prompt generatie | Context-aware prompts op basis van pand-data |
| 2026-02-18 | API routes ipv Trigger.dev | Simpeler, geen extra service, SSE voor progress |
| 2026-02-18 | FFmpeg TBD | Serverless max 60s is probleem — onderzoek nodig |

---

## Errors & Blockers

| Blocker | Status | Oplossing |
|---------|--------|-----------|
| FFmpeg in serverless | Open | Onderzoek Cloudflare Workers WASM |
| Supabase → R2 migratie | Planned | S3-compatible, lib/storage.ts adapter |
