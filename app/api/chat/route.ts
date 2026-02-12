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

const cityMap: Record<string, string> = {
  amsterdam: "Amsterdam", rotterdam: "Rotterdam", utrecht: "Utrecht",
  "den haag": "Den Haag", eindhoven: "Eindhoven", groningen: "Groningen",
  maastricht: "Maastricht", arnhem: "Arnhem", tilburg: "Tilburg",
  leiden: "Leiden", breda: "Breda", nijmegen: "Nijmegen",
};

const typeMap: Record<string, string> = {
  restaurant: "RESTAURANT", restaurants: "RESTAURANT",
  café: "CAFE", cafés: "CAFE", cafe: "CAFE", cafes: "CAFE", koffie: "CAFE",
  bar: "BAR", bars: "BAR", kroeg: "BAR",
  hotel: "HOTEL", hotels: "HOTEL",
  lunchroom: "LUNCHROOM", lunchrooms: "LUNCHROOM", lunch: "LUNCHROOM",
  "dark kitchen": "DARK_KITCHEN", bezorg: "DARK_KITCHEN",
  bakkerij: "BAKERY", bakker: "BAKERY",
  bistro: "BISTRO",
};

// Extract search intent with conversation context (looks at all messages for context)
function extractSearchIntent(messages: { role: string; content: string }[]): {
  city?: string;
  type?: string;
} | null {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) return null;
  const text = lastUser.content.toLowerCase();

  // Current message intent
  const city = Object.keys(cityMap).find((c) => text.includes(c));
  const type = Object.keys(typeMap).find((t) => text.includes(t));

  // If no intent in current message, check conversation context
  // "en in Rotterdam?" → keep type from earlier, change city
  // "iets goedkopers" → keep city+type from earlier
  if (!city && !type) {
    // Look for context in previous messages
    const allUserTexts = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content.toLowerCase());

    let contextCity: string | undefined;
    let contextType: string | undefined;

    for (const prevText of allUserTexts) {
      const prevCity = Object.keys(cityMap).find((c) => prevText.includes(c));
      const prevType = Object.keys(typeMap).find((t) => prevText.includes(t));
      if (prevCity) contextCity = prevCity;
      if (prevType) contextType = prevType;
    }

    // Only use context if current message suggests a follow-up
    const isFollowUp = /^(en |ook |wat |meer|andere|goedkoper|duurder|groter|kleiner)/i.test(text.trim());
    if (isFollowUp && (contextCity || contextType)) {
      // Override with any new mentions in current message
      return {
        city: cityMap[city || contextCity || ""] || undefined,
        type: typeMap[type || contextType || ""] || undefined,
      };
    }

    return null;
  }

  // Also carry forward context from previous messages
  let contextCity: string | undefined;
  let contextType: string | undefined;
  for (const msg of messages.filter((m) => m.role === "user")) {
    const t = msg.content.toLowerCase();
    const c = Object.keys(cityMap).find((k) => t.includes(k));
    const tp = Object.keys(typeMap).find((k) => t.includes(k));
    if (c) contextCity = c;
    if (tp) contextType = tp;
  }

  return {
    city: cityMap[city || contextCity || ""] || undefined,
    type: typeMap[type || contextType || ""] || undefined,
  };
}

// Search properties from DB
async function searchProperties(intent: { city?: string; type?: string }) {
  const where: Record<string, unknown> = { status: "ACTIVE" };
  if (intent.city) where.city = { contains: intent.city, mode: "insensitive" };
  if (intent.type) where.propertyType = intent.type;

  const properties = await prisma.property.findMany({
    where: where as any,
    select: {
      title: true,
      slug: true,
      city: true,
      propertyType: true,
      rentPrice: true,
      salePrice: true,
      surfaceTotal: true,
      latitude: true,
      longitude: true,
      images: { select: { originalUrl: true }, take: 4 },
    },
    take: 4,
    orderBy: { publishedAt: "desc" },
  });

  return properties.map((p) => ({
    title: p.title,
    slug: p.slug,
    city: p.city,
    type: p.propertyType,
    price: p.rentPrice
      ? `€${(p.rentPrice / 100).toLocaleString("nl-NL")}/mnd`
      : p.salePrice
        ? `€${(p.salePrice / 100).toLocaleString("nl-NL")}`
        : "Prijs op aanvraag",
    area: p.surfaceTotal ? `${p.surfaceTotal} m²` : undefined,
    imageUrl: p.images[0]?.originalUrl || null,
    images: p.images.map((img) => img.originalUrl).filter(Boolean),
    lat: p.latitude ? Number(p.latitude) : undefined,
    lng: p.longitude ? Number(p.longitude) : undefined,
  }));
}

const PROPERTIES_MARKER = "\n<!--PROPERTIES:";
const PROPERTIES_END = ":PROPERTIES-->";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const { model, supportsTools } = await getModel();

  const systemPrompt = `Je bent de Horecagrond Assistent, een vriendelijke AI die horeca-ondernemers helpt bij het vinden van het perfecte horecapand in Nederland.

Je kunt panden zoeken, details opvragen, vergelijken, en advies geven over locaties en horecaconcepten.
Antwoord altijd in het Nederlands. Wees beknopt maar behulpzaam.
We hebben panden in steden als Amsterdam, Rotterdam, Utrecht, Den Haag, Eindhoven, Groningen, Maastricht, Arnhem, Tilburg, Leiden, Breda en Nijmegen.
Types: restaurants, cafés, bars, hotels, lunchrooms, dark kitchens, bakkerijen, eetcafés, bistro's en meer.
Als iemand naar panden zoekt, beschrijf kort wat we hebben en verwijs naar het aanbod.
Als iemand zegt "en in [stad]?" of "ook in [stad]?", begrijp dat ze hetzelfde type pand zoeken maar in een andere stad.
Als iemand zegt "iets goedkopers" of "groter", pas de vorige zoekcriteria aan.
Onthoud de context van het gesprek.`;

  const result = streamText({
    model,
    system: systemPrompt,
    messages,
    ...(supportsTools
      ? {
          tools: {
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
                  price: p.rentPrice
                    ? `€${(p.rentPrice / 100).toLocaleString("nl-NL")}/mnd`
                    : "Prijs op aanvraag",
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
          },
        }
      : {}),
  });

  // For non-tool models: inject property cards after stream
  if (!supportsTools) {
    const intent = extractSearchIntent(messages);

    // Create a TransformStream that appends property data
    const encoder = new TextEncoder();
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Pipe the AI stream and append properties
    (async () => {
      try {
        const textStream = result.textStream;
        for await (const chunk of textStream) {
          await writer.write(encoder.encode(chunk));
        }
        // Append property cards if we detected search intent
        if (intent) {
          const properties = await searchProperties(intent);
          if (properties.length > 0) {
            const payload = PROPERTIES_MARKER + JSON.stringify(properties) + PROPERTIES_END;
            await writer.write(encoder.encode(payload));
          }
        }
      } catch (e) {
        console.error("Stream error:", e);
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return result.toTextStreamResponse();
}
