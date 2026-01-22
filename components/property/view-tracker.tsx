"use client";

import { useEffect, useRef } from "react";
import { recordPropertyView } from "@/app/actions/property-analytics";

interface ViewTrackerProps {
  propertyId: string;
  userId?: string | null;
}

/**
 * Client component that tracks property views on mount.
 * Uses a ref to ensure it only fires once, even in strict mode.
 */
export function ViewTracker({ propertyId, userId }: ViewTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    // Generate or retrieve session ID
    let sessionId = sessionStorage.getItem("horecagrond_session");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem("horecagrond_session", sessionId);
    }

    // Detect device type
    const getDeviceType = (): "mobile" | "desktop" | "tablet" => {
      const ua = navigator.userAgent.toLowerCase();
      if (/tablet|ipad|playbook|silk/.test(ua)) return "tablet";
      if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/.test(ua))
        return "mobile";
      return "desktop";
    };

    // Detect source from referrer or URL params
    const getSource = (): "search" | "direct" | "email" | "social" | "referral" => {
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get("utm_source");

      if (utmSource) {
        if (utmSource.includes("email") || utmSource.includes("newsletter"))
          return "email";
        if (
          ["facebook", "twitter", "instagram", "linkedin", "tiktok"].some((s) =>
            utmSource.includes(s)
          )
        )
          return "social";
        return "referral";
      }

      const referrer = document.referrer;
      if (!referrer || referrer.includes(window.location.hostname)) return "direct";
      if (referrer.includes("google") || referrer.includes("bing"))
        return "search";
      if (
        ["facebook", "twitter", "instagram", "linkedin", "t.co"].some((s) =>
          referrer.includes(s)
        )
      )
        return "social";

      return "referral";
    };

    // Record the view
    recordPropertyView({
      propertyId,
      userId,
      sessionId,
      deviceType: getDeviceType(),
      source: getSource(),
    }).catch((err) => {
      // Silently fail - view tracking shouldn't break the page
      console.debug("Failed to record property view:", err);
    });
  }, [propertyId, userId]);

  // This component renders nothing
  return null;
}
