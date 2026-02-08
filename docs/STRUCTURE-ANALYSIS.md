# 🔍 Horecagrond Structure Analysis

## Executive Summary
Gevonden: **12 problemen** die opgeruimd moeten worden.

---

## 🔴 Kritieke Issues

### 1. Duplicate Types (`lib/types/` vs `types/`)
```
lib/types/property.ts   ← VERWIJDEREN
types/property.ts       ← BEHOUDEN (primair)
```
**Actie**: Verwijder `lib/types/`, gebruik alleen `types/`

### 2. Duplicate Test Locations
```
lib/validations/agency.test.ts              ← VERPLAATS
lib/validations/__tests__/property.test.ts  ← OK
lib/horeca-score.test.ts                    ← VERPLAATS
__tests__/property/                         ← OK
```
**Actie**: Alle tests naar `__tests__/` of `**/__tests__/`

### 3. Orphan Files in Root
```
inquiries.ts    ← VERPLAATS naar lib/ of verwijder
proxy.ts        ← VERPLAATS naar lib/ of verwijder
```

### 4. Package Lock Conflict
```
bun.lock         ← BEHOUDEN (primair)
package-lock.json ← VERWIJDEREN (npm artifact)
```

---

## 🟡 Structuur Verbeteringen

### 5. Actions Location (Optioneel)
**Huidige structuur:**
```
app/actions/           ← OK voor Next.js 16
```
**Alternatief (skill recommends):**
```
server/actions/        ← Meer separation of concerns
```
→ Huidige is acceptabel voor Next.js App Router

### 6. Mock Data Location
```
lib/data/mock-properties.ts  ← OK maar beter:
__mocks__/properties.ts      ← Standaard pattern
```

### 7. Blog Components Verspreid
```
components/blog/       ← OK
lib/blog/             ← Verplaats naar components/blog/utils/
```

### 8. Notification Service
```
lib/notifications/     ← OK maar beter:
server/services/notifications/  ← Met andere services
```

---

## 🟢 Suggesties

### 9. Config Consolidatie
```
lib/config.ts         ← Verplaats naar config/
config/               ← Centraliseer alle config hier
```

### 10. Hooks Organisatie
```
hooks/                ← OK maar kan meer structuur:
hooks/
├── use-auth.ts
├── use-data-table.ts
└── index.ts          ← Barrel export toevoegen
```

### 11. Assets Locatie
```
lib/assets/           ← Verplaats naar public/ of components/
```

### 12. Content Templates
```
content/_templates/   ← OK voor content collections
```

---

## ✅ Recommended Structure (Na Cleanup)

```
src/                          ← Optioneel: wrap alles
├── app/
│   ├── (auth)/
│   ├── (marketing)/
│   ├── (dashboard)/          ← Rename van dashboard/
│   ├── api/
│   └── actions/              ← Behouden (Next.js 16 pattern)
├── components/
│   ├── ui/                   ← shadcn (behouden)
│   ├── forms/
│   ├── layout/
│   └── [feature]/
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   ├── utils.ts
│   └── validations/          ← Behouden
├── hooks/
├── types/                    ← Single source of truth
├── config/
└── __tests__/                ← Alle tests hier
```

---

## 📋 Cleanup Checklist

- [ ] Verwijder `lib/types/` (duplicate)
- [ ] Verwijder `package-lock.json` (bun.lock is primair)
- [ ] Verplaats `inquiries.ts` naar `lib/`
- [ ] Verplaats `proxy.ts` naar `lib/` of verwijder
- [ ] Consolideer tests naar `__tests__/` of `**/__tests__/`
- [ ] Verwijder `lib/assets/` als leeg
- [ ] Add barrel exports (`index.ts`) waar nodig

---

## 🤖 Automatische Cleanup Command

```bash
# Verwijder duplicates
rm -rf lib/types/
rm package-lock.json

# Verplaats orphans
mv inquiries.ts lib/
mv proxy.ts lib/

# Consolideer tests (handmatig review nodig)
```
