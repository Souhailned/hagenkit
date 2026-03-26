'use client';

// lib/editor/assets/use-asset-url.ts
// React hook for resolving asset URLs to renderable blob URLs.
//
// Items reference 3D models via their `src` field:
//   - "asset://my-model-id"  -> resolves from IndexedDB via asset-storage
//   - "https://..." or "/..."  -> returned as-is (remote or public URL)
//   - undefined/empty          -> returns null
//
// Blob URLs are cached in a module-level Map to prevent memory leaks
// and avoid re-creating them for the same asset across component re-mounts.

import { useState, useEffect } from 'react';
import { loadAsset } from './asset-storage';

const ASSET_PROTOCOL = 'asset://';

/** Module-level cache: asset ID -> blob URL */
const blobUrlCache = new Map<string, string>();

/** Track ongoing loads so multiple components requesting the same asset
 *  don't trigger parallel IndexedDB reads. */
const pendingLoads = new Map<string, Promise<string | null>>();

/**
 * Resolve an asset source string to a renderable URL.
 *
 * @param src - The asset source string from node.src
 * @returns A blob URL, HTTP URL, or null if unresolvable / loading
 */
export function useAssetUrl(src?: string): string | null {
  const [url, setUrl] = useState<string | null>(() => {
    if (!src) return null;
    if (!src.startsWith(ASSET_PROTOCOL)) return src;
    // Check cache synchronously
    const assetId = src.slice(ASSET_PROTOCOL.length);
    return blobUrlCache.get(assetId) ?? null;
  });

  useEffect(() => {
    if (!src) {
      setUrl(null);
      return;
    }

    // HTTP(S) or relative URLs pass through directly
    if (!src.startsWith(ASSET_PROTOCOL)) {
      setUrl(src);
      return;
    }

    const assetId = src.slice(ASSET_PROTOCOL.length);

    // Return cached blob URL immediately
    const cached = blobUrlCache.get(assetId);
    if (cached) {
      setUrl(cached);
      return;
    }

    // Load from IndexedDB (deduplicated)
    let cancelled = false;

    let loadPromise = pendingLoads.get(assetId);
    if (!loadPromise) {
      loadPromise = loadAsset(assetId).then((blob) => {
        pendingLoads.delete(assetId);
        if (!blob) return null;
        const blobUrl = URL.createObjectURL(blob);
        blobUrlCache.set(assetId, blobUrl);
        return blobUrl;
      });
      pendingLoads.set(assetId, loadPromise);
    }

    loadPromise.then((resolvedUrl) => {
      if (!cancelled) {
        setUrl(resolvedUrl);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [src]);

  return url;
}

/**
 * Revoke a cached blob URL when an asset is deleted.
 * Call this from the asset management UI after calling deleteAsset().
 */
export function revokeAssetUrl(assetId: string): void {
  const cached = blobUrlCache.get(assetId);
  if (cached) {
    URL.revokeObjectURL(cached);
    blobUrlCache.delete(assetId);
  }
}
