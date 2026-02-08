#!/bin/bash
# Build check hook - runs when Claude finishes responding
# Exit 0 = success, Exit 2 = block with feedback

cd "$CLAUDE_PROJECT_DIR" || exit 0

# Only run build check if TypeScript files were modified
MODIFIED_TS=$(git diff --name-only HEAD 2>/dev/null | grep -E '\.(ts|tsx)$' | head -1)

if [ -n "$MODIFIED_TS" ]; then
  echo "🔨 Checking TypeScript compilation..."
  
  if command -v bun &> /dev/null; then
    # Quick type check without full build
    TSC_OUTPUT=$(bun tsc --noEmit 2>&1)
    TSC_EXIT=$?
    
    if [ $TSC_EXIT -ne 0 ]; then
      echo "❌ TypeScript errors found:"
      echo "$TSC_OUTPUT" | head -20
      
      # Return as JSON feedback
      jq -n '{
        hookSpecificOutput: {
          hookEventName: "Stop",
          reason: "TypeScript errors detected",
          details: $details
        }
      }' --arg details "$TSC_OUTPUT"
      
      exit 2  # Block and provide feedback
    else
      echo "✅ TypeScript check passed"
    fi
  fi
fi

exit 0
