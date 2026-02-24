"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { GripVertical } from "lucide-react";
import Image from "next/image";

interface BeforeAfterSliderProps {
  originalUrl: string;
  resultUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function BeforeAfterSlider({
  originalUrl,
  resultUrl,
  beforeLabel = "Voor",
  afterLabel = "Na (AI)",
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = Math.max(
      0,
      Math.min(100, ((clientX - rect.left) / rect.width) * 100)
    );
    setSliderPos(pos);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (isDragging) updateSlider(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) updateSlider(e.touches[0].clientX);
    };
    const onUp = () => setIsDragging(false);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onUp);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onUp);
    };
  }, [isDragging, updateSlider]);

  return (
    <div
      ref={containerRef}
      className="relative aspect-[16/9] w-full cursor-col-resize select-none overflow-hidden rounded-xl border"
      onMouseDown={(e) => {
        setIsDragging(true);
        updateSlider(e.clientX);
      }}
      onTouchStart={(e) => {
        setIsDragging(true);
        if (e.touches[0]) updateSlider(e.touches[0].clientX);
      }}
    >
      {/* After (AI result) — full background */}
      <Image
        src={resultUrl}
        alt="AI resultaat"
        fill
        className="object-cover"
        unoptimized
      />

      {/* Before (original) — clipped left */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <Image
          src={originalUrl}
          alt="Origineel"
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute left-2 top-2">
          <Badge
            variant="secondary"
            className="border bg-background/80 text-xs text-foreground backdrop-blur-sm"
          >
            {beforeLabel}
          </Badge>
        </div>
      </div>

      {/* After label */}
      <div className="absolute right-2 top-2">
        <Badge className="bg-primary text-xs text-primary-foreground">
          {afterLabel}
        </Badge>
      </div>

      {/* Slider handle */}
      <div
        className="absolute inset-y-0 w-0.5 bg-background/80 shadow-lg"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-md">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
