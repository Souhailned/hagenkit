import { z } from "zod";

// Agency role enum values (matches Prisma AgencyRole enum)
export const agencyRoleEnum = z.enum(["OWNER", "ADMIN", "AGENT", "VIEWER"]);

// Slug regex: lowercase alphanumeric and hyphens, must start and end with alphanumeric
const slugRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

// KVK number regex: exactly 8 digits
const kvkRegex = /^\d{8}$/;

// Schema for creating a new agency
export const createAgencySchema = z.object({
  name: z
    .string()
    .min(2, "Agency name must be at least 2 characters")
    .max(100, "Agency name is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug is too long")
    .regex(slugRegex, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z
    .string()
    .max(1000, "Description is too long")
    .optional()
    .or(z.literal("")),
  kvkNumber: z
    .string()
    .regex(kvkRegex, "KVK number must be exactly 8 digits")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("Invalid website URL")
    .optional()
    .or(z.literal("")),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
});

// Schema for updating an agency (all fields optional)
export const updateAgencySchema = z.object({
  id: z.string().min(1, "Agency ID is required"),
  name: z
    .string()
    .min(2, "Agency name must be at least 2 characters")
    .max(100, "Agency name is too long")
    .optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug is too long")
    .regex(slugRegex, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
  description: z
    .string()
    .max(1000, "Description is too long")
    .optional()
    .or(z.literal("")),
  kvkNumber: z
    .string()
    .regex(kvkRegex, "KVK number must be exactly 8 digits")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("Invalid website URL")
    .optional()
    .or(z.literal("")),
  address: z.string().min(1, "Address is required").optional(),
  city: z.string().min(1, "City is required").optional(),
  postalCode: z.string().min(1, "Postal code is required").optional(),
});

// Schema for inviting an agent to an agency
export const inviteAgentSchema = z.object({
  agencyId: z.string().min(1, "Agency ID is required"),
  email: z.string().email("Invalid email address"),
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
export type AgencyRole = z.infer<typeof agencyRoleEnum>;
export type CreateAgencyInput = z.infer<typeof createAgencySchema>;
export type UpdateAgencyInput = z.infer<typeof updateAgencySchema>;
export type InviteAgentInput = z.infer<typeof inviteAgentSchema>;
export type UpdateAgentRoleInput = z.infer<typeof updateAgentRoleSchema>;
export type RemoveAgentInput = z.infer<typeof removeAgentSchema>;
export type AcceptAgencyInvitationInput = z.infer<typeof acceptAgencyInvitationSchema>;
