// Next.js 16+ Proxy with full session validation
// Uses auth.api.getSession() for database-backed session checks
// Ref: https://www.better-auth.com/docs/integrations/next

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session with full database validation (Next.js 16+ with nodejs runtime)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect authenticated users away from auth pages
  if (session && ["/sign-in", "/sign-up"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users away from protected routes
  if (!session) {
    const protectedPaths = ["/dashboard", "/admin", "/onboarding", "/settings", "/app-ideas"];

    const isProtectedPath = protectedPaths.some((path) =>
      pathname.startsWith(path)
    );

    if (isProtectedPath) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Note: Next.js 16 proxy always runs on Node.js runtime (no config needed)
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/onboarding",
    "/settings/:path*",
    "/app-ideas/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
