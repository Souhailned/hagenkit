import { describe, it, expect } from "bun:test";
import {
  updateSeekerProfileSchema,
  createSearchAlertSchema,
  updateSearchAlertSchema,
  propertyTypeEnum,
  alertFrequencyEnum,
} from "../seeker-profile";

describe("propertyTypeEnum", () => {
  it("accepts valid property types", () => {
    expect(propertyTypeEnum.parse("RESTAURANT")).toBe("RESTAURANT");
    expect(propertyTypeEnum.parse("CAFE")).toBe("CAFE");
    expect(propertyTypeEnum.parse("BAR")).toBe("BAR");
    expect(propertyTypeEnum.parse("HOTEL")).toBe("HOTEL");
    expect(propertyTypeEnum.parse("NIGHTCLUB")).toBe("NIGHTCLUB");
    expect(propertyTypeEnum.parse("FAST_FOOD")).toBe("FAST_FOOD");
    expect(propertyTypeEnum.parse("CATERING")).toBe("CATERING");
    expect(propertyTypeEnum.parse("OTHER")).toBe("OTHER");
  });

  it("rejects invalid property types", () => {
    expect(() => propertyTypeEnum.parse("INVALID")).toThrow();
  });
});

describe("alertFrequencyEnum", () => {
  it("accepts valid frequencies", () => {
    expect(alertFrequencyEnum.parse("INSTANT")).toBe("INSTANT");
    expect(alertFrequencyEnum.parse("DAILY")).toBe("DAILY");
    expect(alertFrequencyEnum.parse("WEEKLY")).toBe("WEEKLY");
    expect(alertFrequencyEnum.parse("MONTHLY")).toBe("MONTHLY");
  });

  it("rejects invalid frequencies", () => {
    expect(() => alertFrequencyEnum.parse("YEARLY")).toThrow();
  });
});

describe("updateSeekerProfileSchema", () => {
  it("accepts valid minimal input", () => {
    const result = updateSeekerProfileSchema.parse({});
    expect(result).toEqual({
      preferredCities: [],
      preferredTypes: [],
      mustHaveFeatures: [],
      emailAlerts: false,
    });
  });

  it("accepts valid complete input", () => {
    const input = {
      businessType: "Restaurant",
      conceptDescription: "A modern Italian restaurant",
      experienceYears: 5,
      budgetMin: 100000,
      budgetMax: 500000,
      preferredCities: ["Amsterdam", "Rotterdam"],
      preferredTypes: ["RESTAURANT", "CAFE"],
      minSurface: 100,
      maxSurface: 300,
      mustHaveFeatures: ["terrace", "kitchen"],
      emailAlerts: true,
      alertFrequency: "DAILY",
    };
    const result = updateSeekerProfileSchema.parse(input);
    expect(result.businessType).toBe("Restaurant");
    expect(result.experienceYears).toBe(5);
    expect(result.preferredCities).toEqual(["Amsterdam", "Rotterdam"]);
  });

  it("rejects conceptDescription over 2000 characters", () => {
    const input = {
      conceptDescription: "a".repeat(2001),
    };
    expect(() => updateSeekerProfileSchema.parse(input)).toThrow();
  });

  it("rejects experienceYears below 0", () => {
    const input = { experienceYears: -1 };
    expect(() => updateSeekerProfileSchema.parse(input)).toThrow();
  });

  it("rejects experienceYears above 50", () => {
    const input = { experienceYears: 51 };
    expect(() => updateSeekerProfileSchema.parse(input)).toThrow();
  });

  it("rejects negative budgetMin", () => {
    const input = { budgetMin: -100 };
    expect(() => updateSeekerProfileSchema.parse(input)).toThrow();
  });

  it("rejects budgetMin greater than budgetMax", () => {
    const input = { budgetMin: 500000, budgetMax: 100000 };
    expect(() => updateSeekerProfileSchema.parse(input)).toThrow();
  });

  it("rejects minSurface greater than maxSurface", () => {
    const input = { minSurface: 500, maxSurface: 100 };
    expect(() => updateSeekerProfileSchema.parse(input)).toThrow();
  });

  it("accepts invalid PropertyType in preferredTypes", () => {
    const input = { preferredTypes: ["INVALID_TYPE"] };
    expect(() => updateSeekerProfileSchema.parse(input)).toThrow();
  });
});

