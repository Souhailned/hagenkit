import { describe, expect, test } from "bun:test";
import {
  updateSeekerProfileSchema,
  createSearchAlertSchema,
  updateSearchAlertSchema,
  propertyTypeEnum,
  alertFrequencyEnum,
} from "./seeker-profile";

describe("propertyTypeEnum", () => {
  test("accepts valid property types", () => {
    expect(propertyTypeEnum.parse("RESTAURANT")).toBe("RESTAURANT");
    expect(propertyTypeEnum.parse("CAFE")).toBe("CAFE");
    expect(propertyTypeEnum.parse("BAR")).toBe("BAR");
    expect(propertyTypeEnum.parse("HOTEL")).toBe("HOTEL");
  });

  test("rejects invalid property types", () => {
    expect(() => propertyTypeEnum.parse("INVALID")).toThrow();
  });
});

describe("alertFrequencyEnum", () => {
  test("accepts valid frequencies", () => {
    expect(alertFrequencyEnum.parse("INSTANT")).toBe("INSTANT");
    expect(alertFrequencyEnum.parse("DAILY")).toBe("DAILY");
    expect(alertFrequencyEnum.parse("WEEKLY")).toBe("WEEKLY");
    expect(alertFrequencyEnum.parse("MONTHLY")).toBe("MONTHLY");
  });

  test("rejects invalid frequencies", () => {
    expect(() => alertFrequencyEnum.parse("HOURLY")).toThrow();
  });
});

describe("updateSeekerProfileSchema", () => {
  test("accepts valid minimal input", () => {
    const result = updateSeekerProfileSchema.parse({});
    expect(result.preferredCities).toEqual([]);
    expect(result.preferredTypes).toEqual([]);
    expect(result.mustHaveFeatures).toEqual([]);
    expect(result.emailAlerts).toBe(false);
  });

  test("accepts valid full input", () => {
    const input = {
      businessType: "Restaurant",
      conceptDescription: "A modern bistro",
      experienceYears: 5,
      budgetMin: 50000,
      budgetMax: 100000,
      preferredCities: ["Amsterdam", "Rotterdam"],
      preferredTypes: ["RESTAURANT", "CAFE"],
      minSurface: 100,
      maxSurface: 200,
      mustHaveFeatures: ["terrace", "kitchen"],
      emailAlerts: true,
      alertFrequency: "DAILY",
    };
    const result = updateSeekerProfileSchema.parse(input);
    expect(result.businessType).toBe("Restaurant");
    expect(result.experienceYears).toBe(5);
  });

  test("rejects conceptDescription over 2000 characters", () => {
    const input = {
      conceptDescription: "a".repeat(2001),
    };
    expect(() => updateSeekerProfileSchema.parse(input)).toThrow("at most 2000 characters");
  });

  test("rejects experienceYears below 0", () => {
    const input = {
      experienceYears: -1,
    };
    expect(() => updateSeekerProfileSchema.parse(input)).toThrow("at least 0");
  });

  test("rejects experienceYears above 50", () => {
    const input = {
      experienceYears: 51,
    };
    expect(() => updateSeekerProfileSchema.parse(input)).toThrow("at most 50");
  });

  test("rejects budgetMin greater than budgetMax", () => {
    const input = {
      budgetMin: 100000,
      budgetMax: 50000,
    };
    expect(() => updateSeekerProfileSchema.parse(input)).toThrow("less than or equal to maximum budget");
  });

  test("rejects minSurface greater than maxSurface", () => {
    const input = {
      minSurface: 200,
      maxSurface: 100,
    };
    expect(() => updateSeekerProfileSchema.parse(input)).toThrow("less than or equal to maximum surface");
  });

  test("accepts equal budget values", () => {
    const input = {
      budgetMin: 50000,
      budgetMax: 50000,
    };
    const result = updateSeekerProfileSchema.parse(input);
    expect(result.budgetMin).toBe(50000);
    expect(result.budgetMax).toBe(50000);
  });
});

