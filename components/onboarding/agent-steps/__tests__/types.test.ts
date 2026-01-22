/**
 * Tests for agent onboarding step types and validation functions
 *
 * Note: These tests require a test runner (vitest/jest) to be installed.
 * Run: bun add -d vitest @testing-library/react @testing-library/jest-dom
 * Then: bun test
 */

import { describe, it, expect } from "vitest";
import {
  isValidKvkNumber,
  isValidPostalCode,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABELS,
  REGIONS,
} from "../types";

describe("Validation helpers", () => {
  describe("isValidKvkNumber", () => {
    it("accepts valid 8-digit KvK numbers", () => {
      expect(isValidKvkNumber("12345678")).toBe(true);
      expect(isValidKvkNumber("00000001")).toBe(true);
    });

    it("accepts KvK numbers with spaces", () => {
      expect(isValidKvkNumber("1234 5678")).toBe(true);
    });

    it("rejects invalid KvK numbers", () => {
      expect(isValidKvkNumber("1234567")).toBe(false); // too short
      expect(isValidKvkNumber("123456789")).toBe(false); // too long
      expect(isValidKvkNumber("1234567a")).toBe(false); // contains letter
      expect(isValidKvkNumber("")).toBe(false);
    });
  });

  describe("isValidPostalCode", () => {
    it("accepts valid Dutch postal codes", () => {
      expect(isValidPostalCode("1234AB")).toBe(true);
      expect(isValidPostalCode("1234 AB")).toBe(true);
      expect(isValidPostalCode("1234ab")).toBe(true);
      expect(isValidPostalCode("9999ZZ")).toBe(true);
    });

    it("rejects invalid postal codes", () => {
      expect(isValidPostalCode("123AB")).toBe(false); // too short
      expect(isValidPostalCode("12345AB")).toBe(false); // too long
      expect(isValidPostalCode("ABCD12")).toBe(false); // wrong format
      expect(isValidPostalCode("1234")).toBe(false); // missing letters
      expect(isValidPostalCode("")).toBe(false);
    });
  });

  describe("isValidEmail", () => {
    it("accepts valid email addresses", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name@domain.nl")).toBe(true);
      expect(isValidEmail("info@kantoor.amsterdam")).toBe(true);
    });

    it("rejects invalid email addresses", () => {
      expect(isValidEmail("notanemail")).toBe(false);
      expect(isValidEmail("@domain.com")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail("user@domain")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });
  });

  describe("isValidPhone", () => {
    it("accepts valid Dutch phone numbers", () => {
      expect(isValidPhone("0612345678")).toBe(true);
      expect(isValidPhone("06 12345678")).toBe(true);
      expect(isValidPhone("06-12345678")).toBe(true);
      expect(isValidPhone("+31612345678")).toBe(true);
      expect(isValidPhone("+31 6 12345678")).toBe(true);
      expect(isValidPhone("020 1234567")).toBe(true);
    });

    it("rejects invalid phone numbers", () => {
      expect(isValidPhone("06123456")).toBe(false); // too short
      expect(isValidPhone("061234567890")).toBe(false); // too long
      expect(isValidPhone("0012345678")).toBe(false); // starts with 00
      expect(isValidPhone("")).toBe(false);
    });
  });

  describe("isValidUrl", () => {
    it("accepts valid URLs", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("http://test.nl")).toBe(true);
      expect(isValidUrl("example.com")).toBe(true); // auto-prefixed
    });

    it("accepts empty string (optional field)", () => {
      expect(isValidUrl("")).toBe(true);
    });

    it("rejects invalid URLs", () => {
      expect(isValidUrl("not a url")).toBe(false);
      expect(isValidUrl("://invalid")).toBe(false);
    });
  });
});

describe("Constants", () => {
  it("has all expected property types", () => {
    expect(PROPERTY_TYPES).toContain("RESTAURANT");
    expect(PROPERTY_TYPES).toContain("CAFE");
    expect(PROPERTY_TYPES).toContain("BAR");
    expect(PROPERTY_TYPES).toContain("HOTEL");
    expect(PROPERTY_TYPES).toContain("DARK_KITCHEN");
    expect(PROPERTY_TYPES).toContain("NIGHTCLUB");
    expect(PROPERTY_TYPES).toContain("FOOD_COURT");
    expect(PROPERTY_TYPES).toContain("CATERING");
    expect(PROPERTY_TYPES).toContain("BAKERY");
    expect(PROPERTY_TYPES).toContain("OTHER");
    expect(PROPERTY_TYPES.length).toBe(10);
  });

  it("has labels for all property types", () => {
    PROPERTY_TYPES.forEach((type) => {
      expect(PROPERTY_TYPE_LABELS[type]).toBeDefined();
      expect(typeof PROPERTY_TYPE_LABELS[type]).toBe("string");
    });
  });

  it("has all Dutch provinces", () => {
    expect(REGIONS).toContain("Noord-Holland");
    expect(REGIONS).toContain("Zuid-Holland");
    expect(REGIONS).toContain("Utrecht");
    expect(REGIONS).toContain("Noord-Brabant");
    expect(REGIONS).toContain("Gelderland");
    expect(REGIONS).toContain("Limburg");
    expect(REGIONS).toContain("Overijssel");
    expect(REGIONS).toContain("Flevoland");
    expect(REGIONS).toContain("Groningen");
    expect(REGIONS).toContain("Friesland");
    expect(REGIONS).toContain("Drenthe");
    expect(REGIONS).toContain("Zeeland");
    expect(REGIONS.length).toBe(12);
  });
});
