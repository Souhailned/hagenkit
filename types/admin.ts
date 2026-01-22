/**
 * Centralized types for admin domain
 * These types represent the core entities in the admin interface
 */

/**
 * User role type matching Prisma enum
 */
export type UserRole = "user" | "admin";

/**
 * User status type matching Prisma enum
 */
export type UserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

/**
 * Complete user entity for admin management
 * Matches Prisma User model with commonly used fields
 */
export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  status: UserStatus;
  image: string | null;
  phone: string | null;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    workspaces: number;
  };
}

/**
 * Complete workspace entity for admin management
 * Matches Prisma Workspace model with relation counts
 */
export interface AdminWorkspace {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    members: number;
    invitations: number;
  };
}

/**
 * Minimal user fields for edit operations
 */
export type UserEditFields = Pick<
  AdminUser,
  "id" | "email" | "name" | "image" | "role" | "status" | "phone"
>;

/**
 * Minimal user fields for delete operations
 */
export type UserDeleteFields = Pick<AdminUser, "id" | "email" | "name">;

/**
 * Minimal workspace fields for edit operations
 */
export type WorkspaceEditFields = Pick<
  AdminWorkspace,
  "id" | "name" | "slug" | "image"
>;

/**
 * Minimal workspace fields for delete operations
 */
export type WorkspaceDeleteFields = Pick<AdminWorkspace, "id" | "name" | "slug">;

/**
 * Common dialog props pattern
 * Reusable for all dialog/modal components
 */
export interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Impersonation status data
 */
export interface ImpersonationStatus {
  isImpersonating: boolean;
  impersonatedUser?: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  };
  adminUser?: {
    id: string;
    email: string;
    name: string | null;
  };
}

/**
 * Minimal user fields for impersonation operations
 */
export type ImpersonateUserFields = Pick<
  AdminUser,
  "id" | "email" | "name" | "image" | "role" | "status" | "lastLoginAt"
>;

/**
 * Agency plan type for subscription tiers
 * Maps to PRD AgencyPlan enum (FREE, PRO, ENTERPRISE)
 * Currently using workspace-based model, will be updated when Agency model is added
 */
export type AgencyPlan = "FREE" | "PRO" | "ENTERPRISE";

/**
 * Complete agency entity for admin management
 * Based on Workspace model with additional fields for agency management
 * Will be updated when Agency model is added to schema
 */
export interface AdminAgency {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  verified: boolean;
  verifiedAt: Date | null;
  plan: AgencyPlan;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  _count?: {
    members: number;
    listings: number;
    invitations: number;
  };
}

/**
 * Minimal agency fields for edit operations
 */
export type AgencyEditFields = Pick<
  AdminAgency,
  "id" | "name" | "slug" | "image" | "verified" | "plan"
>;

/**
 * Minimal agency fields for delete operations
 */
export type AgencyDeleteFields = Pick<AdminAgency, "id" | "name" | "slug">;

/**
 * Agency detail with recent activity for modal view
 */
export interface AdminAgencyDetail extends AdminAgency {
  members: Array<{
    id: string;
    role: string;
    joinedAt: Date;
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
    };
  }>;
  recentActivity: Array<{
    id: string;
    type: "member_joined" | "listing_created" | "listing_updated" | "inquiry_received";
    description: string;
    timestamp: Date;
  }>;
}
