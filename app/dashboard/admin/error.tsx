"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/dashboard/content-card";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <ContentCard>
      <ContentCardHeader title="Er ging iets mis" />
      <ContentCardBody className="p-4">
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-foreground">
              Er is een onverwachte fout opgetreden
            </p>
            <p className="text-sm text-muted-foreground">
              {error.message || "Probeer het opnieuw of neem contact op met support."}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground/60">
                Fout-ID: {error.digest}
              </p>
            )}
          </div>
          <Button onClick={reset} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Probeer opnieuw
          </Button>
        </div>
      </ContentCardBody>
    </ContentCard>
  );
}
