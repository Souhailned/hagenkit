import { describe, it, expect } from "vitest";
import {
  generatePropertyStructuredData,
  generatePropertyBreadcrumbStructuredData,
  generateAgencyStructuredData,
} from "@/lib/property/structured-data";

describe("Property Structured Data", () => {
  const mockProperty = {
    id: "clh1234567890",
    slug: "restaurant-centrum-amsterdam",
    title: "Restaurant in Centrum Amsterdam",
    description: "Prachtig restaurant in het hart van Amsterdam",
    shortDescription: "Restaurant in centrum",
    address: "Damstraat 1",
    city: "Amsterdam",
    postalCode: "1012 AB",
    province: "Noord-Holland",
    country: "NL",
    latitude: 52.3702,
    longitude: 4.8952,
    priceType: "RENT",
    rentPrice: 450000, // €4,500/month in cents
    salePrice: null,
    surfaceTotal: 150,
    propertyType: "RESTAURANT",
    images: [
      {
        originalUrl: "/images/property1.jpg",
        largeUrl: "/images/property1-large.jpg",
        altText: "Restaurant interior",
      },
    ],
    agency: {
      name: "Horeca Makelaars",
      phone: "+31 20 123 4567",
      email: "info@horecamakelaars.nl",
      logoUrl: "/logo.png",
    },
    publishedAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-02-01"),
  };

  describe("generatePropertyStructuredData", () => {
    it("should generate valid RealEstateListing schema", () => {
      const result = generatePropertyStructuredData(mockProperty);

      expect(result["@context"]).toBe("https://schema.org");
      expect(result["@type"]).toBe("RealEstateListing");
      expect(result.name).toBe("Restaurant in Centrum Amsterdam");
      expect(result.description).toBe("Prachtig restaurant in het hart van Amsterdam");
    });

    it("should include address information", () => {
      const result = generatePropertyStructuredData(mockProperty);

      expect(result.address["@type"]).toBe("PostalAddress");
      expect(result.address.streetAddress).toBe("Damstraat 1");
      expect(result.address.addressLocality).toBe("Amsterdam");
      expect(result.address.postalCode).toBe("1012 AB");
      expect(result.address.addressRegion).toBe("Noord-Holland");
      expect(result.address.addressCountry).toBe("NL");
    });

    it("should include geo coordinates when available", () => {
      const result = generatePropertyStructuredData(mockProperty);

      expect(result.geo).toBeDefined();
      expect(result.geo["@type"]).toBe("GeoCoordinates");
      expect(result.geo.latitude).toBe(52.3702);
      expect(result.geo.longitude).toBe(4.8952);
    });

    it("should not include geo when coordinates are missing", () => {
      const propertyWithoutGeo = {
        ...mockProperty,
        latitude: null,
        longitude: null,
      };

      const result = generatePropertyStructuredData(propertyWithoutGeo);

      expect(result.geo).toBeUndefined();
    });

    it("should calculate price correctly from cents for rent", () => {
      const result = generatePropertyStructuredData(mockProperty);

      expect(result.offers).toBeDefined();
      expect(result.offers.price).toBe(4500); // 450000 cents = €4,500
      expect(result.offers.priceCurrency).toBe("EUR");
      expect(result.offers.priceSpecification.unitText).toBe("MONTH");
    });

    it("should handle sale price correctly", () => {
      const saleProperty = {
        ...mockProperty,
        priceType: "SALE",
        rentPrice: null,
        salePrice: 50000000, // €500,000 in cents
      };

      const result = generatePropertyStructuredData(saleProperty);

      expect(result.offers.price).toBe(500000);
      expect(result.offers.priceSpecification).toBeUndefined();
    });

    it("should include floor size", () => {
      const result = generatePropertyStructuredData(mockProperty);

      expect(result.floorSize["@type"]).toBe("QuantitativeValue");
      expect(result.floorSize.value).toBe(150);
      expect(result.floorSize.unitCode).toBe("MTK");
    });

    it("should include additional properties", () => {
      const result = generatePropertyStructuredData(mockProperty);

      expect(result.additionalProperty).toHaveLength(2);
      expect(result.additionalProperty[0].name).toBe("propertyType");
      expect(result.additionalProperty[0].value).toBe("RESTAURANT");
    });

    it("should include agency as seller", () => {
      const result = generatePropertyStructuredData(mockProperty);

      expect(result.offers.seller["@type"]).toBe("RealEstateAgent");
      expect(result.offers.seller.name).toBe("Horeca Makelaars");
      expect(result.offers.seller.telephone).toBe("+31 20 123 4567");
    });

    it("should include images", () => {
      const result = generatePropertyStructuredData(mockProperty);

      expect(result.image).toHaveLength(1);
      expect(result.image[0]).toBe("/images/property1-large.jpg");
    });
  });

  describe("generatePropertyBreadcrumbStructuredData", () => {
    it("should generate valid BreadcrumbList schema", () => {
      const result = generatePropertyBreadcrumbStructuredData(
        "Restaurant Amsterdam",
        "restaurant-amsterdam",
        "Amsterdam"
      );

      expect(result["@context"]).toBe("https://schema.org");
      expect(result["@type"]).toBe("BreadcrumbList");
      expect(result.itemListElement).toHaveLength(4);
    });

    it("should include all breadcrumb items in correct order", () => {
      const result = generatePropertyBreadcrumbStructuredData(
        "Restaurant Amsterdam",
        "restaurant-amsterdam",
        "Amsterdam"
      );

      expect(result.itemListElement[0].position).toBe(1);
      expect(result.itemListElement[0].name).toBe("Home");

      expect(result.itemListElement[1].position).toBe(2);
      expect(result.itemListElement[1].name).toBe("Aanbod");

      expect(result.itemListElement[2].position).toBe(3);
      expect(result.itemListElement[2].name).toBe("Amsterdam");

      expect(result.itemListElement[3].position).toBe(4);
      expect(result.itemListElement[3].name).toBe("Restaurant Amsterdam");
    });

    it("should work without city", () => {
      const result = generatePropertyBreadcrumbStructuredData(
        "Restaurant",
        "restaurant"
      );

      expect(result.itemListElement).toHaveLength(3);
      expect(result.itemListElement[2].name).toBe("Restaurant");
    });
  });

  describe("generateAgencyStructuredData", () => {
    const mockAgency = {
      name: "Horeca Makelaars",
      description: "Specialist in horecavastgoed",
      phone: "+31 20 123 4567",
      email: "info@horecamakelaars.nl",
      website: "https://horecamakelaars.nl",
      logoUrl: "/logo.png",
      city: "Amsterdam",
      province: "Noord-Holland",
    };

    it("should generate valid RealEstateAgent schema", () => {
      const result = generateAgencyStructuredData(mockAgency);

      expect(result["@context"]).toBe("https://schema.org");
      expect(result["@type"]).toBe("RealEstateAgent");
      expect(result.name).toBe("Horeca Makelaars");
    });

    it("should include contact information", () => {
      const result = generateAgencyStructuredData(mockAgency);

      expect(result.telephone).toBe("+31 20 123 4567");
      expect(result.email).toBe("info@horecamakelaars.nl");
      expect(result.url).toBe("https://horecamakelaars.nl");
    });

    it("should include address when city is provided", () => {
      const result = generateAgencyStructuredData(mockAgency);

      expect(result.address).toBeDefined();
      expect(result.address["@type"]).toBe("PostalAddress");
      expect(result.address.addressLocality).toBe("Amsterdam");
      expect(result.address.addressRegion).toBe("Noord-Holland");
    });

    it("should handle missing optional fields", () => {
      const minimalAgency = {
        name: "Test Agency",
        description: null,
        phone: null,
        email: null,
        website: null,
        logoUrl: null,
        city: null,
        province: null,
      };

      const result = generateAgencyStructuredData(minimalAgency);

      expect(result.name).toBe("Test Agency");
      expect(result.address).toBeUndefined();
      expect(result.logo).toBeUndefined();
    });
  });
});
