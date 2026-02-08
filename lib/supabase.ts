import { createClient } from "@supabase/supabase-js";

// Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Storage bucket name
export const STORAGE_BUCKET = "aistudio-bucket";

// Helper to get file extension from content type
export function getExtensionFromContentType(contentType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[contentType] || "jpg";
}

// Create a signed upload URL for direct client upload
export async function createSignedUploadUrl(path: string): Promise<{
  signedUrl: string;
  token: string;
  path: string;
} | null> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(path);

  if (error) {
    console.error("[supabase:createSignedUploadUrl] Error:", error);
    return null;
  }

  return data;
}

// Upload image directly (server-side)
export async function uploadImage(
  file: Buffer | Blob,
  path: string,
  contentType: string
): Promise<string | null> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error("[supabase:uploadImage] Error:", error);
    return null;
  }

  return getPublicUrl(path);
}

// Get public URL for a file
export function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Delete a single image
export async function deleteImage(path: string): Promise<boolean> {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);

  if (error) {
    console.error("[supabase:deleteImage] Error:", error);
    return false;
  }

  return true;
}

// Delete all images for a project
export async function deleteProjectImages(
  workspaceId: string,
  projectId: string
): Promise<boolean> {
  const basePath = `${workspaceId}/${projectId}`;
  const candidates = [`${basePath}/original`, `${basePath}/result`, basePath];
  const filePaths = new Set<string>();

  for (const folder of candidates) {
    const { data: files, error: listError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(folder, { limit: 1000 });

    if (listError) {
      console.error("[supabase:deleteProjectImages] List error:", listError);
      continue;
    }

    for (const file of files || []) {
      if (file.name && !file.name.endsWith("/")) {
        filePaths.add(`${folder}/${file.name}`);
      }
    }
  }

  if (filePaths.size === 0) {
    return true;
  }

  // Supabase remove supports batches; keep chunks conservative.
  const paths = Array.from(filePaths);
  for (let i = 0; i < paths.length; i += 100) {
    const chunk = paths.slice(i, i + 100);
    const { error: deleteError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(chunk);

    if (deleteError) {
      console.error("[supabase:deleteProjectImages] Delete error:", deleteError);
      return false;
    }
  }

  return true;
}

// Generate storage path for an image
export function generateImagePath(
  workspaceId: string,
  projectId: string,
  imageId: string,
  type: "original" | "result",
  extension: string
): string {
  return `${workspaceId}/${projectId}/${type}/${imageId}.${extension}`;
}
