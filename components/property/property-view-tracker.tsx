"use client";

import * as React from "react";
import { recordPropertyView } from "@/app/actions/property";

interface PropertyViewTrackerProps {
  propertyId: string;
}

/**
 * Client component that tracks property views on page load
 * This component renders nothing visible but triggers the view tracking
 */
export function PropertyViewTracker({ propertyId }: PropertyViewTrackerProps) {
  const hasTracked = React.useRef(false);

  React.useEffect(() => {
    // Only track once per mount
    if (hasTracked.current) return;
    hasTracked.current = true;

    const trackView = async () => {
      try {
        // Detect device type
        const deviceType = getDeviceType();

        // Get or create session ID
        const sessionId = getOrCreateSessionId();

        // Get source from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const source = urlParams.get("utm_source") || urlParams.get("ref") || "direct";

        await recordPropertyView({
          propertyId,
          sessionId,
          source,
          deviceType,
        });
      } catch (error) {
        // Silently fail - view tracking shouldn't break the page
        console.error("Failed to track property view:", error);
      }
    };

    // Small delay to not block initial render
    const timeoutId = setTimeout(trackView, 100);

    return () => clearTimeout(timeoutId);
  }, [propertyId]);

  // This component renders nothing
  return null;
}

/**
 * Detect device type based on user agent
 */
function getDeviceType(): "mobile" | "desktop" | "tablet" {
  if (typeof window === "undefined") return "desktop";

  const ua = navigator.userAgent.toLowerCase();

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }

  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    return "mobile";
  }

  return "desktop";
}

/**
 * Get or create a session ID stored in sessionStorage
 */
function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";

  const STORAGE_KEY = "horecagrond_session_id";
  let sessionId = sessionStorage.getItem(STORAGE_KEY);

  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(STORAGE_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Generate a random session ID
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
