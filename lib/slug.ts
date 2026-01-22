/**
 * Slug utility functions for generating URL-safe slugs
 */

/**
 * Generates a URL-safe slug from a title string
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Removes special characters (keeps only alphanumeric and hyphens)
 * - Trims leading/trailing hyphens
 * - Collapses multiple consecutive hyphens into one
 *
 * @param title - The title to convert to a slug
 * @returns A URL-safe slug string
 *
 * @example
 * generateSlug("Café Amsterdam!") // "cafe-amsterdam"
 * generateSlug("Hello   World") // "hello-world"
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD") // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritical marks
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens
}

/**
 * Generates a unique slug by appending a numeric suffix if the slug already exists
 *
 * @param title - The title to convert to a slug
 * @param checkExists - Async function that checks if a slug already exists
 * @returns A unique URL-safe slug string
 *
 * @example
 * // If "cafe-amsterdam" exists, returns "cafe-amsterdam-2"
 * // If "cafe-amsterdam-2" also exists, returns "cafe-amsterdam-3"
 * await generateUniqueSlug("Café Amsterdam", async (slug) => {
 *   const existing = await db.query({ slug });
 *   return existing !== null;
 * });
 */
export async function generateUniqueSlug(
  title: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  const baseSlug = generateSlug(title);

  // Handle empty slug edge case
  if (!baseSlug) {
    let suffix = 1;
    while (await checkExists(`item-${suffix}`)) {
      suffix++;
    }
    return `item-${suffix}`;
  }

  // Check if base slug is available
  if (!(await checkExists(baseSlug))) {
    return baseSlug;
  }

  // Find the next available suffix
  let suffix = 2;
  while (await checkExists(`${baseSlug}-${suffix}`)) {
    suffix++;
  }

  return `${baseSlug}-${suffix}`;
}
