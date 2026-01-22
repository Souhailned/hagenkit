/**
 * Tests for types and utility functions
 */

import { describe, it, expect } from "vitest";
import {
  BUSINESS_TYPES,
  DUTCH_CITIES,
  MUST_HAVE_FEATURES,
  BUDGET_CONFIG,
  formatEuro,
  parseEuro,
} from "../types";

describe("BUSINESS_TYPES", () => {
  it("contains required business types", () => {
    const values = BUSINESS_TYPES.map((t) => t.value);

    expect(values).toContain("restaurant");
    expect(values).toContain("cafe");
    expect(values).toContain("bar");
    expect(values).toContain("hotel");
    expect(values).toContain("dark-kitchen");
    expect(values).toContain("other");
  });

  it("has labels for all types", () => {
    BUSINESS_TYPES.forEach((type) => {
      expect(type.label).toBeTruthy();
      expect(typeof type.label).toBe("string");
    });
  });

  it("has icons for all types", () => {
    BUSINESS_TYPES.forEach((type) => {
      expect(type.icon).toBeTruthy();
    });
  });
});

describe("DUTCH_CITIES", () => {
  it("contains major Dutch cities", () => {
    const values = DUTCH_CITIES.map((c) => c.value);

    expect(values).toContain("amsterdam");
    expect(values).toContain("rotterdam");
    expect(values).toContain("den-haag");
    expect(values).toContain("utrecht");
  });

  it("marks popular cities", () => {
    const popularCities = DUTCH_CITIES.filter((c) => c.popular);
    const popularValues = popularCities.map((c) => c.value);

    expect(popularValues).toContain("amsterdam");
    expect(popularValues).toContain("rotterdam");
    expect(popularCities.length).toBeGreaterThan(0);
    expect(popularCities.length).toBeLessThan(DUTCH_CITIES.length);
  });

  it("has unique values", () => {
    const values = DUTCH_CITIES.map((c) => c.value);
    const uniqueValues = [...new Set(values)];

    expect(values.length).toBe(uniqueValues.length);
  });
});

describe("MUST_HAVE_FEATURES", () => {
  it("contains required features", () => {
    const values = MUST_HAVE_FEATURES.map((f) => f.value);

    expect(values).toContain("terras");
    expect(values).toContain("keuken");
    expect(values).toContain("alcohol");
  });

  it("has descriptions for all features", () => {
    MUST_HAVE_FEATURES.forEach((feature) => {
      expect(feature.description).toBeTruthy();
      expect(typeof feature.description).toBe("string");
    });
  });

  it("has icons for all features", () => {
    MUST_HAVE_FEATURES.forEach((feature) => {
      expect(feature.icon).toBeTruthy();
    });
  });
});

describe("BUDGET_CONFIG", () => {
  it("has valid min/max range", () => {
    expect(BUDGET_CONFIG.MIN).toBeGreaterThanOrEqual(0);
    expect(BUDGET_CONFIG.MAX).toBeGreaterThan(BUDGET_CONFIG.MIN);
  });

  it("has valid step value", () => {
    expect(BUDGET_CONFIG.STEP).toBeGreaterThan(0);
    expect(BUDGET_CONFIG.MAX % BUDGET_CONFIG.STEP).toBe(0);
  });

  it("has valid default values within range", () => {
    expect(BUDGET_CONFIG.DEFAULT_MIN).toBeGreaterThanOrEqual(BUDGET_CONFIG.MIN);
    expect(BUDGET_CONFIG.DEFAULT_MAX).toBeLessThanOrEqual(BUDGET_CONFIG.MAX);
    expect(BUDGET_CONFIG.DEFAULT_MIN).toBeLessThan(BUDGET_CONFIG.DEFAULT_MAX);
  });
});

describe("formatEuro", () => {
  it("formats positive numbers as euro currency", () => {
    const result = formatEuro(50000);

    expect(result).toContain("€");
    expect(result).toContain("50");
  });

  it("formats with Dutch locale (dot as thousand separator)", () => {
    const result = formatEuro(100000);

    // Dutch locale uses . for thousands
    expect(result).toMatch(/100[.,]000/);
  });

  it("returns empty string for null", () => {
    expect(formatEuro(null)).toBe("");
  });

  it("formats zero correctly", () => {
    const result = formatEuro(0);

    expect(result).toContain("€");
    expect(result).toContain("0");
  });

  it("removes decimal places", () => {
    const result = formatEuro(50000);

    // Should not have decimal separator for whole numbers
    expect(result).not.toMatch(/[,.]00$/);
  });
});

describe("parseEuro", () => {
  it("parses clean numbers", () => {
    expect(parseEuro("50000")).toBe(50000);
    expect(parseEuro("100")).toBe(100);
  });

  it("parses numbers with euro symbol", () => {
    expect(parseEuro("€ 50.000")).toBe(50000);
    expect(parseEuro("€50000")).toBe(50000);
  });

  it("parses numbers with thousand separators", () => {
    expect(parseEuro("50.000")).toBe(50000);
    expect(parseEuro("100,000")).toBe(100000);
  });

  it("returns null for empty string", () => {
    expect(parseEuro("")).toBe(null);
  });

  it("returns null for non-numeric strings", () => {
    expect(parseEuro("abc")).toBe(null);
  });

  it("handles whitespace", () => {
    expect(parseEuro("  50000  ")).toBe(50000);
  });
});
