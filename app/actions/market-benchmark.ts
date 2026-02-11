"use server";

import prisma from "@/lib/prisma";

interface BenchmarkResult {
  city: string;
  propertyType: string;
  yourPrice: number;
  avgPrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  totalListings: number;
  percentile: number; // where you fall (0-100)
  recommendation: string;
}

export async function getMarketBenchmark(
  propertyId: string
): Promise<{ success: boolean; data?: BenchmarkResult; error?: string }> {
  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        city: true,
        propertyType: true,
        rentPrice: true,
      },
    });

    if (!property || !property.rentPrice) {
      return { success: false, error: "Pand niet gevonden of geen prijs ingesteld" };
    }

    // Get comparable properties in same city and type
    const comparables = await prisma.property.findMany({
      where: {
        city: property.city,
        propertyType: property.propertyType,
        status: "ACTIVE",
        rentPrice: { gt: 0 },
      },
      select: { rentPrice: true },
      orderBy: { rentPrice: "asc" },
    });

    // If not enough in same city+type, expand to just city
    let listings = comparables;
    if (listings.length < 3) {
      listings = await prisma.property.findMany({
        where: {
          city: property.city,
          status: "ACTIVE",
          rentPrice: { gt: 0 },
        },
        select: { rentPrice: true },
        orderBy: { rentPrice: "asc" },
      });
    }

    if (listings.length === 0) {
      return { success: false, error: "Onvoldoende marktdata beschikbaar" };
    }

    const prices = listings.map((l) => l.rentPrice!);
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const medianPrice = prices[Math.floor(prices.length / 2)];
    const minPrice = prices[0];
    const maxPrice = prices[prices.length - 1];

    // Calculate percentile
    const belowCount = prices.filter((p) => p < property.rentPrice!).length;
    const percentile = Math.round((belowCount / prices.length) * 100);

    // Generate recommendation
    let recommendation: string;
    if (percentile > 75) {
      recommendation = "Je prijs ligt boven het marktgemiddelde. Overweeg extra USPs te benadrukken of je prijs te herzien voor snellere verhuur.";
    } else if (percentile > 50) {
      recommendation = "Je prijs ligt iets boven gemiddeld. Dit is acceptabel als je pand goede kenmerken heeft.";
    } else if (percentile > 25) {
      recommendation = "Je prijs is marktconform. Goede positionering voor een gezonde balans tussen snelheid en opbrengst.";
    } else {
      recommendation = "Je prijs ligt onder het marktgemiddelde. Je zult waarschijnlijk snel reacties ontvangen. Overweeg of een hogere prijs mogelijk is.";
    }

    return {
      success: true,
      data: {
        city: property.city,
        propertyType: property.propertyType,
        yourPrice: property.rentPrice,
        avgPrice,
        medianPrice,
        minPrice,
        maxPrice,
        totalListings: listings.length,
        percentile,
        recommendation,
      },
    };
  } catch (error) {
    console.error("Market benchmark failed:", error);
    return { success: false, error: "Kon marktdata niet ophalen" };
  }
}
