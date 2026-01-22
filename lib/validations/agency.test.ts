import { describe, expect, test } from "bun:test";
import {
  createAgencySchema,
  updateAgencySchema,
  inviteAgentSchema,
  updateAgentRoleSchema,
  removeAgentSchema,
  acceptAgencyInvitationSchema,
  agencyRoleEnum,
} from "./agency";

describe("agencyRoleEnum", () => {
  test("accepts valid roles", () => {
    expect(agencyRoleEnum.parse("OWNER")).toBe("OWNER");
    expect(agencyRoleEnum.parse("ADMIN")).toBe("ADMIN");
    expect(agencyRoleEnum.parse("AGENT")).toBe("AGENT");
    expect(agencyRoleEnum.parse("VIEWER")).toBe("VIEWER");
  });

  test("rejects invalid roles", () => {
    expect(() => agencyRoleEnum.parse("INVALID")).toThrow();
    expect(() => agencyRoleEnum.parse("owner")).toThrow(); // lowercase
    expect(() => agencyRoleEnum.parse("")).toThrow();
  });
});

describe("createAgencySchema", () => {
  const validData = {
    name: "Test Agency",
    slug: "test-agency",
    address: "123 Main Street",
    city: "Amsterdam",
    postalCode: "1012AB",
  };

  test("accepts valid data with required fields only", () => {
    const result = createAgencySchema.parse(validData);
    expect(result.name).toBe("Test Agency");
    expect(result.slug).toBe("test-agency");
    expect(result.address).toBe("123 Main Street");
    expect(result.city).toBe("Amsterdam");
    expect(result.postalCode).toBe("1012AB");
  });

  test("accepts valid data with all optional fields", () => {
    const result = createAgencySchema.parse({
      ...validData,
      description: "A great agency",
      kvkNumber: "12345678",
      phone: "+31612345678",
      email: "info@agency.nl",
      website: "https://agency.nl",
    });
    expect(result.description).toBe("A great agency");
    expect(result.kvkNumber).toBe("12345678");
    expect(result.email).toBe("info@agency.nl");
    expect(result.website).toBe("https://agency.nl");
  });

  test("accepts empty strings for optional fields", () => {
    const result = createAgencySchema.parse({
      ...validData,
      description: "",
      kvkNumber: "",
      phone: "",
      email: "",
      website: "",
    });
    expect(result.description).toBe("");
    expect(result.kvkNumber).toBe("");
  });

  describe("name validation", () => {
    test("rejects name shorter than 2 characters", () => {
      expect(() => createAgencySchema.parse({ ...validData, name: "A" })).toThrow(
        "at least 2 characters"
      );
    });

    test("rejects name longer than 100 characters", () => {
      expect(() =>
        createAgencySchema.parse({ ...validData, name: "A".repeat(101) })
      ).toThrow("too long");
    });
  });

  describe("slug validation", () => {
    test("accepts valid slugs", () => {
      expect(createAgencySchema.parse({ ...validData, slug: "abc" }).slug).toBe("abc");
      expect(createAgencySchema.parse({ ...validData, slug: "a" }).slug).toBe("a");
      expect(createAgencySchema.parse({ ...validData, slug: "test-agency-123" }).slug).toBe(
        "test-agency-123"
      );
    });

    test("rejects slugs with uppercase letters", () => {
      expect(() => createAgencySchema.parse({ ...validData, slug: "Test-Agency" })).toThrow();
    });

    test("rejects slugs starting with hyphen", () => {
      expect(() => createAgencySchema.parse({ ...validData, slug: "-test" })).toThrow();
    });

    test("rejects slugs ending with hyphen", () => {
      expect(() => createAgencySchema.parse({ ...validData, slug: "test-" })).toThrow();
    });

    test("rejects slugs with special characters", () => {
      expect(() => createAgencySchema.parse({ ...validData, slug: "test_agency" })).toThrow();
      expect(() => createAgencySchema.parse({ ...validData, slug: "test.agency" })).toThrow();
    });
  });

  describe("kvkNumber validation", () => {
    test("accepts valid 8-digit KVK number", () => {
      expect(createAgencySchema.parse({ ...validData, kvkNumber: "12345678" }).kvkNumber).toBe(
        "12345678"
      );
    });

    test("rejects KVK number with wrong length", () => {
      expect(() =>
        createAgencySchema.parse({ ...validData, kvkNumber: "1234567" })
      ).toThrow("8 digits");
      expect(() =>
        createAgencySchema.parse({ ...validData, kvkNumber: "123456789" })
      ).toThrow("8 digits");
    });

    test("rejects KVK number with non-digits", () => {
      expect(() =>
        createAgencySchema.parse({ ...validData, kvkNumber: "1234567a" })
      ).toThrow("8 digits");
    });
  });

  describe("email validation", () => {
    test("accepts valid email", () => {
      expect(createAgencySchema.parse({ ...validData, email: "test@example.com" }).email).toBe(
        "test@example.com"
      );
    });

    test("rejects invalid email", () => {
      expect(() => createAgencySchema.parse({ ...validData, email: "invalid-email" })).toThrow(
        "Invalid email"
      );
    });
  });

  describe("website validation", () => {
    test("accepts valid URL", () => {
      expect(
        createAgencySchema.parse({ ...validData, website: "https://example.com" }).website
      ).toBe("https://example.com");
    });

    test("rejects invalid URL", () => {
      expect(() =>
        createAgencySchema.parse({ ...validData, website: "not-a-url" })
      ).toThrow("Invalid website URL");
    });
  });

  describe("description validation", () => {
    test("rejects description longer than 1000 characters", () => {
      expect(() =>
        createAgencySchema.parse({ ...validData, description: "A".repeat(1001) })
      ).toThrow("too long");
    });
  });

  describe("required fields", () => {
    test("rejects missing address", () => {
      expect(() =>
        createAgencySchema.parse({
          name: validData.name,
          slug: validData.slug,
          city: validData.city,
          postalCode: validData.postalCode,
        })
      ).toThrow();
    });

    test("rejects missing city", () => {
      expect(() =>
        createAgencySchema.parse({
          name: validData.name,
          slug: validData.slug,
          address: validData.address,
          postalCode: validData.postalCode,
        })
      ).toThrow();
    });

    test("rejects missing postalCode", () => {
      expect(() =>
        createAgencySchema.parse({
          name: validData.name,
          slug: validData.slug,
          address: validData.address,
          city: validData.city,
        })
      ).toThrow();
    });
  });
});

