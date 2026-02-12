import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [properties, views, inquiries, favorites] = await Promise.all([
      prisma.property.count({
        where: { createdById: userId, status: "ACTIVE" },
      }),
      prisma.propertyView.count({
        where: {
          property: { createdById: userId },
          viewedAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.propertyInquiry.count({
        where: { property: { createdById: userId } },
      }),
      prisma.favoriteProperty.count({
        where: { property: { createdById: userId } },
      }),
    ]);

    return NextResponse.json({ properties, views, inquiries, favorites });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ properties: 0, views: 0, inquiries: 0, favorites: 0 });
  }
}
