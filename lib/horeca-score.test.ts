/**
 * Tests for horeca-score.ts
 *
 * Run with: npx vitest run lib/horeca-score.test.ts
 * Or add vitest to devDependencies when Node version is compatible
 */

import { describe, it, expect } from "vitest";
import {
  calculateHorecaScore,
  getScoreColor,
  getNumericScoreColor,
  type HorecaProperty,
  type HorecaFeatures,
  type ScoreGrade,
} from "./horeca-score";

describe("calculateHorecaScore", () => {
  const baseProperty: HorecaProperty = {
    id: "test-1",
    name: "Test Café",
    address: "Kalverstraat 1, Amsterdam",
  };

  describe("with minimal data", () => {
    it("returns a valid score result with empty features", () => {
      const result = calculateHorecaScore(baseProperty, {});

      expect(result.overallScore).toBeDefined();
      expect(result.numericScore).toBeGreaterThanOrEqual(0);
      expect(result.numericScore).toBeLessThanOrEqual(100);
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.location).toBeDefined();
      expect(result.breakdown.licenses).toBeDefined();
      expect(result.breakdown.facilities).toBeDefined();
      expect(result.breakdown.condition).toBeDefined();
      expect(result.breakdown.priceQuality).toBeDefined();
      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(result.calculatedAt).toBeInstanceOf(Date);
    });

    it("returns default score of ~50 when no data provided", () => {
      const result = calculateHorecaScore(baseProperty, {});

      // Each factor defaults to 50 when no data
      expect(result.numericScore).toBeGreaterThanOrEqual(40);
      expect(result.numericScore).toBeLessThanOrEqual(60);
    });
  });

  describe("location scoring", () => {
    it("scores high for excellent location data", () => {
      const features: HorecaFeatures = {
        location: {
          footfallEstimate: 5000,
          neighborhoodRating: 9,
          publicTransportDistance: 50,
          parkingDistance: 100,
          touristArea: true,
          highVisibility: true,
        },
      };

      const result = calculateHorecaScore(baseProperty, features);
      expect(result.breakdown.location.score).toBeGreaterThanOrEqual(80);
      expect(result.breakdown.location.grade).toMatch(/^(A\+|A)$/);
    });

    it("scores low for poor location data", () => {
      const features: HorecaFeatures = {
        location: {
          footfallEstimate: 100,
          neighborhoodRating: 3,
          publicTransportDistance: 2000,
          parkingDistance: 800,
          touristArea: false,
          highVisibility: false,
        },
      };

      const result = calculateHorecaScore(baseProperty, features);
      expect(result.breakdown.location.score).toBeLessThanOrEqual(50);
    });
  });

  describe("license scoring", () => {
    it("scores 100 with all licenses", () => {
      const features: HorecaFeatures = {
        licenses: {
          alcoholLicense: true,
          terraceLicense: true,
          lateNightLicense: true,
          foodServiceLicense: true,
          gamingLicense: true,
          cateringLicense: true,
          eventLicense: true,
        },
      };

      const result = calculateHorecaScore(baseProperty, features);
      expect(result.breakdown.licenses.score).toBe(100);
      expect(result.breakdown.licenses.grade).toBe("A+");
    });

    it("scores 0 with no licenses", () => {
      const features: HorecaFeatures = {
        licenses: {
          alcoholLicense: false,
          terraceLicense: false,
          lateNightLicense: false,
          foodServiceLicense: false,
          gamingLicense: false,
          cateringLicense: false,
          eventLicense: false,
        },
      };

      const result = calculateHorecaScore(baseProperty, features);
      expect(result.breakdown.licenses.score).toBe(0);
      expect(result.breakdown.licenses.grade).toBe("F");
    });

    it("weighs alcohol and food service licenses higher", () => {
      const withAlcohol: HorecaFeatures = {
        licenses: { alcoholLicense: true },
      };
      const withGaming: HorecaFeatures = {
        licenses: { gamingLicense: true },
      };

      const alcoholResult = calculateHorecaScore(baseProperty, withAlcohol);
      const gamingResult = calculateHorecaScore(baseProperty, withGaming);

      expect(alcoholResult.breakdown.licenses.score).toBeGreaterThan(
        gamingResult.breakdown.licenses.score
      );
    });
  });

  describe("facilities scoring", () => {
    it("scores high for professional facilities", () => {
      const features: HorecaFeatures = {
        facilities: {
          kitchenType: "professional",
          extractionType: "professional",
          coldStorage: true,
          cellar: true,
          seatingCapacityInside: 80,
          seatingCapacityTerrace: 40,
          accessibleToilets: true,
          staffArea: true,
          storageSpace: true,
          squareMeters: 300,
        },
      };

      const result = calculateHorecaScore(baseProperty, features);
      expect(result.breakdown.facilities.score).toBeGreaterThanOrEqual(75);
    });

    it("scores low for basic facilities", () => {
      const features: HorecaFeatures = {
        facilities: {
          kitchenType: "none",
          extractionType: "none",
          coldStorage: false,
          seatingCapacityInside: 10,
          squareMeters: 50,
        },
      };

      const result = calculateHorecaScore(baseProperty, features);
      expect(result.breakdown.facilities.score).toBeLessThanOrEqual(40);
    });
  });

  describe("condition scoring", () => {
    it("scores high for recently renovated property", () => {
      const currentYear = new Date().getFullYear();
      const features: HorecaFeatures = {
        condition: {
          buildYear: currentYear - 5,
          lastRenovationYear: currentYear - 1,
          overallConditionRating: 9,
          electricalRating: 9,
          plumbingRating: 9,
          hvacRating: 9,
          energyLabel: "A",
        },
      };

      const result = calculateHorecaScore(baseProperty, features);
      expect(result.breakdown.condition.score).toBeGreaterThanOrEqual(85);
    });

    it("scores low for old unrenovated property", () => {
      const features: HorecaFeatures = {
        condition: {
          buildYear: 1920,
          lastRenovationYear: 1990,
          overallConditionRating: 4,
          electricalRating: 3,
          plumbingRating: 4,
          hvacRating: 3,
          energyLabel: "G",
        },
      };

      const result = calculateHorecaScore(baseProperty, features);
      expect(result.breakdown.condition.score).toBeLessThanOrEqual(40);
    });
  });

  describe("price/quality scoring", () => {
    it("scores high for below-market rent with good revenue potential", () => {
      const features: HorecaFeatures = {
        priceQuality: {
          monthlyRent: 2000,
          keyMoney: 10000,
          revenuePotential: 30000,
          pricePerSqm: 15,
          marketAveragePricePerSqm: 25,
          leaseDurationYears: 10,
          belowMarketRent: true,
        },
      };

      const result = calculateHorecaScore(baseProperty, features);
      expect(result.breakdown.priceQuality.score).toBeGreaterThanOrEqual(80);
    });

    it("scores low for above-market rent", () => {
      const features: HorecaFeatures = {
        priceQuality: {
          monthlyRent: 5000,
          keyMoney: 200000,
          revenuePotential: 15000,
          pricePerSqm: 40,
          marketAveragePricePerSqm: 25,
          leaseDurationYears: 2,
          belowMarketRent: false,
        },
      };

      const result = calculateHorecaScore(baseProperty, features);
      expect(result.breakdown.priceQuality.score).toBeLessThanOrEqual(45);
    });
  });

  describe("overall score calculation", () => {
    it("applies correct factor weights", () => {
      const features: HorecaFeatures = {
        location: { neighborhoodRating: 10 }, // Score ~100
        licenses: { alcoholLicense: false }, // Score 0
        facilities: {},
        condition: {},
        priceQuality: {},
      };

      const result = calculateHorecaScore(baseProperty, features);

      // Location weight is 0.3, licenses weight is 0.2
      // So the weighted location contribution should be higher
      expect(result.breakdown.location.weight).toBe(0.3);
      expect(result.breakdown.licenses.weight).toBe(0.2);
    });

    it("returns valid grades for all score ranges", () => {
      const validGrades: ScoreGrade[] = [
        "A+",
        "A",
        "B+",
        "B",
        "C+",
        "C",
        "D",
        "F",
      ];

      const result = calculateHorecaScore(baseProperty, {});
      expect(validGrades).toContain(result.overallScore);
    });
  });

  describe("suggestions", () => {
    it("suggests getting alcohol license when missing", () => {
      const features: HorecaFeatures = {
        licenses: {
          alcoholLicense: false,
          foodServiceLicense: true,
        },
      };

      const result = calculateHorecaScore(baseProperty, features);
      const alcoholSuggestion = result.suggestions.find(
        (s) => s.factor === "licenses" && s.suggestion.includes("alcohol")
      );

      expect(alcoholSuggestion).toBeDefined();
      expect(alcoholSuggestion?.priority).toBe("high");
    });

    it("suggests kitchen upgrade for basic kitchen", () => {
      const features: HorecaFeatures = {
        facilities: {
          kitchenType: "basic",
        },
      };

      const result = calculateHorecaScore(baseProperty, features);
      const kitchenSuggestion = result.suggestions.find(
        (s) => s.factor === "facilities" && s.suggestion.includes("kitchen")
      );

      expect(kitchenSuggestion).toBeDefined();
    });

    it("sorts suggestions by priority", () => {
      const features: HorecaFeatures = {
        licenses: { alcoholLicense: false },
        facilities: { kitchenType: "basic" },
        priceQuality: {
          pricePerSqm: 50,
          marketAveragePricePerSqm: 25,
        },
      };

      const result = calculateHorecaScore(baseProperty, features);

      // High priority suggestions should come first
      const priorities = result.suggestions.map((s) => s.priority);
      const highIndex = priorities.findIndex((p) => p === "high");
      const lowIndex = priorities.findIndex((p) => p === "low");

      if (highIndex !== -1 && lowIndex !== -1) {
        expect(highIndex).toBeLessThan(lowIndex);
      }
    });
  });

  describe("complete property scoring", () => {
    it("calculates realistic score for average property", () => {
      const features: HorecaFeatures = {
        location: {
          footfallEstimate: 2000,
          neighborhoodRating: 7,
          publicTransportDistance: 200,
          highVisibility: true,
        },
        licenses: {
          alcoholLicense: true,
          foodServiceLicense: true,
          terraceLicense: true,
        },
        facilities: {
          kitchenType: "standard",
          extractionType: "standard",
          coldStorage: true,
          seatingCapacityInside: 50,
          seatingCapacityTerrace: 20,
          squareMeters: 150,
        },
        condition: {
          buildYear: 1980,
          lastRenovationYear: 2018,
          overallConditionRating: 7,
          energyLabel: "C",
        },
        priceQuality: {
          monthlyRent: 3500,
          revenuePotential: 25000,
          leaseDurationYears: 5,
        },
      };

      const result = calculateHorecaScore(baseProperty, features);

      // Average property should score in B range
      expect(result.numericScore).toBeGreaterThanOrEqual(55);
      expect(result.numericScore).toBeLessThanOrEqual(80);
      expect(["B+", "B", "C+"]).toContain(result.overallScore);
    });
  });
});

