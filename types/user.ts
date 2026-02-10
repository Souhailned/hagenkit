/**
 * Application role — matches Prisma UserRole enum
 * seeker = horeca ondernemer die zoekt
 * agent = makelaar/aanbieder
 * admin = platform beheerder
 */
export type UserRole = "seeker" | "agent" | "admin";

/**
 * User type returned from getCurrentUser() action
 * Matches the select fields from the user query
 */
export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  phone: string | null;
  role: UserRole;
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  emailVerified: boolean;
  onboardingCompleted: boolean;
  createdAt: Date;
} | null;

/**
 * Simplified user type for sidebar components
 */
export type SidebarUser = {
  name: string;
  email: string;
  image?: string | null;
  role?: UserRole;
} | null;

/**
 * Role check helpers
 */
export function isAgent(user: CurrentUser): boolean {
  return user?.role === "agent";
}

export function isSeeker(user: CurrentUser): boolean {
  return user?.role === "seeker";
}

export function isAdmin(user: CurrentUser): boolean {
  return user?.role === "admin";
}

/**
 * Helper to convert CurrentUser to SidebarUser
 */
export function toSidebarUser(user: CurrentUser): SidebarUser {
  if (!user) return null;

  return {
    name: user.name || "Gebruiker",
    email: user.email,
    image: user.image,
    role: user.role,
  };
}
