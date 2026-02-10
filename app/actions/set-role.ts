"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { UserRole } from "@/types/user";

const ALLOWED_ROLES: UserRole[] = ["seeker", "agent"];

export async function setUserRole(role: string): Promise<{ success?: boolean; error?: string }> {
  // Validate role
  if (!ALLOWED_ROLES.includes(role as UserRole)) {
    return { error: "Ongeldige rol" };
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { error: "Niet ingelogd" };
  }

  // Don't allow changing role if already set to admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role === "admin") {
    return { error: "Admin rol kan niet gewijzigd worden" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: role as "seeker" | "agent" },
  });

  return { success: true };
}
