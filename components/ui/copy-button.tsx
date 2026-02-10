"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = "Kopiëren", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant="outline" size="sm" className={className} onClick={handleCopy}>
      {copied ? (
        <>
          <Check className="mr-1.5 h-3.5 w-3.5 text-green-600" />
          Gekopieerd!
        </>
      ) : (
        <>
          <Copy className="mr-1.5 h-3.5 w-3.5" />
          {label}
        </>
      )}
    </Button>
  );
}
