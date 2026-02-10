"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function setUserRole(role: "seeker" | "agent") {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { error: "Niet ingelogd" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role },
  });

  return { success: true };
}