describe("updateAgencySchema", () => {
  test("requires agency ID", () => {
    expect(() => updateAgencySchema.parse({})).toThrow();
  });

  test("accepts ID with no other fields", () => {
    const result = updateAgencySchema.parse({ id: "agency_123" });
    expect(result.id).toBe("agency_123");
  });

  test("accepts partial updates", () => {
    const result = updateAgencySchema.parse({
      id: "agency_123",
      name: "Updated Name",
    });
    expect(result.name).toBe("Updated Name");
    expect(result.slug).toBeUndefined();
  });

  test("validates provided fields", () => {
    expect(() =>
      updateAgencySchema.parse({
        id: "agency_123",
        email: "invalid-email",
      })
    ).toThrow("Invalid email");
  });
});

describe("inviteAgentSchema", () => {
  test("accepts valid invitation", () => {
    const result = inviteAgentSchema.parse({
      agencyId: "agency_123",
      email: "agent@example.com",
      role: "AGENT",
    });
    expect(result.agencyId).toBe("agency_123");
    expect(result.email).toBe("agent@example.com");
    expect(result.role).toBe("AGENT");
  });

  test("defaults role to AGENT", () => {
    const result = inviteAgentSchema.parse({
      agencyId: "agency_123",
      email: "agent@example.com",
    });
    expect(result.role).toBe("AGENT");
  });

  test("rejects missing agencyId", () => {
    expect(() =>
      inviteAgentSchema.parse({
        email: "agent@example.com",
      })
    ).toThrow();
  });

  test("rejects invalid email", () => {
    expect(() =>
      inviteAgentSchema.parse({
        agencyId: "agency_123",
        email: "invalid",
      })
    ).toThrow("Invalid email");
  });

  test("accepts all valid roles", () => {
    const roles = ["OWNER", "ADMIN", "AGENT", "VIEWER"] as const;
    for (const role of roles) {
      const result = inviteAgentSchema.parse({
        agencyId: "agency_123",
        email: "agent@example.com",
        role,
      });
      expect(result.role).toBe(role);
    }
  });
});

describe("updateAgentRoleSchema", () => {
  test("accepts valid update", () => {
    const result = updateAgentRoleSchema.parse({
      memberId: "member_123",
      role: "ADMIN",
    });
    expect(result.memberId).toBe("member_123");
    expect(result.role).toBe("ADMIN");
  });

  test("rejects missing memberId", () => {
    expect(() =>
      updateAgentRoleSchema.parse({
        role: "ADMIN",
      })
    ).toThrow();
  });

  test("rejects invalid role", () => {
    expect(() =>
      updateAgentRoleSchema.parse({
        memberId: "member_123",
        role: "INVALID",
      })
    ).toThrow();
  });
});

describe("removeAgentSchema", () => {
  test("accepts valid member ID", () => {
    const result = removeAgentSchema.parse({
      memberId: "member_123",
    });
    expect(result.memberId).toBe("member_123");
  });

  test("rejects empty member ID", () => {
    expect(() =>
      removeAgentSchema.parse({
        memberId: "",
      })
    ).toThrow("Member ID is required");
  });

  test("rejects missing member ID", () => {
    expect(() => removeAgentSchema.parse({})).toThrow();
  });
});

describe("acceptAgencyInvitationSchema", () => {
  test("accepts valid token", () => {
    const result = acceptAgencyInvitationSchema.parse({
      token: "invitation_token_123",
    });
    expect(result.token).toBe("invitation_token_123");
  });

  test("rejects empty token", () => {
    expect(() =>
      acceptAgencyInvitationSchema.parse({
        token: "",
      })
    ).toThrow("Invitation token is required");
  });

  test("rejects missing token", () => {
    expect(() => acceptAgencyInvitationSchema.parse({})).toThrow();
  });
});