describe("getScoreColor", () => {
  const grades: ScoreGrade[] = ["A+", "A", "B+", "B", "C+", "C", "D", "F"];

  it("returns color scheme for all valid grades", () => {
    for (const grade of grades) {
      const colors = getScoreColor(grade);

      expect(colors.bg).toBeDefined();
      expect(colors.text).toBeDefined();
      expect(colors.border).toBeDefined();
      expect(typeof colors.bg).toBe("string");
      expect(typeof colors.text).toBe("string");
      expect(typeof colors.border).toBe("string");
    }
  });

  it("returns green tones for A grades", () => {
    const aPlusColors = getScoreColor("A+");
    const aColors = getScoreColor("A");

    expect(aPlusColors.bg).toContain("emerald");
    expect(aColors.bg).toContain("green");
  });

  it("returns yellow/amber tones for B/C grades", () => {
    const bColors = getScoreColor("B");
    const cColors = getScoreColor("C");

    expect(bColors.bg).toContain("yellow");
    expect(cColors.bg).toContain("orange");
  });

  it("returns red tones for D/F grades", () => {
    const dColors = getScoreColor("D");
    const fColors = getScoreColor("F");

    expect(dColors.bg).toContain("red");
    expect(fColors.bg).toContain("rose");
  });

  it("includes dark mode variants in text color", () => {
    const colors = getScoreColor("A");

    expect(colors.text).toContain("dark:");
  });
});

describe("getNumericScoreColor", () => {
  it("returns emerald for scores >= 85", () => {
    expect(getNumericScoreColor(85)).toBe("bg-emerald-500");
    expect(getNumericScoreColor(100)).toBe("bg-emerald-500");
  });

  it("returns green for scores 70-84", () => {
    expect(getNumericScoreColor(70)).toBe("bg-green-500");
    expect(getNumericScoreColor(84)).toBe("bg-green-500");
  });

  it("returns yellow for scores 55-69", () => {
    expect(getNumericScoreColor(55)).toBe("bg-yellow-500");
    expect(getNumericScoreColor(69)).toBe("bg-yellow-500");
  });

  it("returns orange for scores 40-54", () => {
    expect(getNumericScoreColor(40)).toBe("bg-orange-500");
    expect(getNumericScoreColor(54)).toBe("bg-orange-500");
  });

  it("returns red for scores < 40", () => {
    expect(getNumericScoreColor(0)).toBe("bg-red-500");
    expect(getNumericScoreColor(39)).toBe("bg-red-500");
  });
});