describe("createSearchAlertSchema", () => {
  test("accepts valid input", () => {
    const input = {
      name: "My Search Alert",
      cities: ["Amsterdam"],
      propertyTypes: ["RESTAURANT"],
      frequency: "DAILY",
    };
    const result = createSearchAlertSchema.parse(input);
    expect(result.name).toBe("My Search Alert");
    expect(result.mustHaveFeatures).toEqual([]);
  });

  test("accepts full valid input", () => {
    const input = {
      name: "Premium Restaurant Search",
      cities: ["Amsterdam", "Rotterdam", "Utrecht"],
      propertyTypes: ["RESTAURANT", "CAFE"],
      priceMin: 1000,
      priceMax: 5000,
      surfaceMin: 100,
      surfaceMax: 500,
      mustHaveFeatures: ["terrace", "parking"],
      frequency: "WEEKLY",
    };
    const result = createSearchAlertSchema.parse(input);
    expect(result.name).toBe("Premium Restaurant Search");
    expect(result.cities).toHaveLength(3);
  });

  test("rejects name under 2 characters", () => {
    const input = {
      name: "A",
      cities: ["Amsterdam"],
      propertyTypes: ["RESTAURANT"],
      frequency: "DAILY",
    };
    expect(() => createSearchAlertSchema.parse(input)).toThrow("at least 2 characters");
  });

  test("rejects name over 100 characters", () => {
    const input = {
      name: "A".repeat(101),
      cities: ["Amsterdam"],
      propertyTypes: ["RESTAURANT"],
      frequency: "DAILY",
    };
    expect(() => createSearchAlertSchema.parse(input)).toThrow("at most 100 characters");
  });

  test("rejects empty cities array", () => {
    const input = {
      name: "My Search",
      cities: [],
      propertyTypes: ["RESTAURANT"],
      frequency: "DAILY",
    };
    expect(() => createSearchAlertSchema.parse(input)).toThrow("At least one city");
  });

  test("rejects empty propertyTypes array", () => {
    const input = {
      name: "My Search",
      cities: ["Amsterdam"],
      propertyTypes: [],
      frequency: "DAILY",
    };
    expect(() => createSearchAlertSchema.parse(input)).toThrow("At least one property type");
  });

  test("rejects priceMin greater than priceMax", () => {
    const input = {
      name: "My Search",
      cities: ["Amsterdam"],
      propertyTypes: ["RESTAURANT"],
      priceMin: 5000,
      priceMax: 1000,
      frequency: "DAILY",
    };
    expect(() => createSearchAlertSchema.parse(input)).toThrow("less than or equal to maximum price");
  });

  test("rejects surfaceMin greater than surfaceMax", () => {
    const input = {
      name: "My Search",
      cities: ["Amsterdam"],
      propertyTypes: ["RESTAURANT"],
      surfaceMin: 500,
      surfaceMax: 100,
      frequency: "DAILY",
    };
    expect(() => createSearchAlertSchema.parse(input)).toThrow("less than or equal to maximum surface");
  });

  test("requires frequency", () => {
    const input = {
      name: "My Search",
      cities: ["Amsterdam"],
      propertyTypes: ["RESTAURANT"],
    };
    expect(() => createSearchAlertSchema.parse(input)).toThrow();
  });
});

describe("updateSearchAlertSchema", () => {
  test("accepts empty input (all optional)", () => {
    const result = updateSearchAlertSchema.parse({});
    expect(result).toEqual({});
  });

  test("accepts only active field", () => {
    const result = updateSearchAlertSchema.parse({ active: true });
    expect(result.active).toBe(true);
  });

  test("accepts only active false", () => {
    const result = updateSearchAlertSchema.parse({ active: false });
    expect(result.active).toBe(false);
  });

  test("accepts partial update", () => {
    const input = {
      name: "Updated Name",
      cities: ["Utrecht"],
      active: true,
    };
    const result = updateSearchAlertSchema.parse(input);
    expect(result.name).toBe("Updated Name");
    expect(result.cities).toEqual(["Utrecht"]);
    expect(result.active).toBe(true);
  });

  test("accepts full update", () => {
    const input = {
      name: "Full Update",
      cities: ["Amsterdam", "Rotterdam"],
      propertyTypes: ["HOTEL", "NIGHTCLUB"],
      priceMin: 2000,
      priceMax: 8000,
      surfaceMin: 200,
      surfaceMax: 1000,
      mustHaveFeatures: ["pool", "gym"],
      frequency: "MONTHLY",
      active: false,
    };
    const result = updateSearchAlertSchema.parse(input);
    expect(result.name).toBe("Full Update");
    expect(result.active).toBe(false);
  });

  test("rejects name under 2 characters when provided", () => {
    const input = {
      name: "A",
    };
    expect(() => updateSearchAlertSchema.parse(input)).toThrow("at least 2 characters");
  });

  test("rejects name over 100 characters when provided", () => {
    const input = {
      name: "A".repeat(101),
    };
    expect(() => updateSearchAlertSchema.parse(input)).toThrow("at most 100 characters");
  });

  test("rejects priceMin greater than priceMax", () => {
    const input = {
      priceMin: 8000,
      priceMax: 2000,
    };
    expect(() => updateSearchAlertSchema.parse(input)).toThrow("less than or equal to maximum price");
  });

  test("rejects surfaceMin greater than surfaceMax", () => {
    const input = {
      surfaceMin: 1000,
      surfaceMax: 200,
    };
    expect(() => updateSearchAlertSchema.parse(input)).toThrow("less than or equal to maximum surface");
  });

  test("accepts valid property types", () => {
    const input = {
      propertyTypes: ["RESTAURANT", "CAFE", "BAR"],
    };
    const result = updateSearchAlertSchema.parse(input);
    expect(result.propertyTypes).toEqual(["RESTAURANT", "CAFE", "BAR"]);
  });

  test("rejects invalid property types", () => {
    const input = {
      propertyTypes: ["INVALID_TYPE"],
    };
    expect(() => updateSearchAlertSchema.parse(input)).toThrow();
  });

  test("accepts valid frequency", () => {
    const input = {
      frequency: "INSTANT",
    };
    const result = updateSearchAlertSchema.parse(input);
    expect(result.frequency).toBe("INSTANT");
  });

  test("rejects invalid frequency", () => {
    const input = {
      frequency: "INVALID",
    };
    expect(() => updateSearchAlertSchema.parse(input)).toThrow();
  });
});
