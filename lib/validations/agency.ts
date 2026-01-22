import { z } from "zod";

// Agency role enum values for agency members
export const agencyRoleEnum = z.enum(["OWNER", "ADMIN", "AGENT", "VIEWER"]);

// Reusable field schemas
const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(50, "Slug is too long")
  .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
  .regex(/^[a-z0-9]/, "Slug must start with a letter or number")
  .regex(/[a-z0-9]$/, "Slug must end with a letter or number");

const kvkNumberSchema = z
  .string()
  .regex(/^\d{8}$/, "KvK number must be exactly 8 digits")
  .optional()
  .or(z.literal(""));

const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .max(15, "Phone number is too long")
  .optional()
  .or(z.literal(""));

const emailSchema = z.string().email("Invalid email address");

const websiteSchema = z
  .string()
  .url("Invalid website URL")
  .optional()
  .or(z.literal(""));

// Schema for creating a new agency
export const createAgencySchema = z.object({
  name: z
    .string()
    .min(2, "Agency name must be at least 2 characters")
    .max(100, "Agency name is too long"),
  slug: slugSchema,
  description: z
    .string()
    .max(1000, "Description is too long")
    .optional()
    .or(z.literal("")),
  kvkNumber: kvkNumberSchema,
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal("")),
  website: websiteSchema,
  address: z.string().min(1, "Address is required").max(200, "Address is too long"),
  city: z.string().min(1, "City is required").max(100, "City is too long"),
  postalCode: z.string().min(1, "Postal code is required").max(20, "Postal code is too long"),
});

// Schema for updating an agency (all fields optional)
export const updateAgencySchema = z.object({
  id: z.string().min(1, "Agency ID is required"),
  name: z
    .string()
    .min(2, "Agency name must be at least 2 characters")
    .max(100, "Agency name is too long")
    .optional(),
  slug: slugSchema.optional(),
  description: z
    .string()
    .max(1000, "Description is too long")
    .optional()
    .or(z.literal("")),
  kvkNumber: kvkNumberSchema,
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal("")),
  website: websiteSchema,
  address: z.string().min(1, "Address is required").max(200, "Address is too long").optional(),
  city: z.string().min(1, "City is required").max(100, "City is too long").optional(),
  postalCode: z.string().min(1, "Postal code is required").max(20, "Postal code is too long").optional(),
});

// Schema for inviting an agent to an agency
export const inviteAgentSchema = z.object({
  agencyId: z.string().min(1, "Agency ID is required"),
  email: emailSchema,
  role: agencyRoleEnum.default("AGENT"),
});

// Schema for updating an agent's role
export const updateAgentRoleSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  role: agencyRoleEnum,
});

// Schema for removing an agent from an agency
export const removeAgentSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
});

// Schema for accepting an agency invitation
export const acceptAgencyInvitationSchema = z.object({
  token: z.string().min(1, "Invitation token is required"),
});

// TypeScript types from schemas
export type CreateAgencyInput = z.infer<typeof createAgencySchema>;
export type UpdateAgencyInput = z.infer<typeof updateAgencySchema>;
export type InviteAgentInput = z.infer<typeof inviteAgentSchema>;
export type UpdateAgentRoleInput = z.infer<typeof updateAgentRoleSchema>;
export type RemoveAgentInput = z.infer<typeof removeAgentSchema>;
export type AcceptAgencyInvitationInput = z.infer<typeof acceptAgencyInvitationSchema>;
export type AgencyRole = z.infer<typeof agencyRoleEnum>;
