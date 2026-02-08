---
name: project-structure-cleanup
description: Clean and organize Next.js project structure. Find orphan files, duplicates, unused imports, and improve architecture.
allowed-tools: Read, Write, Bash, Grep, Glob
---

# Project Structure Cleanup

## Quick Audit Commands

### Find Orphan Files (not imported anywhere)
```bash
# Find all .ts/.tsx files
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next > /tmp/all-files.txt

# Check which are never imported
for f in $(cat /tmp/all-files.txt); do
  basename=$(basename "$f" | sed 's/\.[^.]*$//')
  if ! grep -r "from.*$basename" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -q .; then
    echo "Possibly orphan: $f"
  fi
done
```

### Find Duplicate Type Definitions
```bash
# Look for duplicate type/interface definitions
grep -r "^export (type|interface)" --include="*.ts" . | grep -v node_modules | sort | uniq -d
```

### Find Unused Exports
```bash
# Install knip for comprehensive analysis
bun add -D knip

# Run analysis
bunx knip
```

### Check for package-lock.json (should not exist with Bun)
```bash
find . -name "package-lock.json" -not -path "./node_modules/*"
# Delete if found - Bun uses bun.lockb
```

## Recommended Structure

```
project/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth group (login, register)
│   ├── (dashboard)/       # Protected dashboard group
│   │   ├── layout.tsx
│   │   └── [feature]/
│   ├── (marketing)/       # Public pages group
│   ├── api/               # API routes (minimal, prefer server actions)
│   └── actions/           # Server actions (preferred)
│
├── components/
│   ├── ui/                # Shadcn base components
│   ├── forms/             # Form components
│   ├── layout/            # Layout components (nav, sidebar, footer)
│   └── [feature]/         # Feature-specific components
│
├── lib/
│   ├── prisma.ts          # Prisma client
│   ├── auth.ts            # Auth config
│   ├── utils.ts           # General utilities
│   └── validations/       # Zod schemas
│
├── types/                 # Shared TypeScript types
│   └── index.ts           # Re-export all types
│
├── hooks/                 # Custom React hooks
│
├── trigger/               # Trigger.dev background jobs
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/                # Static assets
│
└── docs/                  # Project documentation
```

## Cleanup Checklist

### 1. Remove Artifacts
```bash
# Remove npm artifacts (we use Bun)
rm -f package-lock.json
rm -f yarn.lock
rm -f pnpm-lock.yaml

# Clean build artifacts
rm -rf .next
rm -rf node_modules/.cache
```

### 2. Consolidate Types
```bash
# All types should be in one place
# Move scattered types to types/ or lib/types/
mkdir -p types

# Find type files to consolidate
find . -name "types.ts" -not -path "./types/*" -not -path "./node_modules/*"
```

### 3. Remove Empty Directories
```bash
find . -type d -empty -not -path "./.git/*" -not -path "./node_modules/*" -delete
```

### 4. Check for Unused Dependencies
```bash
# Using depcheck
bunx depcheck

# Or with knip
bunx knip --dependencies
```

### 5. Fix Import Paths
```bash
# Ensure tsconfig paths are used
# @ should map to ./
grep -r "from '\.\.\/" --include="*.ts" --include="*.tsx" . | grep -v node_modules
# These should use @/ imports instead
```

## Common Issues & Fixes

### Issue: Duplicate Components
```bash
# Find components with same name in different locations
find ./components -name "*.tsx" | xargs -I{} basename {} | sort | uniq -d
```

**Fix**: Consolidate to one location, update imports.

### Issue: Scattered Utility Functions
```bash
# Find util files
find . -name "*util*" -o -name "*helper*" | grep -v node_modules
```

**Fix**: Move to `lib/utils.ts` or create specific util files.

### Issue: Inconsistent Naming
```bash
# Find kebab-case files (should be PascalCase for components)
find ./components -name "*-*" -type f
```

**Fix**: Rename to PascalCase for components.

### Issue: Large Files (> 300 lines)
```bash
find . -name "*.tsx" -not -path "./node_modules/*" | xargs wc -l | sort -n | tail -20
```

**Fix**: Split into smaller components.

## Automated Cleanup Script

```bash
#!/bin/bash
# scripts/cleanup.sh

echo "🧹 Starting project cleanup..."

# Remove lockfiles (Bun only)
rm -f package-lock.json yarn.lock pnpm-lock.yaml

# Clean build cache
rm -rf .next

# Remove empty directories
find . -type d -empty -not -path "./.git/*" -delete

# Check for issues
echo "📊 Running knip analysis..."
bunx knip --reporter compact

echo "✅ Cleanup complete!"
```

## Post-Cleanup Verification

```bash
# Verify project still builds
bun run build

# Verify types
bun tsc --noEmit

# Verify lint
bun run lint
```
