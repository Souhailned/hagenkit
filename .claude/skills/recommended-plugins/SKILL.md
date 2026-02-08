---
name: recommended-plugins
description: Recommended Claude Code plugins for Horecagrond development.
disable-model-invocation: true
---

# Recommended Plugins for Horecagrond

## Install via `/plugin install <name>@claude-plugins-official`

### Code Intelligence (LSP)
```bash
# TypeScript - MUST HAVE
/plugin install typescript-lsp@claude-plugins-official

# Run in terminal first:
npm i -g typescript-language-server typescript
```

### External Integrations
```bash
# GitHub - PR reviews, issues
/plugin install github@claude-plugins-official

# Supabase - Storage, DB
/plugin install supabase@claude-plugins-official

# Vercel - Deployment
/plugin install vercel@claude-plugins-official

# Sentry - Error tracking
/plugin install sentry@claude-plugins-official
```

### Development Workflows
```bash
# Git commit helpers
/plugin install commit-commands@claude-plugins-official

# PR review tools
/plugin install pr-review-toolkit@claude-plugins-official

# Plugin development
/plugin install plugin-dev@claude-plugins-official
```

### Output Styles
```bash
# Educational explanations
/plugin install explanatory-output-style@claude-plugins-official
```

## Demo Marketplace (extra plugins)
```bash
# Add demo marketplace first
/plugin marketplace add anthropics/claude-code

# Then browse with
/plugin
```

## Currently Installed
Check with: `/plugin` → Installed tab

## Priority for Horecagrond

1. **typescript-lsp** - Real-time type errors
2. **github** - PR workflows
3. **supabase** - Storage integration
4. **commit-commands** - Git automation
