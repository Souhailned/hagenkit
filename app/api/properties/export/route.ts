import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  // Rate limit
  const rateLimitResult = await checkRateLimit(session.user.id, "export");
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
    );
  }

  const properties = await prisma.property.findMany({
    where: { createdById: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const fmt = (cents: number | null) =>
    cents ? (cents / 100).toFixed(0) : "";

  const rows = [
    ["Titel", "Type", "Status", "Stad", "Adres", "Huurprijs", "Koopprijs", "Oppervlakte", "Views", "Datum"].join(","),
    ...properties.map((p) =>
      [
        `"${p.title}"`,
        p.propertyType,
        p.status,
        `"${p.city}"`,
        `"${p.address}"`,
        fmt(p.rentPrice),
        fmt(p.salePrice),
        p.surfaceTotal,
        p.viewCount,
        new Date(p.createdAt).toLocaleDateString("nl-NL"),
      ].join(",")
    ),
  ].join("\n");

  return new NextResponse(rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="panden-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
