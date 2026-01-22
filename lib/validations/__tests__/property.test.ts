/**
 * Tests for property validation schemas
 * Run with: npx tsx lib/validations/__tests__/property.test.ts
 */

import {
  createPropertySchema,
  updatePropertySchema,
  propertyFilterSchema,
  listPropertiesSchema,
  propertyTypeEnum,
  priceTypeEnum,
  propertyStatusEnum,
} from "../property";

// Simple assertion helper
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Test counters
let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${(error as Error).message}`);
    failed++;
  }
}

// ============================================================================
// Enum Tests
// ============================================================================

console.log("\n📋 Property Type Enum");

test("accepts valid property types", () => {
  const types = [
    "RESTAURANT",
    "CAFE",
    "BAR",
    "HOTEL",
    "DARK_KITCHEN",
    "NIGHTCLUB",
    "FOOD_COURT",
    "CATERING",
    "BAKERY",
    "OTHER",
  ];
  for (const type of types) {
    const result = propertyTypeEnum.safeParse(type);
    assert(result.success, `${type} should be valid`);
  }
});

test("rejects invalid property type", () => {
  const result = propertyTypeEnum.safeParse("INVALID_TYPE");
  assert(!result.success, "INVALID_TYPE should be rejected");
});

console.log("\n💰 Price Type Enum");

test("accepts valid price types", () => {
  const types = ["RENT", "SALE", "RENT_OR_SALE"];
  for (const type of types) {
    const result = priceTypeEnum.safeParse(type);
    assert(result.success, `${type} should be valid`);
  }
});

test("rejects invalid price type", () => {
  const result = priceTypeEnum.safeParse("FREE");
  assert(!result.success, "FREE should be rejected");
});

console.log("\n📊 Property Status Enum");

test("accepts valid property statuses", () => {
  const statuses = [
    "DRAFT",
    "PENDING_REVIEW",
    "ACTIVE",
    "UNDER_OFFER",
    "RENTED",
    "SOLD",
    "ARCHIVED",
    "REJECTED",
  ];
  for (const status of statuses) {
    const result = propertyStatusEnum.safeParse(status);
    assert(result.success, `${status} should be valid`);
  }
});

// ============================================================================
// Create Property Schema Tests
// ============================================================================

console.log("\n🏠 Create Property Schema");

test("accepts valid minimal property", () => {
  const result = createPropertySchema.safeParse({
    title: "Beautiful Cafe in Amsterdam",
    propertyType: "CAFE",
    priceType: "RENT",
    address: "Prinsengracht 123",
    city: "Amsterdam",
    postalCode: "1015 DV",
    surfaceTotal: 150,
  });
  assert(result.success, "Minimal valid property should be accepted");
});

test("accepts property with all optional fields", () => {
  const result = createPropertySchema.safeParse({
    title: "Complete Restaurant Listing",
    propertyType: "RESTAURANT",
    priceType: "SALE",
    address: "Kalverstraat 45",
    city: "Amsterdam",
    postalCode: "1012 NZ",
    surfaceTotal: 300,
    description: "A beautiful restaurant in the heart of Amsterdam",
    shortDescription: "Central restaurant",
    rentPrice: 500000,
    salePrice: 75000000,
    servicesCosts: 15000,
    depositMonths: 3,
    surfaceCommercial: 250,
    surfaceKitchen: 50,
    floors: 2,
    ceilingHeight: 3.5,
    seatingCapacityInside: 80,
    seatingCapacityOutside: 30,
    hasTerrace: true,
    hasKitchen: true,
    buildYear: 1920,
    lastRenovation: 2020,
    energyLabel: "B",
    latitude: 52.3676,
    longitude: 4.9041,
  });
  assert(result.success, "Property with all optional fields should be accepted");
});

test("rejects title shorter than 5 characters", () => {
  const result = createPropertySchema.safeParse({
    title: "Cafe",
    propertyType: "CAFE",
    priceType: "RENT",
    address: "Street 1",
    city: "Amsterdam",
    postalCode: "1000 AA",
    surfaceTotal: 100,
  });
  assert(!result.success, "Title with 4 characters should be rejected");
});

test("rejects title longer than 200 characters", () => {
  const result = createPropertySchema.safeParse({
    title: "A".repeat(201),
    propertyType: "CAFE",
    priceType: "RENT",
    address: "Street 1",
    city: "Amsterdam",
    postalCode: "1000 AA",
    surfaceTotal: 100,
  });
  assert(!result.success, "Title with 201 characters should be rejected");
});

test("rejects missing required fields", () => {
  const result = createPropertySchema.safeParse({
    title: "Valid Title Here",
  });
  assert(!result.success, "Missing required fields should be rejected");
});

test("rejects negative surfaceTotal", () => {
  const result = createPropertySchema.safeParse({
    title: "Valid Cafe Title",
    propertyType: "CAFE",
    priceType: "RENT",
    address: "Street 1",
    city: "Amsterdam",
    postalCode: "1000 AA",
    surfaceTotal: -50,
  });
  assert(!result.success, "Negative surfaceTotal should be rejected");
});

test("rejects zero surfaceTotal", () => {
  const result = createPropertySchema.safeParse({
    title: "Valid Cafe Title",
    propertyType: "CAFE",
    priceType: "RENT",
    address: "Street 1",
    city: "Amsterdam",
    postalCode: "1000 AA",
    surfaceTotal: 0,
  });
  assert(!result.success, "Zero surfaceTotal should be rejected");
});

test("rejects negative rentPrice", () => {
  const result = createPropertySchema.safeParse({
    title: "Valid Cafe Title",
    propertyType: "CAFE",
    priceType: "RENT",
    address: "Street 1",
    city: "Amsterdam",
    postalCode: "1000 AA",
    surfaceTotal: 100,
    rentPrice: -5000,
  });
  assert(!result.success, "Negative rentPrice should be rejected");
});

test("defaults country to NL", () => {
  const result = createPropertySchema.safeParse({
    title: "Valid Cafe Title",
    propertyType: "CAFE",
    priceType: "RENT",
    address: "Street 1",
    city: "Amsterdam",
    postalCode: "1000 AA",
    surfaceTotal: 100,
  });
  assert(result.success, "Should parse successfully");
  if (result.success) {
    assert(result.data.country === "NL", "Country should default to NL");
  }
});

test("defaults priceNegotiable to true", () => {
  const result = createPropertySchema.safeParse({
    title: "Valid Cafe Title",
    propertyType: "CAFE",
    priceType: "RENT",
    address: "Street 1",
    city: "Amsterdam",
    postalCode: "1000 AA",
    surfaceTotal: 100,
  });
  assert(result.success, "Should parse successfully");
  if (result.success) {
    assert(result.data.priceNegotiable === true, "priceNegotiable should default to true");
  }
});

// ============================================================================
// Update Property Schema Tests
// ============================================================================

console.log("\n✏️ Update Property Schema");

test("accepts partial update with only title", () => {
  const result = updatePropertySchema.safeParse({
    title: "Updated Title Here",
  });
  assert(result.success, "Partial update should be accepted");
});

test("accepts status field in update", () => {
  const result = updatePropertySchema.safeParse({
    status: "ACTIVE",
  });
  assert(result.success, "Status should be accepted in update");
});

test("accepts empty update", () => {
  const result = updatePropertySchema.safeParse({});
  assert(result.success, "Empty update should be accepted");
});

test("accepts adminNotes in update", () => {
  const result = updatePropertySchema.safeParse({
    adminNotes: "Property verified by admin",
  });
  assert(result.success, "adminNotes should be accepted");
});

test("accepts rejectionReason in update", () => {
  const result = updatePropertySchema.safeParse({
    status: "REJECTED",
    rejectionReason: "Missing required documents",
  });
  assert(result.success, "rejectionReason should be accepted");
});

// ============================================================================
// Property Filter Schema Tests
// ============================================================================

console.log("\n🔍 Property Filter Schema");

test("accepts valid filter with cities", () => {
  const result = propertyFilterSchema.safeParse({
    cities: ["Amsterdam", "Rotterdam", "Utrecht"],
  });
  assert(result.success, "Cities filter should be accepted");
});

test("accepts valid filter with propertyTypes", () => {
  const result = propertyFilterSchema.safeParse({
    propertyTypes: ["RESTAURANT", "CAFE", "BAR"],
  });
  assert(result.success, "PropertyTypes filter should be accepted");
});

test("accepts valid filter with priceType", () => {
  const result = propertyFilterSchema.safeParse({
    priceType: "RENT",
  });
  assert(result.success, "PriceType filter should be accepted");
});

test("accepts valid filter with price range", () => {
  const result = propertyFilterSchema.safeParse({
    priceMin: 100000,
    priceMax: 500000,
  });
  assert(result.success, "Price range filter should be accepted");
});

test("accepts valid filter with surface range", () => {
  const result = propertyFilterSchema.safeParse({
    surfaceMin: 50,
    surfaceMax: 200,
  });
  assert(result.success, "Surface range filter should be accepted");
});

test("accepts valid filter with features", () => {
  const result = propertyFilterSchema.safeParse({
    features: ["alcohol_license", "extraction_system"],
  });
  assert(result.success, "Features filter should be accepted");
});

test("accepts valid filter with hasTerrace", () => {
  const result = propertyFilterSchema.safeParse({
    hasTerrace: true,
  });
  assert(result.success, "hasTerrace filter should be accepted");
});

test("accepts valid filter with hasKitchen", () => {
  const result = propertyFilterSchema.safeParse({
    hasKitchen: true,
  });
  assert(result.success, "hasKitchen filter should be accepted");
});

test("accepts complete filter combination", () => {
  const result = propertyFilterSchema.safeParse({
    cities: ["Amsterdam"],
    propertyTypes: ["CAFE"],
    priceType: "RENT",
    priceMin: 100000,
    priceMax: 300000,
    surfaceMin: 100,
    surfaceMax: 300,
    features: ["alcohol_license"],
    hasTerrace: true,
    hasKitchen: false,
  });
  assert(result.success, "Complete filter should be accepted");
});

test("accepts empty filter", () => {
  const result = propertyFilterSchema.safeParse({});
  assert(result.success, "Empty filter should be accepted");
});

test("rejects invalid propertyType in filter", () => {
  const result = propertyFilterSchema.safeParse({
    propertyTypes: ["INVALID_TYPE"],
  });
  assert(!result.success, "Invalid property type should be rejected");
});

// ============================================================================
// List Properties Schema Tests
// ============================================================================

console.log("\n📄 List Properties Schema");

test("accepts minimal list request", () => {
  const result = listPropertiesSchema.safeParse({});
  assert(result.success, "Minimal list request should be accepted");
});

test("defaults page to 1", () => {
  const result = listPropertiesSchema.safeParse({});
  assert(result.success, "Should parse successfully");
  if (result.success) {
    assert(result.data.page === 1, "Page should default to 1");
  }
});

test("defaults limit to 20", () => {
  const result = listPropertiesSchema.safeParse({});
  assert(result.success, "Should parse successfully");
  if (result.success) {
    assert(result.data.limit === 20, "Limit should default to 20");
  }
});

test("accepts custom page and limit", () => {
  const result = listPropertiesSchema.safeParse({
    page: 5,
    limit: 50,
  });
  assert(result.success, "Custom page and limit should be accepted");
  if (result.success) {
    assert(result.data.page === 5, "Page should be 5");
    assert(result.data.limit === 50, "Limit should be 50");
  }
});

test("rejects limit over 100", () => {
  const result = listPropertiesSchema.safeParse({
    limit: 150,
  });
  assert(!result.success, "Limit over 100 should be rejected");
});

test("accepts valid sortBy values", () => {
  const sortByValues = [
    "createdAt",
    "publishedAt",
    "rentPrice",
    "salePrice",
    "surfaceTotal",
    "viewCount",
    "title",
  ];
  for (const sortBy of sortByValues) {
    const result = listPropertiesSchema.safeParse({ sortBy });
    assert(result.success, `${sortBy} should be valid sortBy`);
  }
});

test("defaults sortBy to createdAt", () => {
  const result = listPropertiesSchema.safeParse({});
  assert(result.success, "Should parse successfully");
  if (result.success) {
    assert(result.data.sortBy === "createdAt", "sortBy should default to createdAt");
  }
});

test("accepts asc and desc sortOrder", () => {
  const ascResult = listPropertiesSchema.safeParse({ sortOrder: "asc" });
  const descResult = listPropertiesSchema.safeParse({ sortOrder: "desc" });
  assert(ascResult.success, "asc should be valid");
  assert(descResult.success, "desc should be valid");
});

test("defaults sortOrder to desc", () => {
  const result = listPropertiesSchema.safeParse({});
  assert(result.success, "Should parse successfully");
  if (result.success) {
    assert(result.data.sortOrder === "desc", "sortOrder should default to desc");
  }
});

test("accepts search string", () => {
  const result = listPropertiesSchema.safeParse({
    search: "cafe amsterdam",
  });
  assert(result.success, "Search string should be accepted");
});

test("accepts filters in list request", () => {
  const result = listPropertiesSchema.safeParse({
    filters: {
      cities: ["Amsterdam"],
      propertyTypes: ["CAFE"],
      hasTerrace: true,
    },
  });
  assert(result.success, "Filters should be accepted in list request");
});

test("accepts complete list request", () => {
  const result = listPropertiesSchema.safeParse({
    page: 2,
    limit: 30,
    sortBy: "rentPrice",
    sortOrder: "asc",
    filters: {
      cities: ["Amsterdam", "Rotterdam"],
      propertyTypes: ["RESTAURANT", "CAFE"],
      priceType: "RENT",
      priceMin: 100000,
      priceMax: 500000,
    },
    search: "centrum",
  });
  assert(result.success, "Complete list request should be accepted");
});

// ============================================================================
// Summary
// ============================================================================

console.log("\n" + "=".repeat(50));
console.log(`Tests completed: ${passed} passed, ${failed} failed`);
console.log("=".repeat(50) + "\n");

if (failed > 0) {
  process.exit(1);
}
