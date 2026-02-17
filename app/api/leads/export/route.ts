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

  const inquiries = await prisma.propertyInquiry.findMany({
    where: { property: { createdById: session.user.id } },
    include: { property: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Build CSV
  const rows = [
    ["Naam", "Email", "Telefoon", "Pand", "Bericht", "Status", "Datum"].join(","),
    ...inquiries.map((inq) =>
      [
        `"${inq.name}"`,
        `"${inq.email}"`,
        `"${inq.phone || ""}"`,
        `"${inq.property.title}"`,
        `"${(inq.message || "").replace(/"/g, '""')}"`,
        inq.status,
        new Date(inq.createdAt).toLocaleDateString("nl-NL"),
      ].join(",")
    ),
  ].join("\n");

  return new NextResponse(rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
