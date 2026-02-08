#!/bin/bash
# Auto-commit hook after successful build
# Usage: ./scripts/build-and-commit.sh "commit message"

set -e

MESSAGE="${1:-chore: auto-commit after successful build}"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")

echo "🔨 Building project..."
bun run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  
  # Check if there are changes to commit
  if [ -n "$(git status --porcelain)" ]; then
    echo "📦 Committing changes..."
    git add -A
    git commit -m "$MESSAGE" -m "Build passed at $TIMESTAMP"
    echo "✅ Committed: $MESSAGE"
  else
    echo "ℹ️  No changes to commit"
  fi
else
  echo "❌ Build failed!"
  exit 1
fi
