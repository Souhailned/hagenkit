---
name: ai-sdk-6-integration
description: Integrate AI SDK 6 for chatbots, agents, and LLM features. Covers useChat, generateText, tool calling, and structured output.
allowed-tools: Read, Write, Bash
---

# AI SDK 6 Integration Guide

## Installation

```bash
bun add ai@beta @ai-sdk/openai@beta @ai-sdk/react@beta
# Optional providers
bun add @ai-sdk/anthropic@beta @ai-sdk/groq@beta
```

## Environment Setup

```env
OPENAI_API_KEY=sk-...
# Or for Anthropic
ANTHROPIC_API_KEY=sk-ant-...
# Or for Groq (open models)
GROQ_API_KEY=gsk_...
```

## Basic Patterns

### Chat API Route
```typescript
// app/api/chat/route.ts
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system: "You are a helpful assistant for a real estate platform.",
    messages,
  });

  return result.toDataStreamResponse();
}
```

### Chat UI Component
```typescript
// components/chat.tsx
"use client";

import { useChat } from "@ai-sdk/react";

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "text-right" : ""}>
            <span className="inline-block p-2 rounded-lg bg-muted">
              {m.content}
            </span>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about properties..."
          className="w-full p-2 border rounded"
          disabled={isLoading}
        />
      </form>
    </div>
  );
}
```

## Tool Calling (Agents)

```typescript
// app/api/agent/route.ts
import { streamText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system: "You are a property search assistant.",
    messages,
    tools: {
      searchProperties: tool({
        description: "Search properties by criteria",
        parameters: z.object({
          city: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          propertyType: z.enum(["apartment", "house", "office"]).optional(),
        }),
        execute: async ({ city, minPrice, maxPrice, propertyType }) => {
          const properties = await prisma.property.findMany({
            where: {
              ...(city && { city }),
              ...(propertyType && { type: propertyType }),
              price: {
                ...(minPrice && { gte: minPrice }),
                ...(maxPrice && { lte: maxPrice }),
              },
            },
            take: 10,
          });
          return properties;
        },
      }),
      
      getPropertyDetails: tool({
        description: "Get detailed info about a specific property",
        parameters: z.object({
          propertyId: z.string(),
        }),
        execute: async ({ propertyId }) => {
          return prisma.property.findUnique({
            where: { id: propertyId },
            include: { images: true, agent: true },
          });
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
```

## Tool Approval (Sensitive Actions)

```typescript
import { tool } from "ai";

const scheduleViewingTool = tool({
  description: "Schedule a property viewing",
  parameters: z.object({
    propertyId: z.string(),
    date: z.string(),
    name: z.string(),
    email: z.string().email(),
  }),
  needsApproval: true, // Requires user confirmation
  execute: async (params) => {
    // Only runs after user approves
    return createViewing(params);
  },
});
```

## Structured Output

```typescript
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const propertyDescriptionSchema = z.object({
  title: z.string(),
  description: z.string(),
  highlights: z.array(z.string()),
  targetAudience: z.string(),
});

export async function generatePropertyListing(property: Property) {
  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: propertyDescriptionSchema,
    prompt: `Generate a compelling listing for this property:
      Type: ${property.type}
      Location: ${property.city}
      Price: €${property.price}
      Features: ${property.features.join(", ")}`,
  });

  return object;
}
```

## Agent with ToolLoopAgent (AI SDK 6)

```typescript
import { ToolLoopAgent } from "ai";
import { openai } from "@ai-sdk/openai";

const propertyAgent = new ToolLoopAgent({
  model: openai("gpt-4o"),
  instructions: "You are a property search and qualification assistant.",
  tools: {
    searchProperties,
    getPropertyDetails,
    checkBudgetQualification,
  },
});

// Use the agent
const result = await propertyAgent.generate({
  prompt: "Find apartments in Amsterdam under €500k",
});
```

## Using Groq (Open Models - Cheaper)

```typescript
import { groq } from "@ai-sdk/groq";

// Use Llama 3.3 70B (free tier available)
const result = await generateText({
  model: groq("llama-3.3-70b-versatile"),
  prompt: "Describe this property...",
});
```

## Pre-qualification Chatbot Example

```typescript
// components/qualification-chat.tsx
"use client";

import { useChat } from "@ai-sdk/react";

export function QualificationChat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/qualify",
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content: "Welkom! Ik help je de perfecte woning te vinden. Wat is je budget?",
      },
    ],
  });

  return (
    <div className="max-w-md mx-auto p-4">
      {/* ... chat UI */}
    </div>
  );
}
```

## Best Practices

1. **Use streaming** for better UX (`streamText` over `generateText`)
2. **Define clear tool schemas** with Zod
3. **Add tool approval** for mutations
4. **Use system prompts** for context
5. **Consider Groq** for cost-effective open models
6. **Implement rate limiting** on chat endpoints
