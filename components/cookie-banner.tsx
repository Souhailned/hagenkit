"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setShow(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", "accepted");
    setShow(false);
  }

  function decline() {
    localStorage.setItem("cookie_consent", "declined");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-lg p-4 shadow-lg">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Cookie className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            Wij gebruiken cookies om je ervaring te verbeteren en het platform te optimaliseren.
            Lees meer in ons{" "}
            <a href="#" className="underline hover:text-foreground">privacybeleid</a>.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={decline}>
            Weigeren
          </Button>
          <Button size="sm" onClick={accept}>
            Accepteren
          </Button>
        </div>
      </div>
    </div>
  );
}
