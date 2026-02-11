"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Niet ingelogd");
  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin") throw new Error("Geen admin rechten");
  return session.user;
}

// ===== USER MANAGEMENT =====

export async function adminUpdateUserRole(userId: string, newRole: string) {
  await requireAdmin();
  
  if (!["seeker", "agent", "admin"].includes(newRole)) {
    return { success: false, error: "Ongeldige rol" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole as any },
    });
    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch {
    return { success: false, error: "Kon rol niet wijzigen" };
  }
}

export async function adminBanUser(userId: string, banned: boolean) {
  await requireAdmin();

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { banned },
    });
    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch {
    return { success: false, error: "Kon gebruiker niet blokkeren" };
  }
}

export async function adminDeleteUser(userId: string) {
  await requireAdmin();

  try {
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch {
    return { success: false, error: "Kon gebruiker niet verwijderen" };
  }
}

// ===== PROPERTY MANAGEMENT =====

export async function adminUpdatePropertyStatus(propertyId: string, status: string) {
  await requireAdmin();

  try {
    await prisma.property.update({
      where: { id: propertyId },
      data: { status: status as any },
    });
    revalidatePath("/dashboard/admin/properties");
    return { success: true };
  } catch {
    return { success: false, error: "Kon status niet wijzigen" };
  }
}

export async function adminDeleteProperty(propertyId: string) {
  await requireAdmin();

  try {
    await prisma.property.delete({ where: { id: propertyId } });
    revalidatePath("/dashboard/admin/properties");
    return { success: true };
  } catch {
    return { success: false, error: "Kon pand niet verwijderen" };
  }
}

export async function adminFeatureProperty(propertyId: string, featured: boolean) {
  await requireAdmin();

  try {
    await prisma.property.update({
      where: { id: propertyId },
      data: { 
        featured,
        featuredUntil: featured ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      },
    });
    revalidatePath("/dashboard/admin/properties");
    return { success: true };
  } catch {
    return { success: false, error: "Kon pand niet uitlichten" };
  }
}

// ===== AGENCY MANAGEMENT =====

export async function adminGetAgencies() {
  await requireAdmin();

  try {
    const agencies = await prisma.agency.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        city: true,
        _count: { select: { properties: true, members: true } },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return { success: true, agencies };
  } catch {
    return { success: false, agencies: [] };
  }
}

export async function adminDeleteAgency(agencyId: string) {
  await requireAdmin();

  try {
    await prisma.agency.delete({ where: { id: agencyId } });
    revalidatePath("/dashboard/admin/agencies");
    return { success: true };
  } catch {
    return { success: false, error: "Kon makelaarskantoor niet verwijderen" };
  }
}

// ===== PLATFORM STATS =====

export async function adminGetPlatformStats() {
  await requireAdmin();

  try {
    const [users, properties, agencies, inquiries, views] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.agency.count(),
      prisma.propertyInquiry.count(),
      prisma.propertyView.count(),
    ]);

    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [newUsers7d, newProperties7d, newInquiries7d] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: last7Days } } }),
      prisma.property.count({ where: { createdAt: { gte: last7Days } } }),
      prisma.propertyInquiry.count({ where: { createdAt: { gte: last7Days } } }),
    ]);

    return {
      success: true,
      stats: {
        users, properties, agencies, inquiries, views,
        newUsers7d, newProperties7d, newInquiries7d,
      },
    };
  } catch {
    return { success: false, stats: null };
  }
}
