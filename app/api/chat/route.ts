import { streamText, tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

async function getModel(): Promise<{ model: any; supportsTools: boolean }> {
  // 1. Groq (cloud, fast)
  if (process.env.GROQ_API_KEY) {
    const { createGroq } = await import("@ai-sdk/groq");
    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
    return { model: groq("llama-3.3-70b-versatile"), supportsTools: true };
  }
  // 2. Ollama (local, free) via OpenAI-compatible API
  const { createOpenAI } = await import("@ai-sdk/openai");
  const ollama = createOpenAI({
    baseURL: "http://localhost:11434/v1",
    apiKey: "ollama",
  });
  return { model: ollama("llama3.2:3b"), supportsTools: false };
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  const { model, supportsTools } = await getModel();

  const result = streamText({
    model,
    system: `Je bent de Horecagrond Assistent, een vriendelijke AI die horeca-ondernemers helpt bij het vinden van het perfecte horecapand in Nederland.

Je kunt panden zoeken, details opvragen, vergelijken, en advies geven over locaties en horecaconcepten.
Antwoord altijd in het Nederlands. Wees beknopt maar behulpzaam.
We hebben panden in steden als Amsterdam, Rotterdam, Utrecht, Den Haag, Eindhoven, Groningen, Maastricht, Arnhem, Tilburg, Leiden, Breda en Nijmegen.
Types: restaurants, cafés, bars, hotels, lunchrooms, dark kitchens, bakkerijen, eetcafés, bistro's en meer.`,
    messages,
    ...(supportsTools ? { tools: {
      searchProperties: tool({
        description: "Zoek horecapanden op basis van criteria",
        inputSchema: z.object({
          city: z.string().optional().describe("Stad om in te zoeken"),
          type: z.string().optional().describe("Type pand (RESTAURANT, CAFE, BAR, HOTEL, etc.)"),
          maxPrice: z.number().optional().describe("Maximum huurprijs in euro per maand"),
          minArea: z.number().optional().describe("Minimum oppervlakte in m²"),
        }),
        execute: async ({ city, type, maxPrice, minArea }) => {
          const where: Record<string, unknown> = { status: "ACTIVE" };
          if (city) where.city = { contains: city, mode: "insensitive" };
          if (type) where.propertyType = type;
          if (maxPrice) where.rentPrice = { lte: maxPrice * 100 };
          if (minArea) where.surfaceTotal = { gte: minArea };

          const properties = await prisma.property.findMany({
            where: where as any,
            select: {
              title: true,
              slug: true,
              city: true,
              propertyType: true,
              rentPrice: true,
              surfaceTotal: true,
            },
            take: 5,
            orderBy: { publishedAt: "desc" },
          });

          return properties.map((p) => ({
            title: p.title,
            url: `/aanbod/${p.slug}`,
            city: p.city,
            type: p.propertyType,
            price: p.rentPrice ? `€${(p.rentPrice / 100).toLocaleString("nl-NL")}/mnd` : "Prijs op aanvraag",
            area: `${p.surfaceTotal} m²`,
          }));
        },
      }),
      getPropertyCount: tool({
        description: "Tel het aantal beschikbare panden",
        inputSchema: z.object({
          city: z.string().optional(),
          type: z.string().optional(),
        }),
        execute: async ({ city, type }) => {
          const where: Record<string, unknown> = { status: "ACTIVE" };
          if (city) where.city = { contains: city, mode: "insensitive" };
          if (type) where.propertyType = type;
          const count = await prisma.property.count({ where: where as any });
          return { count };
        },
      }),
      getCities: tool({
        description: "Toon beschikbare steden met panden",
        inputSchema: z.object({}),
        execute: async () => {
          const cities = await prisma.property.groupBy({
            by: ["city"],
            where: { status: "ACTIVE" as const },
            _count: { id: true },
            orderBy: { _count: { id: "desc" } },
            take: 20,
          });
          return cities.map((c) => ({ city: c.city, count: c._count.id }));
        },
      }),
    } } : {}),
  });

  return result.toTextStreamResponse();
}
