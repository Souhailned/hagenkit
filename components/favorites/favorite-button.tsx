"use client";

import { Heart } from "lucide-react";
import { useTransition, useState } from "react";
import { toggleFavorite } from "@/app/actions/favorites";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  propertyId: string;
  initialFavorited?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { icon: 16, button: "h-8 w-8" },
  md: { icon: 20, button: "h-9 w-9" },
  lg: { icon: 24, button: "h-10 w-10" },
};

export function FavoriteButton({
  propertyId,
  initialFavorited = false,
  size = "md",
  className,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  const { icon, button } = sizeMap[size];

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    setIsFavorited(!isFavorited);

    startTransition(async () => {
      const result = await toggleFavorite(propertyId);
      if ("error" in result) {
        // Revert on error
        setIsFavorited(isFavorited);
        return;
      }
      setIsFavorited(result.isFavorited);
    });
  }

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        button,
        "rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm transition-all",
        isPending && "opacity-50",
        className
      )}
      aria-label={isFavorited ? "Verwijder uit favorieten" : "Opslaan als favoriet"}
    >
      <Heart
        size={icon}
        className={cn(
          "transition-colors",
          isFavorited
            ? "fill-red-500 text-red-500"
            : "fill-none text-gray-600 hover:text-red-400"
        )}
      />
    </Button>
  );
}
