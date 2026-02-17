import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { propertySlug } = await req.json();

    if (propertySlug) {
      // Increment a whatsapp click counter on the property
      await prisma.property.updateMany({
        where: { slug: propertySlug },
        data: { inquiryCount: { increment: 1 } },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
