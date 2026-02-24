/**
 * Cloudflare R2 Storage Adapter
 *
 * Unified storage layer using Cloudflare R2 (S3-compatible API).
 * Uses @aws-sdk/client-s3.
 *
 * Required env vars:
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *   R2_BUCKET_NAME, R2_PUBLIC_URL
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (_client) return _client;

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "[storage] Missing R2 environment variables. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY."
    );
  }

  _client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return _client;
}

function getBucket(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) {
    throw new Error("[storage] Missing R2_BUCKET_NAME environment variable.");
  }
  return bucket;
}

function getPublicBaseUrl(): string {
  const url = process.env.R2_PUBLIC_URL;
  if (!url) {
    throw new Error("[storage] Missing R2_PUBLIC_URL environment variable.");
  }
  // Strip trailing slash for consistency
  return url.replace(/\/+$/, "");
}

// ---------------------------------------------------------------------------
// Storage bucket constant
// ---------------------------------------------------------------------------

export const STORAGE_BUCKET = process.env.R2_BUCKET_NAME ?? "aistudio-bucket";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Map content-type to file extension.
 */
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

/**
 * Generate storage path for an image.
 */
export function generateImagePath(
  workspaceId: string,
  projectId: string,
  imageId: string,
  type: "original" | "result",
  extension: string
): string {
  return `${workspaceId}/${projectId}/${type}/${imageId}.${extension}`;
}

/**
 * Generate storage path for a video.
 */
export function getVideoPath(
  workspaceId: string,
  videoProjectId: string,
  filename: string
): string {
  return `${workspaceId}/videos/${videoProjectId}/${filename}`;
}

// ---------------------------------------------------------------------------
// Public URL
// ---------------------------------------------------------------------------

/**
 * Get the public URL for a stored object.
 */
export function getPublicUrl(path: string): string {
  return `${getPublicBaseUrl()}/${path}`;
}

// ---------------------------------------------------------------------------
// Signed upload URL (pre-signed PUT)
// ---------------------------------------------------------------------------

/**
 * Create a pre-signed upload URL for direct client upload.
 *
 * Returns { signedUrl, token, path }.
 *
 * R2 does not use a token concept, so `token` is always an empty string
 * for interface compatibility.
 */
export async function createSignedUploadUrl(
  path: string
): Promise<{ signedUrl: string; token: string; path: string } | null> {
  try {
    const command = new PutObjectCommand({
      Bucket: getBucket(),
      Key: path,
    });

    const signedUrl = await getSignedUrl(getClient(), command, {
      expiresIn: 3600, // 1 hour
    });

    return { signedUrl, token: "", path };
  } catch (error) {
    console.error("[storage:createSignedUploadUrl] Error:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

/**
 * Upload an image directly (server-side).
 * Returns the public URL on success, null on failure.
 */
export async function uploadImage(
  file: Buffer | Blob,
  path: string,
  contentType: string
): Promise<string | null> {
  try {
    const body = file instanceof Blob ? Buffer.from(await file.arrayBuffer()) : file;

    await getClient().send(
      new PutObjectCommand({
        Bucket: getBucket(),
        Key: path,
        Body: body,
        ContentType: contentType,
      })
    );

    return getPublicUrl(path);
  } catch (error) {
    console.error("[storage:uploadImage] Error:", error);
    return null;
  }
}

/**
 * Upload a video file (server-side).
 * Returns the public URL on success, null on failure.
 */
export async function uploadVideo(
  file: Buffer | Blob,
  path: string,
  contentType: string = "video/mp4"
): Promise<string | null> {
  try {
    const body = file instanceof Blob ? Buffer.from(await file.arrayBuffer()) : file;

    await getClient().send(
      new PutObjectCommand({
        Bucket: getBucket(),
        Key: path,
        Body: body,
        ContentType: contentType,
      })
    );

    return getPublicUrl(path);
  } catch (error) {
    console.error("[storage:uploadVideo] Error:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Delete a single image.
 */
export async function deleteImage(path: string): Promise<boolean> {
  try {
    await getClient().send(
      new DeleteObjectCommand({
        Bucket: getBucket(),
        Key: path,
      })
    );
    return true;
  } catch (error) {
    console.error("[storage:deleteImage] Error:", error);
    return false;
  }
}

/**
 * Delete a single video.
 */
export async function deleteVideo(path: string): Promise<boolean> {
  try {
    await getClient().send(
      new DeleteObjectCommand({
        Bucket: getBucket(),
        Key: path,
      })
    );
    return true;
  } catch (error) {
    console.error("[storage:deleteVideo] Error:", error);
    return false;
  }
}

/**
 * Delete all images for a project (batch delete).
 *
 * Lists all objects under the project prefix (original/, result/, root)
 * and deletes them in batches of up to 1000 (R2 limit per request).
 */
export async function deleteProjectImages(
  workspaceId: string,
  projectId: string
): Promise<boolean> {
  const client = getClient();
  const bucket = getBucket();
  const basePath = `${workspaceId}/${projectId}`;
  const prefixes = [`${basePath}/original/`, `${basePath}/result/`, `${basePath}/`];
  const allKeys = new Set<string>();

  try {
    for (const prefix of prefixes) {
      let continuationToken: string | undefined;

      do {
        const response = await client.send(
          new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: prefix,
            MaxKeys: 1000,
            ContinuationToken: continuationToken,
          })
        );

        for (const obj of response.Contents ?? []) {
          if (obj.Key) {
            allKeys.add(obj.Key);
          }
        }

        continuationToken = response.IsTruncated
          ? response.NextContinuationToken
          : undefined;
      } while (continuationToken);
    }

    if (allKeys.size === 0) {
      return true;
    }

    // Batch delete in chunks of 1000 (S3/R2 limit)
    const keys = Array.from(allKeys);
    for (let i = 0; i < keys.length; i += 1000) {
      const chunk = keys.slice(i, i + 1000);

      await client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: chunk.map((Key) => ({ Key })),
            Quiet: true,
          },
        })
      );
    }

    return true;
  } catch (error) {
    console.error("[storage:deleteProjectImages] Error:", error);
    return false;
  }
}
