"use client";

import * as React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download } from "@phosphor-icons/react/dist/ssr"

interface ImageComparisonProps {
  originalUrl: string;
  resultUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageComparison({
  originalUrl,
  resultUrl,
  open,
  onOpenChange,
}: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = React.useState(50);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isDragging = React.useRef(false);

  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  };

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  React.useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleDownload = async (url: string, name: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Before / After Comparison</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(originalUrl, "original.jpg")}
              >
                <Download className="mr-1 h-3 w-3" />
                Original
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(resultUrl, "enhanced.jpg")}
              >
                <Download className="mr-1 h-3 w-3" />
                Enhanced
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4">
          <div
            ref={containerRef}
            className="relative aspect-[16/9] cursor-ew-resize overflow-hidden rounded-lg"
            onMouseMove={handleMouseMove}
          >
            {/* Result image (background) */}
            <div className="absolute inset-0">
              <Image
                src={resultUrl}
                alt="Enhanced"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Original image (clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <Image
                src={originalUrl}
                alt="Original"
                fill
                className="object-contain"
                style={{ maxWidth: "none", width: containerRef.current?.offsetWidth }}
                priority
              />
            </div>

            {/* Slider handle */}
            <div
              className="absolute top-0 bottom-0 z-10 w-1 cursor-ew-resize bg-white shadow-lg"
              style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
              onMouseDown={handleMouseDown}
            >
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg">
                <div className="flex items-center gap-0.5">
                  <div className="h-4 w-0.5 bg-gray-400" />
                  <div className="h-4 w-0.5 bg-gray-400" />
                </div>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute bottom-4 left-4 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
              Original
            </div>
            <div className="absolute bottom-4 right-4 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
              Enhanced
            </div>
          </div>

          <p className="text-muted-foreground mt-2 text-center text-sm">
            Drag the slider to compare original and enhanced images
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
