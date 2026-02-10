"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function NearbyButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleClick() {
    if (!navigator.geolocation) return;

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        router.push(`/aanbod?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&radius=10`);
      },
      () => {
        setLoading(false);
      },
      { timeout: 10000 }
    );
  }

  return (
    <Button variant="outline" size="sm" className={className} onClick={handleClick} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
      ) : (
        <MapPin className="mr-1.5 h-4 w-4" />
      )}
      In de buurt
    </Button>
  );
}
