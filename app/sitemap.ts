import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://horecagrond.nl";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/aanbod`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/sign-up`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/sign-in`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/team`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/help`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  ];

  // Dynamic property pages
  let propertyPages: MetadataRoute.Sitemap = [];
  try {
    const properties = await prisma.property.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    propertyPages = properties.map((p) => ({
      url: `${baseUrl}/aanbod/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // DB not available during build
  }

  // City pages
  let cityPages: MetadataRoute.Sitemap = [];
  try {
    const cities = await prisma.property.findMany({
      where: { status: "ACTIVE" },
      select: { city: true },
      distinct: ["city"],
    });

    cityPages = cities.map((c) => ({
      url: `${baseUrl}/aanbod?city=${encodeURIComponent(c.city)}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));
  } catch {
    // DB not available
  }

  return [...staticPages, ...propertyPages, ...cityPages];
}
