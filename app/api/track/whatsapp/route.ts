import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
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
