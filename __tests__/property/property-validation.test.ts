import { describe, it, expect } from "vitest";
import {
  propertyInquirySchema,
  propertyViewSchema,
} from "@/lib/validations/property";

describe("Property Validation Schemas", () => {
  describe("propertyInquirySchema", () => {
    it("should validate a complete valid inquiry", () => {
      const validInquiry = {
        propertyId: "clh1234567890",
        name: "Jan de Vries",
        email: "jan@example.nl",
        phone: "0612345678",
        message: "Ik ben geïnteresseerd in dit pand voor mijn nieuwe restaurant.",
        conceptDescription: "Modern Italiaans restaurant",
        budget: 100000,
        intendedUse: "restaurant",
      };

      const result = propertyInquirySchema.safeParse(validInquiry);
      expect(result.success).toBe(true);
    });

    it("should validate minimal required fields", () => {
      const minimalInquiry = {
        propertyId: "clh1234567890",
        name: "Jan",
        email: "jan@example.nl",
        message: "Graag meer informatie over dit pand.",
      };

      const result = propertyInquirySchema.safeParse(minimalInquiry);
      expect(result.success).toBe(true);
    });

    it("should reject missing propertyId", () => {
      const inquiry = {
        name: "Jan",
        email: "jan@example.nl",
        message: "Test message hier.",
      };

      const result = propertyInquirySchema.safeParse(inquiry);
      expect(result.success).toBe(false);
    });

    it("should reject name that is too short", () => {
      const inquiry = {
        propertyId: "clh1234567890",
        name: "J",
        email: "jan@example.nl",
        message: "Test message hier.",
      };

      const result = propertyInquirySchema.safeParse(inquiry);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("name");
      }
    });

    it("should reject invalid email", () => {
      const inquiry = {
        propertyId: "clh1234567890",
        name: "Jan de Vries",
        email: "invalid-email",
        message: "Test message hier.",
      };

      const result = propertyInquirySchema.safeParse(inquiry);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("email");
      }
    });

    it("should reject message that is too short", () => {
      const inquiry = {
        propertyId: "clh1234567890",
        name: "Jan de Vries",
        email: "jan@example.nl",
        message: "Kort",
      };

      const result = propertyInquirySchema.safeParse(inquiry);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("message");
      }
    });

    it("should allow empty optional fields", () => {
      const inquiry = {
        propertyId: "clh1234567890",
        name: "Jan de Vries",
        email: "jan@example.nl",
        message: "Test message met voldoende lengte.",
        phone: "",
        conceptDescription: "",
        intendedUse: "",
      };

      const result = propertyInquirySchema.safeParse(inquiry);
      expect(result.success).toBe(true);
    });

    it("should validate budget as number", () => {
      const inquiry = {
        propertyId: "clh1234567890",
        name: "Jan de Vries",
        email: "jan@example.nl",
        message: "Test message met voldoende lengte.",
        budget: 50000,
      };

      const result = propertyInquirySchema.safeParse(inquiry);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.budget).toBe(50000);
      }
    });

    it("should reject negative budget", () => {
      const inquiry = {
        propertyId: "clh1234567890",
        name: "Jan de Vries",
        email: "jan@example.nl",
        message: "Test message met voldoende lengte.",
        budget: -100,
      };

      const result = propertyInquirySchema.safeParse(inquiry);
      expect(result.success).toBe(false);
    });
  });

  describe("propertyViewSchema", () => {
    it("should validate a complete view record", () => {
      const validView = {
        propertyId: "clh1234567890",
        sessionId: "session-123-abc",
        source: "google",
        deviceType: "desktop" as const,
      };

      const result = propertyViewSchema.safeParse(validView);
      expect(result.success).toBe(true);
    });

    it("should validate minimal required fields", () => {
      const minimalView = {
        propertyId: "clh1234567890",
      };

      const result = propertyViewSchema.safeParse(minimalView);
      expect(result.success).toBe(true);
    });

    it("should validate all device types", () => {
      const deviceTypes = ["mobile", "desktop", "tablet"] as const;

      for (const deviceType of deviceTypes) {
        const view = {
          propertyId: "clh1234567890",
          deviceType,
        };

        const result = propertyViewSchema.safeParse(view);
        expect(result.success).toBe(true);
      }
    });

    it("should reject invalid device type", () => {
      const view = {
        propertyId: "clh1234567890",
        deviceType: "smartwatch",
      };

      const result = propertyViewSchema.safeParse(view);
      expect(result.success).toBe(false);
    });

    it("should reject missing propertyId", () => {
      const view = {
        sessionId: "session-123",
      };

      const result = propertyViewSchema.safeParse(view);
      expect(result.success).toBe(false);
    });

    it("should reject empty propertyId", () => {
      const view = {
        propertyId: "",
      };

      const result = propertyViewSchema.safeParse(view);
      expect(result.success).toBe(false);
    });
  });
});
