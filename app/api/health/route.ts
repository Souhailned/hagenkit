import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const start = Date.now();

  let dbStatus = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "error";
  }

  return NextResponse.json({
    status: dbStatus === "ok" ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    responseTimeMs: Date.now() - start,
  });
}
