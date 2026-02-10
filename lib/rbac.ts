/**
 * Role-Based Access Control for Horecagrond
 * 
 * Roles:
 * - admin: Platform eigenaar, alle rechten
 * - agent: Makelaar, eigen panden + leads beheren
 * - seeker: Ondernemer, zoeken + favorieten
 */

export type UserRole = "admin" | "agent" | "seeker";

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    // Platform management
    "platform:manage",
    "users:manage",
    "users:list",
    "users:delete",
    "users:change-role",
    // Properties
    "properties:manage-all",
    "properties:approve",
    "properties:feature",
    "properties:create",
    "properties:edit-own",
    "properties:delete-own",
    // Leads
    "leads:view-all",
    "leads:view-own",
    // Analytics
    "analytics:platform",
    "analytics:own",
    // AI
    "ai:unlimited",
    // Export
    "export:all",
    "export:own",
  ],
  agent: [
    // Properties
    "properties:create",
    "properties:edit-own",
    "properties:delete-own",
    "properties:duplicate",
    "properties:bulk-status",
    // Leads
    "leads:view-own",
    "leads:update-status",
    // Analytics
    "analytics:own",
    // AI
    "ai:description",
    "ai:visualize",
    // Export
    "export:own",
    // Agency
    "agency:manage",
    "agency:invite-members",
  ],
  seeker: [
    // Search
    "properties:view",
    "properties:compare",
    // Favorites
    "favorites:manage",
    "search-alerts:manage",
    // AI (limited)
    "ai:visualize",
    // Contact
    "inquiries:create",
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getUserPermissions(role: UserRole): string[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Dashboard sidebar items per role
 */
export const ROLE_SIDEBAR_ITEMS: Record<UserRole, { id: string; label: string; href: string }[]> = {
  admin: [
    { id: "dashboard", label: "Dashboard", href: "/dashboard" },
    { id: "users", label: "Gebruikers", href: "/dashboard/admin/users" },
    { id: "all-properties", label: "Alle panden", href: "/dashboard/admin/properties" },
    { id: "moderation", label: "Moderatie", href: "/dashboard/admin/moderation" },
    { id: "analytics", label: "Platform Analytics", href: "/dashboard/admin/analytics" },
    { id: "panden", label: "Mijn panden", href: "/dashboard/panden" },
    { id: "leads", label: "Leads", href: "/dashboard/leads" },
    { id: "settings", label: "Instellingen", href: "/dashboard/instellingen" },
  ],
  agent: [
    { id: "dashboard", label: "Dashboard", href: "/dashboard" },
    { id: "panden", label: "Mijn panden", href: "/dashboard/panden" },
    { id: "panden-nieuw", label: "Pand toevoegen", href: "/dashboard/panden/nieuw" },
    { id: "leads", label: "Leads", href: "/dashboard/leads" },
    { id: "analytics", label: "Analytics", href: "/dashboard/analytics" },
    { id: "favorieten", label: "Favorieten", href: "/dashboard/favorieten" },
    { id: "alerts", label: "Zoek alerts", href: "/dashboard/alerts" },
    { id: "profiel", label: "Profiel", href: "/dashboard/profiel" },
    { id: "instellingen", label: "Instellingen", href: "/dashboard/instellingen" },
  ],
  seeker: [
    { id: "dashboard", label: "Dashboard", href: "/dashboard" },
    { id: "favorieten", label: "Favorieten", href: "/dashboard/favorieten" },
    { id: "alerts", label: "Zoek alerts", href: "/dashboard/alerts" },
    { id: "profiel", label: "Profiel", href: "/dashboard/profiel" },
    { id: "instellingen", label: "Instellingen", href: "/dashboard/instellingen" },
  ],
};