describe("createSearchAlertSchema", () => {
  it("accepts valid input", () => {
    const input = {
      name: "My Search",
      cities: ["Amsterdam"],
      propertyTypes: ["RESTAURANT"],
      priceMin: 100000,
      priceMax: 500000,
      surfaceMin: 100,
      surfaceMax: 300,
      mustHaveFeatures: ["terrace"],
      frequency: "WEEKLY",
    };
    const result = createSearchAlertSchema.parse(input);
    expect(result.name).toBe("My Search");
    expect(result.frequency).toBe("WEEKLY");
  });

  it("requires name with minimum 2 characters", () => {
    const input = { name: "A" };
    expect(() => createSearchAlertSchema.parse(input)).toThrow();
  });

  it("rejects name over 100 characters", () => {
    const input = { name: "a".repeat(101) };
    expect(() => createSearchAlertSchema.parse(input)).toThrow();
  });

  it("defaults frequency to DAILY", () => {
    const input = { name: "Test Alert" };
    const result = createSearchAlertSchema.parse(input);
    expect(result.frequency).toBe("DAILY");
  });

  it("defaults arrays to empty", () => {
    const input = { name: "Test Alert" };
    const result = createSearchAlertSchema.parse(input);
    expect(result.cities).toEqual([]);
    expect(result.propertyTypes).toEqual([]);
    expect(result.mustHaveFeatures).toEqual([]);
  });

  it("rejects priceMin greater than priceMax", () => {
    const input = { name: "Test", priceMin: 500000, priceMax: 100000 };
    expect(() => createSearchAlertSchema.parse(input)).toThrow();
  });

  it("rejects surfaceMin greater than surfaceMax", () => {
    const input = { name: "Test", surfaceMin: 500, surfaceMax: 100 };
    expect(() => createSearchAlertSchema.parse(input)).toThrow();
  });

  it("rejects negative price values", () => {
    expect(() =>
      createSearchAlertSchema.parse({ name: "Test", priceMin: -100 })
    ).toThrow();
    expect(() =>
      createSearchAlertSchema.parse({ name: "Test", priceMax: -100 })
    ).toThrow();
  });
});

describe("updateSearchAlertSchema", () => {
  it("accepts empty input (all optional)", () => {
    const result = updateSearchAlertSchema.parse({});
    expect(result).toEqual({});
  });

  it("accepts active boolean", () => {
    const result = updateSearchAlertSchema.parse({ active: true });
    expect(result.active).toBe(true);
  });

  it("accepts active set to false", () => {
    const result = updateSearchAlertSchema.parse({ active: false });
    expect(result.active).toBe(false);
  });

  it("accepts partial update with name", () => {
    const input = { name: "Updated Name" };
    const result = updateSearchAlertSchema.parse(input);
    expect(result.name).toBe("Updated Name");
  });

  it("validates name length when provided", () => {
    expect(() =>
      updateSearchAlertSchema.parse({ name: "A" })
    ).toThrow();
    expect(() =>
      updateSearchAlertSchema.parse({ name: "a".repeat(101) })
    ).toThrow();
  });

  it("validates priceMin/priceMax relationship when both provided", () => {
    expect(() =>
      updateSearchAlertSchema.parse({ priceMin: 500000, priceMax: 100000 })
    ).toThrow();
  });

  it("accepts priceMin alone", () => {
    const result = updateSearchAlertSchema.parse({ priceMin: 100000 });
    expect(result.priceMin).toBe(100000);
  });

  it("accepts priceMax alone", () => {
    const result = updateSearchAlertSchema.parse({ priceMax: 500000 });
    expect(result.priceMax).toBe(500000);
  });

  it("validates surfaceMin/surfaceMax relationship when both provided", () => {
    expect(() =>
      updateSearchAlertSchema.parse({ surfaceMin: 500, surfaceMax: 100 })
    ).toThrow();
  });

  it("accepts frequency update", () => {
    const result = updateSearchAlertSchema.parse({ frequency: "INSTANT" });
    expect(result.frequency).toBe("INSTANT");
  });

  it("accepts cities array update", () => {
    const result = updateSearchAlertSchema.parse({ cities: ["Amsterdam", "Utrecht"] });
    expect(result.cities).toEqual(["Amsterdam", "Utrecht"]);
  });

  it("accepts propertyTypes array update", () => {
    const result = updateSearchAlertSchema.parse({ propertyTypes: ["BAR", "NIGHTCLUB"] });
    expect(result.propertyTypes).toEqual(["BAR", "NIGHTCLUB"]);
  });
});
