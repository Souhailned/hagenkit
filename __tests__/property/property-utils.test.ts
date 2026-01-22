import { describe, it, expect } from "vitest";
import {
  formatPrice,
  formatSurface,
  formatAvailability,
  formatLeaseTerm,
  PROPERTY_TYPE_LABELS,
  PROPERTY_STATUS_LABELS,
  PRICE_TYPE_LABELS,
  FEATURE_CATEGORY_LABELS,
  FEATURE_KEY_LABELS,
  KITCHEN_TYPE_LABELS,
  getHorecaScoreColor,
} from "@/lib/property/utils";

describe("Property Utils", () => {
  describe("formatPrice", () => {
    it("should format price from cents to euros", () => {
      // Intl.NumberFormat may use non-breaking space - check for pattern instead
      expect(formatPrice(450000)).toMatch(/€.*4\.500/);
      expect(formatPrice(100000)).toMatch(/€.*1\.000/);
      expect(formatPrice(50)).toMatch(/€.*1/);
    });

    it("should return 'Op aanvraag' for null or undefined", () => {
      expect(formatPrice(null)).toBe("Op aanvraag");
      expect(formatPrice(undefined)).toBe("Op aanvraag");
    });

    it("should handle zero price", () => {
      expect(formatPrice(0)).toBe("Op aanvraag");
    });
  });

  describe("formatSurface", () => {
    it("should format surface area with m² suffix", () => {
      expect(formatSurface(100)).toBe("100 m²");
      expect(formatSurface(250)).toBe("250 m²");
    });

    it("should return '-' for null or undefined", () => {
      expect(formatSurface(null)).toBe("-");
      expect(formatSurface(undefined)).toBe("-");
    });
  });

  describe("formatAvailability", () => {
    it("should return 'Direct beschikbaar' for null", () => {
      expect(formatAvailability(null)).toBe("Direct beschikbaar");
    });

    it("should return 'Direct beschikbaar' for past dates", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(formatAvailability(pastDate)).toBe("Direct beschikbaar");
    });

    it("should format future dates", () => {
      // Use a date that's definitely in the future
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      futureDate.setMonth(5); // June
      futureDate.setDate(15);
      const result = formatAvailability(futureDate);
      expect(result).toContain("Beschikbaar per");
      expect(result).toContain("juni");
    });
  });

  describe("formatLeaseTerm", () => {
    it("should format 1 month correctly", () => {
      expect(formatLeaseTerm(1)).toBe("1 maand");
    });

    it("should format months less than 12", () => {
      expect(formatLeaseTerm(6)).toBe("6 maanden");
      expect(formatLeaseTerm(11)).toBe("11 maanden");
    });

    it("should format 12 months as 1 year", () => {
      expect(formatLeaseTerm(12)).toBe("1 jaar");
    });

    it("should format multiple years", () => {
      expect(formatLeaseTerm(24)).toBe("2 jaar");
      expect(formatLeaseTerm(36)).toBe("3 jaar");
    });

    it("should handle non-year multiples", () => {
      expect(formatLeaseTerm(18)).toBe("18 maanden");
    });

    it("should return '-' for null", () => {
      expect(formatLeaseTerm(null)).toBe("-");
    });
  });

  describe("getHorecaScoreColor", () => {
    it("should return correct colors for scores", () => {
      expect(getHorecaScoreColor("A+")).toBe("bg-green-600");
      expect(getHorecaScoreColor("A")).toBe("bg-green-500");
      expect(getHorecaScoreColor("B")).toBe("bg-lime-500");
      expect(getHorecaScoreColor("F")).toBe("bg-red-600");
    });

    it("should return muted color for null/undefined", () => {
      expect(getHorecaScoreColor(null)).toBe("bg-muted");
      expect(getHorecaScoreColor(undefined)).toBe("bg-muted");
    });

    it("should return muted color for unknown scores", () => {
      expect(getHorecaScoreColor("X")).toBe("bg-muted");
    });
  });

  describe("Label constants", () => {
    it("should have all property type labels", () => {
      expect(PROPERTY_TYPE_LABELS.RESTAURANT).toBe("Restaurant");
      expect(PROPERTY_TYPE_LABELS.CAFE).toBe("Café");
      expect(PROPERTY_TYPE_LABELS.BAR).toBe("Bar");
      expect(PROPERTY_TYPE_LABELS.HOTEL).toBe("Hotel");
    });

    it("should have all property status labels", () => {
      expect(PROPERTY_STATUS_LABELS.ACTIVE).toBe("Beschikbaar");
      expect(PROPERTY_STATUS_LABELS.UNDER_OFFER).toBe("Onder optie");
      expect(PROPERTY_STATUS_LABELS.RENTED).toBe("Verhuurd");
      expect(PROPERTY_STATUS_LABELS.SOLD).toBe("Verkocht");
    });

    it("should have all price type labels", () => {
      expect(PRICE_TYPE_LABELS.RENT).toBe("Te huur");
      expect(PRICE_TYPE_LABELS.SALE).toBe("Te koop");
      expect(PRICE_TYPE_LABELS.RENT_OR_SALE).toBe("Te huur / Te koop");
    });

    it("should have all feature category labels", () => {
      expect(FEATURE_CATEGORY_LABELS.LICENSE).toBe("Vergunningen");
      expect(FEATURE_CATEGORY_LABELS.FACILITY).toBe("Faciliteiten");
      expect(FEATURE_CATEGORY_LABELS.UTILITY).toBe("Voorzieningen");
      expect(FEATURE_CATEGORY_LABELS.ACCESSIBILITY).toBe("Toegankelijkheid");
    });

    it("should have common feature key labels", () => {
      expect(FEATURE_KEY_LABELS.alcohol_license).toBe("Alcoholvergunning");
      expect(FEATURE_KEY_LABELS.terrace_permit).toBe("Terrasvergunning");
      expect(FEATURE_KEY_LABELS.professional_kitchen).toBe("Professionele keuken");
    });

    it("should have kitchen type labels", () => {
      expect(KITCHEN_TYPE_LABELS.none).toBe("Geen keuken");
      expect(KITCHEN_TYPE_LABELS.professional).toBe("Professionele keuken");
    });
  });
});
