import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get("ids")?.split(",").filter(Boolean) || [];

  if (ids.length === 0 || ids.length > 4) {
    return NextResponse.json({ properties: [] });
  }

  const properties = await prisma.property.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      title: true,
      slug: true,
      city: true,
      address: true,
      propertyType: true,
      priceType: true,
      rentPrice: true,
      salePrice: true,
      surfaceTotal: true,
      surfaceKitchen: true,
      surfaceTerrace: true,
      seatingCapacityInside: true,
      seatingCapacityOutside: true,
      floors: true,
    },
  });

  return NextResponse.json({ properties });
}
