"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Empty className="border-none">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangle className="text-destructive" />
          </EmptyMedia>
          <EmptyTitle>Er is iets misgegaan</EmptyTitle>
          <EmptyDescription>
            Er is een onverwachte fout opgetreden. Probeer het opnieuw of neem
            contact op met support als het probleem aanhoudt.
            {error.digest && (
              <span className="block mt-2 text-xs text-muted-foreground/60">
                Fout-ID: {error.digest}
              </span>
            )}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={reset} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Opnieuw proberen
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
