"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPermission, type UserRole } from "@/lib/rbac";
import type { ActionResult } from "@/types/actions";

/**
 * Get the current session with the user's role.
 * Uses the session's additionalFields (no extra DB query needed).
 */
export async function getSessionWithRole() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;
  return {
    userId: session.user.id,
    role: ((session.user as Record<string, unknown>).role ?? "seeker") as UserRole,
    session,
  };
}

/**
 * Server action guard: require a specific permission.
 * Returns ActionResult with userId + role on success.
 */
export async function requirePermission(
  permission: string
): Promise<ActionResult<{ userId: string; role: UserRole }>> {
  const ctx = await getSessionWithRole();
  if (!ctx) return { success: false, error: "Niet ingelogd" };
  if (!hasPermission(ctx.role, permission)) {
    return { success: false, error: "Geen toegang" };
  }
  return { success: true, data: { userId: ctx.userId, role: ctx.role } };
}

/**
 * Page-level guard: require a specific permission or redirect.
 * For use in Server Components (page.tsx).
 */
export async function requirePagePermission(
  permission: string,
  redirectTo = "/dashboard"
): Promise<{ userId: string; role: UserRole }> {
  const ctx = await getSessionWithRole();
  if (!ctx) redirect("/sign-in");
  if (!hasPermission(ctx.role, permission)) redirect(redirectTo);
  return { userId: ctx.userId, role: ctx.role };
}
