// Next.js 16+ Proxy — Horecagrond auth + role protection
// Uses auth.api.getSession() for database-backed session checks

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session with full database validation
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect authenticated users away from auth pages
  if (session && ["/sign-in", "/sign-up"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protected routes — require authentication
  const protectedPaths = ["/dashboard", "/onboarding"];
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  if (!session && isProtectedPath) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Role-based route protection (session exists at this point)
  if (session && pathname.startsWith("/dashboard")) {
    const userRole = (session.user as { role?: string })?.role || "seeker";

    // Admin-only routes
    if (pathname.startsWith("/dashboard/admin") && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Agent-only routes
    const agentOnlyPaths = ["/dashboard/panden", "/dashboard/leads", "/dashboard/videos"];
    const isAgentOnly = agentOnlyPaths.some((path) => pathname.startsWith(path));
    if (isAgentOnly && userRole === "seeker") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Seeker-only routes
    const seekerOnlyPaths = ["/dashboard/favorieten", "/dashboard/alerts"];
    const isSeekerOnly = seekerOnlyPaths.some((path) => pathname.startsWith(path));
    if (isSeekerOnly && userRole === "agent") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
