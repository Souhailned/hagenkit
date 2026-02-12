---
name: trigger-dev-jobs
description: Create and manage Trigger.dev background jobs. Use when adding async processing, scheduled tasks, or webhook handlers.
allowed-tools: Read, Write, Bash
---

# Trigger.dev Background Jobs

## Project Setup
- **Version**: Trigger.dev 4.x
- **Config**: `trigger.config.ts`
- **Jobs folder**: `trigger/`

## Creating a New Job

### Basic Task Template
```typescript
import { task, logger } from "@trigger.dev/sdk";

export interface MyTaskPayload {
  id: string;
  // ... other fields
}

export const myTask = task({
  id: "my-task-name",
  maxDuration: 300, // 5 minutes
  retry: {
    maxAttempts: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
    factor: 2,
  },
  run: async (payload: MyTaskPayload) => {
    logger.info("Starting task", { payload });
    
    try {
      // Your logic here
      
      return { success: true };
    } catch (error) {
      logger.error("Task failed", { error });
      throw error;
    }
  },
});
```

### Triggering Jobs

From API route:
```typescript
import { myTask } from "@/trigger/my-task";

await myTask.trigger({ id: "123" });
```

Batch triggering:
```typescript
await myTask.batchTriggerAndWait([
  { payload: { id: "1" } },
  { payload: { id: "2" } },
]);
```

## Existing Jobs

| Job | File | Purpose |
|-----|------|---------|
| inpaint-image | `trigger/inpaint-image.ts` | Virtual staging with AI |
| process-image | `trigger/process-image.ts` | Basic image processing |

## Best Practices

1. **Always set maxDuration** - Prevents runaway jobs
2. **Use logger** - Not console.log
3. **Handle errors gracefully** - Update DB status on failure
4. **Use metadata.set()** - For progress tracking

```typescript
import { metadata } from "@trigger.dev/sdk/v3";

metadata.set("status", {
  step: "processing",
  progress: 50,
});
```

## Development
```bash
# Start trigger dev server
bun run trigger:dev

# Deploy to production
bun run trigger:deploy
```
