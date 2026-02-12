import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type") || "";
  const city = searchParams.get("city") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const where: Record<string, unknown> = { status: "ACTIVE" };
  if (type) where.propertyType = type;
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (maxPrice) where.rentPrice = { lte: parseInt(maxPrice) * 100 };

  try {
    const [properties, count] = await Promise.all([
      prisma.property.findMany({
        where: where as any,
        select: {
          title: true,
          slug: true,
          city: true,
          propertyType: true,
          rentPrice: true,
          salePrice: true,
          surfaceTotal: true,
          images: { select: { originalUrl: true }, take: 4 },
        },
        take: 6,
        orderBy: { publishedAt: "desc" },
      }),
      prisma.property.count({ where: where as any }),
    ]);

    return NextResponse.json({
      count,
      properties: properties.map((p) => ({
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
      })),
    });
  } catch (error) {
    console.error("Wizard search error:", error);
    return NextResponse.json({ count: 0, properties: [] }, { status: 500 });
  }
}
