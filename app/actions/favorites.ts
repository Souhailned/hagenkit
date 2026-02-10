"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function toggleFavorite(propertyId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { error: "Je moet ingelogd zijn om favorieten op te slaan" };
  }

  const existing = await prisma.favoriteProperty.findUnique({
    where: {
      userId_propertyId: {
        userId: session.user.id,
        propertyId,
      },
    },
  });

  if (existing) {
    await prisma.favoriteProperty.delete({ where: { id: existing.id } });
    return { isFavorited: false };
  }

  await prisma.favoriteProperty.create({
    data: { userId: session.user.id, propertyId },
  });
  return { isFavorited: true };
}

export async function getFavorites() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return [];

  const favorites = await prisma.favoriteProperty.findMany({
    where: { userId: session.user.id },
    include: {
      property: {
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          agency: { select: { name: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return favorites;
}

export async function getFavoritedPropertyIds() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return [];

  const favorites = await prisma.favoriteProperty.findMany({
    where: { userId: session.user.id },
    select: { propertyId: true },
  });

  return favorites.map((f) => f.propertyId);
}
