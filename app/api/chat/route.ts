import {
  streamText,
  tool,
  convertToModelMessages,
  stepCountIs,
  type UIMessage,
} from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { getModel } from "@/lib/ai/model";
import { NextResponse } from "next/server";

export const maxDuration = 30;

const systemPrompt = `Je bent de Horecagrond Assistent, een vriendelijke AI die horeca-ondernemers helpt bij het vinden van het perfecte horecapand in Nederland.

Je kunt panden zoeken, details opvragen, vergelijken, en advies geven over locaties en horecaconcepten.
Antwoord altijd in het Nederlands. Wees beknopt maar behulpzaam.
We hebben panden in steden als Amsterdam, Rotterdam, Utrecht, Den Haag, Eindhoven, Groningen, Maastricht, Arnhem, Tilburg, Leiden, Breda en Nijmegen.
Types: restaurants, cafés, bars, hotels, lunchrooms, dark kitchens, bakkerijen, eetcafés, bistro's en meer.
Als iemand naar panden zoekt, beschrijf kort wat we hebben en verwijs naar het aanbod.
Als iemand zegt "en in [stad]?" of "ook in [stad]?", begrijp dat ze hetzelfde type pand zoeken maar in een andere stad.
Als iemand zegt "iets goedkopers" of "groter", pas de vorige zoekcriteria aan.
Onthoud de context van het gesprek.`;

// Tools available for the LLM to call
const chatTools = {
  searchProperties: tool({
    description: "Zoek horecapanden op basis van criteria",
    inputSchema: z.object({
      city: z.string().optional().describe("Stad om in te zoeken"),
      type: z
        .string()
        .optional()
        .describe("Type pand (RESTAURANT, CAFE, BAR, HOTEL, etc.)"),
      maxPrice: z
        .number()
        .optional()
        .describe("Maximum huurprijs in euro per maand"),
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
          salePrice: true,
          surfaceTotal: true,
          latitude: true,
          longitude: true,
          images: { select: { originalUrl: true }, take: 4 },
        },
        take: 5,
        orderBy: { publishedAt: "desc" },
      });

      return properties.map((p) => ({
        title: p.title,
        slug: p.slug,
        url: `/aanbod/${p.slug}`,
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
};

export async function POST(req: Request) {
  try {
    // Auth + rate limit
    const session = await auth.api.getSession({ headers: req.headers });
    const identifier =
      session?.user?.id || req.headers.get("x-forwarded-for") || "anonymous";
    const rateLimitResult = await checkRateLimit(identifier, "ai");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const { messages }: { messages?: UIMessage[] } = await req.json();
    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages payload" },
        { status: 400 }
      );
    }

    const modelMessages = await convertToModelMessages(messages);
    const { model, supportsTools } = await getModel();

    const result = streamText({
      model,
      system: systemPrompt,
      messages: modelMessages,
      ...(supportsTools
        ? {
            tools: chatTools,
            stopWhen: stepCountIs(5),
          }
        : {}),
    });

    // Use UIMessage stream protocol for compatibility with useChat() hook
    return result.toUIMessageStreamResponse({
      onError: () =>
        "Er ging iets mis tijdens het verwerken van je vraag. Probeer het opnieuw.",
    });
  } catch (error) {
    console.error("[api/chat] Failed to handle chat request:", error);
    return NextResponse.json(
      {
        error:
          "Er ging iets mis tijdens het verwerken van je vraag. Probeer het opnieuw.",
      },
      { status: 500 }
    );
  }
}
