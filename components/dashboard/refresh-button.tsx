"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export function RefreshButton({
  label = "Pagina Verversen",
  variant = "default",
}: RefreshButtonProps) {
  const router = useRouter();

  return (
    <Button variant={variant} onClick={() => router.refresh()}>
      <RefreshCw className="size-4" />
      {label}
    </Button>
  );
}
