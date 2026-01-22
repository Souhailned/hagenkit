import { describe, expect, it } from "vitest";
import {
  createPropertySchema,
  updatePropertySchema,
  propertyFilterSchema,
  listPropertiesSchema,
  propertyTypeEnum,
  priceTypeEnum,
  propertyStatusEnum,
  featureCategoryEnum,
  propertyImageTypeEnum,
  propertySortByEnum,
  sortOrderEnum,
} from "../property";

describe("Property Validation Schemas", () => {
  describe("Property Enums", () => {
    it("should validate property types", () => {
      expect(propertyTypeEnum.safeParse("RESTAURANT").success).toBe(true);
      expect(propertyTypeEnum.safeParse("CAFE").success).toBe(true);
      expect(propertyTypeEnum.safeParse("BAR").success).toBe(true);
      expect(propertyTypeEnum.safeParse("HOTEL").success).toBe(true);
      expect(propertyTypeEnum.safeParse("DARK_KITCHEN").success).toBe(true);
      expect(propertyTypeEnum.safeParse("NIGHTCLUB").success).toBe(true);
      expect(propertyTypeEnum.safeParse("FOOD_COURT").success).toBe(true);
      expect(propertyTypeEnum.safeParse("CATERING").success).toBe(true);
      expect(propertyTypeEnum.safeParse("BAKERY").success).toBe(true);
      expect(propertyTypeEnum.safeParse("OTHER").success).toBe(true);
      expect(propertyTypeEnum.safeParse("INVALID").success).toBe(false);
    });

    it("should validate price types", () => {
      expect(priceTypeEnum.safeParse("RENT").success).toBe(true);
      expect(priceTypeEnum.safeParse("SALE").success).toBe(true);
      expect(priceTypeEnum.safeParse("RENT_OR_SALE").success).toBe(true);
      expect(priceTypeEnum.safeParse("INVALID").success).toBe(false);
    });

    it("should validate property status", () => {
      expect(propertyStatusEnum.safeParse("DRAFT").success).toBe(true);
      expect(propertyStatusEnum.safeParse("PENDING_REVIEW").success).toBe(true);
      expect(propertyStatusEnum.safeParse("ACTIVE").success).toBe(true);
      expect(propertyStatusEnum.safeParse("UNDER_OFFER").success).toBe(true);
      expect(propertyStatusEnum.safeParse("RENTED").success).toBe(true);
      expect(propertyStatusEnum.safeParse("SOLD").success).toBe(true);
      expect(propertyStatusEnum.safeParse("ARCHIVED").success).toBe(true);
      expect(propertyStatusEnum.safeParse("REJECTED").success).toBe(true);
      expect(propertyStatusEnum.safeParse("INVALID").success).toBe(false);
    });

    it("should validate feature categories", () => {
      expect(featureCategoryEnum.safeParse("LICENSE").success).toBe(true);
      expect(featureCategoryEnum.safeParse("FACILITY").success).toBe(true);
      expect(featureCategoryEnum.safeParse("UTILITY").success).toBe(true);
      expect(featureCategoryEnum.safeParse("ACCESSIBILITY").success).toBe(true);
      expect(featureCategoryEnum.safeParse("INVALID").success).toBe(false);
    });

    it("should validate property image types", () => {
      expect(propertyImageTypeEnum.safeParse("EXTERIOR").success).toBe(true);
      expect(propertyImageTypeEnum.safeParse("INTERIOR").success).toBe(true);
      expect(propertyImageTypeEnum.safeParse("KITCHEN").success).toBe(true);
      expect(propertyImageTypeEnum.safeParse("TERRACE").success).toBe(true);
      expect(propertyImageTypeEnum.safeParse("BATHROOM").success).toBe(true);
      expect(propertyImageTypeEnum.safeParse("STORAGE").success).toBe(true);
      expect(propertyImageTypeEnum.safeParse("FLOORPLAN").success).toBe(true);
      expect(propertyImageTypeEnum.safeParse("LOCATION").success).toBe(true);
      expect(propertyImageTypeEnum.safeParse("RENDER").success).toBe(true);
      expect(propertyImageTypeEnum.safeParse("OTHER").success).toBe(true);
      expect(propertyImageTypeEnum.safeParse("INVALID").success).toBe(false);
    });

    it("should validate sort by options", () => {
      expect(propertySortByEnum.safeParse("createdAt").success).toBe(true);
      expect(propertySortByEnum.safeParse("publishedAt").success).toBe(true);
      expect(propertySortByEnum.safeParse("rentPrice").success).toBe(true);
      expect(propertySortByEnum.safeParse("salePrice").success).toBe(true);
      expect(propertySortByEnum.safeParse("surfaceTotal").success).toBe(true);
      expect(propertySortByEnum.safeParse("viewCount").success).toBe(true);
      expect(propertySortByEnum.safeParse("invalid").success).toBe(false);
    });

    it("should validate sort order", () => {
      expect(sortOrderEnum.safeParse("asc").success).toBe(true);
      expect(sortOrderEnum.safeParse("desc").success).toBe(true);
      expect(sortOrderEnum.safeParse("invalid").success).toBe(false);
    });
  });

  describe("createPropertySchema", () => {
    const validProperty = {
      title: "Beautiful Restaurant",
      propertyType: "RESTAURANT",
      priceType: "RENT",
      address: "Kalverstraat 1",
      city: "Amsterdam",
      postalCode: "1012AB",
      surfaceTotal: 150,
    };

    it("should accept valid property data", () => {
      const result = createPropertySchema.safeParse(validProperty);
      expect(result.success).toBe(true);
    });

    it("should reject title shorter than 5 characters", () => {
      const result = createPropertySchema.safeParse({
        ...validProperty,
        title: "Test",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("at least 5");
      }
    });

    it("should reject title longer than 200 characters", () => {
      const result = createPropertySchema.safeParse({
        ...validProperty,
        title: "A".repeat(201),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("at most 200");
      }
    });

    it("should accept optional description", () => {
      const result = createPropertySchema.safeParse({
        ...validProperty,
        description: "A beautiful restaurant in the heart of Amsterdam",
      });
      expect(result.success).toBe(true);
    });

    it("should accept optional pricing fields", () => {
      const result = createPropertySchema.safeParse({
        ...validProperty,
        rentPrice: 250000, // 2500.00 EUR in cents
        servicesCosts: 15000, // 150.00 EUR in cents
        depositMonths: 3,
      });
      expect(result.success).toBe(true);
    });

    it("should reject negative prices", () => {
      const result = createPropertySchema.safeParse({
        ...validProperty,
        rentPrice: -1000,
      });
      expect(result.success).toBe(false);
    });

    it("should reject negative surface", () => {
      const result = createPropertySchema.safeParse({
        ...validProperty,
        surfaceTotal: -50,
      });
      expect(result.success).toBe(false);
    });

    it("should accept all optional location fields", () => {
      const result = createPropertySchema.safeParse({
        ...validProperty,
        addressLine2: "2nd floor",
        province: "Noord-Holland",
        latitude: 52.3676,
        longitude: 4.9041,
        neighborhood: "Centrum",
      });
      expect(result.success).toBe(true);
    });

    it("should accept horeca-specific fields", () => {
      const result = createPropertySchema.safeParse({
        ...validProperty,
        seatingCapacityInside: 80,
        seatingCapacityOutside: 40,
        standingCapacity: 100,
        kitchenType: "professional",
        hasBasement: true,
        hasStorage: true,
        hasTerrace: true,
        hasParking: false,
      });
      expect(result.success).toBe(true);
    });

    it("should accept building info fields", () => {
      const result = createPropertySchema.safeParse({
        ...validProperty,
        buildYear: 1920,
        lastRenovation: 2020,
        monumentStatus: true,
        energyLabel: "B",
      });
      expect(result.success).toBe(true);
    });

    it("should reject build year before 1800", () => {
      const result = createPropertySchema.safeParse({
        ...validProperty,
        buildYear: 1700,
      });
      expect(result.success).toBe(false);
    });

    it("should reject build year after 2100", () => {
      const result = createPropertySchema.safeParse({
        ...validProperty,
        buildYear: 2200,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updatePropertySchema", () => {
    it("should require property ID", () => {
      const result = updatePropertySchema.safeParse({
        title: "Updated Title",
      });
      expect(result.success).toBe(false);
    });

    it("should accept partial updates with ID", () => {
      const result = updatePropertySchema.safeParse({
        id: "clx123abc",
        title: "Updated Restaurant Title",
      });
      expect(result.success).toBe(true);
    });

    it("should accept status update", () => {
      const result = updatePropertySchema.safeParse({
        id: "clx123abc",
        status: "ACTIVE",
      });
      expect(result.success).toBe(true);
    });

    it("should accept multiple field updates", () => {
      const result = updatePropertySchema.safeParse({
        id: "clx123abc",
        title: "Updated Title",
        rentPrice: 300000,
        hasTerrace: true,
        status: "PENDING_REVIEW",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("propertyFilterSchema", () => {
    it("should accept empty filters", () => {
      const result = propertyFilterSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should accept cities array", () => {
      const result = propertyFilterSchema.safeParse({
        cities: ["Amsterdam", "Rotterdam", "Utrecht"],
      });
      expect(result.success).toBe(true);
    });

    it("should accept property types array", () => {
      const result = propertyFilterSchema.safeParse({
        propertyTypes: ["RESTAURANT", "CAFE", "BAR"],
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid property types", () => {
      const result = propertyFilterSchema.safeParse({
        propertyTypes: ["INVALID_TYPE"],
      });
      expect(result.success).toBe(false);
    });

    it("should accept price range filters", () => {
      const result = propertyFilterSchema.safeParse({
        priceType: "RENT",
        priceMin: 100000,
        priceMax: 500000,
      });
      expect(result.success).toBe(true);
    });

    it("should accept surface range filters", () => {
      const result = propertyFilterSchema.safeParse({
        surfaceMin: 50,
        surfaceMax: 200,
      });
      expect(result.success).toBe(true);
    });

    it("should accept features array", () => {
      const result = propertyFilterSchema.safeParse({
        features: ["alcohol_license", "terrace", "extraction"],
      });
      expect(result.success).toBe(true);
    });

    it("should accept hasTerrace filter", () => {
      const result = propertyFilterSchema.safeParse({
        hasTerrace: true,
      });
      expect(result.success).toBe(true);
    });

    it("should accept hasKitchen filter", () => {
      const result = propertyFilterSchema.safeParse({
        hasKitchen: true,
      });
      expect(result.success).toBe(true);
    });

    it("should accept combined filters", () => {
      const result = propertyFilterSchema.safeParse({
        cities: ["Amsterdam"],
        propertyTypes: ["RESTAURANT", "CAFE"],
        priceType: "RENT",
        priceMin: 200000,
        priceMax: 400000,
        surfaceMin: 100,
        surfaceMax: 300,
        features: ["alcohol_license"],
        hasTerrace: true,
        hasKitchen: true,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("listPropertiesSchema", () => {
    it("should accept empty input and use defaults", () => {
      const result = listPropertiesSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.sortOrder).toBe("desc");
      }
    });

    it("should accept custom pagination", () => {
      const result = listPropertiesSchema.safeParse({
        page: 3,
        limit: 50,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(50);
      }
    });

    it("should reject limit over 100", () => {
      const result = listPropertiesSchema.safeParse({
        limit: 150,
      });
      expect(result.success).toBe(false);
    });

    it("should reject page less than 1", () => {
      const result = listPropertiesSchema.safeParse({
        page: 0,
      });
      expect(result.success).toBe(false);
    });

    it("should accept sorting options", () => {
      const result = listPropertiesSchema.safeParse({
        sortBy: "rentPrice",
        sortOrder: "asc",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sortBy).toBe("rentPrice");
        expect(result.data.sortOrder).toBe("asc");
      }
    });

    it("should accept filters", () => {
      const result = listPropertiesSchema.safeParse({
        filters: {
          cities: ["Amsterdam"],
          propertyTypes: ["RESTAURANT"],
        },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.filters?.cities).toEqual(["Amsterdam"]);
      }
    });

    it("should accept search query", () => {
      const result = listPropertiesSchema.safeParse({
        search: "restaurant amsterdam centrum",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.search).toBe("restaurant amsterdam centrum");
      }
    });

    it("should accept full query with all options", () => {
      const result = listPropertiesSchema.safeParse({
        page: 2,
        limit: 25,
        sortBy: "publishedAt",
        sortOrder: "desc",
        filters: {
          cities: ["Amsterdam", "Rotterdam"],
          propertyTypes: ["RESTAURANT", "CAFE"],
          priceType: "RENT",
          priceMin: 150000,
          priceMax: 350000,
        },
        search: "terras centrum",
      });
      expect(result.success).toBe(true);
    });
  });
});
