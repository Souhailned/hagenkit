#!/bin/bash
# Lint check hook - runs after file edits
# Exit 0 = success, Exit 2 = block with feedback

cd "$CLAUDE_PROJECT_DIR" || exit 0

# Get the edited file from stdin
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty')

# Only lint TypeScript/JavaScript files
if [[ "$FILE_PATH" == *.ts ]] || [[ "$FILE_PATH" == *.tsx ]] || [[ "$FILE_PATH" == *.js ]] || [[ "$FILE_PATH" == *.jsx ]]; then
  # Run ESLint on the specific file (quick check)
  if command -v bun &> /dev/null; then
    LINT_OUTPUT=$(bun run lint --quiet "$FILE_PATH" 2>&1)
    LINT_EXIT=$?
    
    if [ $LINT_EXIT -ne 0 ]; then
      # Return feedback but don't block
      echo "⚠️ Lint issues found in $FILE_PATH"
      echo "$LINT_OUTPUT" | head -10
    fi
  fi
fi

exit 0
