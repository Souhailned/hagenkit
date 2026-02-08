"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Expand, Grid3X3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { PropertyImage } from "@/types/property";

interface PropertyGalleryProps {
  images: PropertyImage[];
  title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [, setCarouselApi] = useState<CarouselApi>();

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const navigateLightbox = useCallback(
    (direction: "prev" | "next") => {
      if (direction === "prev") {
        setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else {
        setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    },
    [images.length]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") navigateLightbox("prev");
      if (e.key === "ArrowRight") navigateLightbox("next");
      if (e.key === "Escape") closeLightbox();
    },
    [navigateLightbox, closeLightbox]
  );

  if (!images || images.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-muted">
        <p className="text-muted-foreground">Geen afbeeldingen beschikbaar</p>
      </div>
    );
  }

  const primaryImage = images.find((img) => img.isPrimary) || images[0];
  const secondaryImages = images.filter((img) => img.id !== primaryImage.id).slice(0, 4);
  const remainingCount = images.length - 5;

  return (
    <>
      {/* Desktop Grid Gallery */}
      <div className="hidden md:block">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl">
          {/* Primary large image */}
          <div
            className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden"
            onClick={() => openLightbox(0)}
          >
            <Image
              src={primaryImage.mediumUrl || primaryImage.originalUrl}
              alt={primaryImage.altText || title}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity hover:opacity-100" />
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-4 left-4 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100"
            >
              <Expand className="mr-2 h-4 w-4" />
              Bekijk foto
            </Button>
          </div>

          {/* Secondary images grid */}
          {secondaryImages.map((image, index) => (
            <div
              key={image.id}
              className={cn(
                "relative cursor-pointer overflow-hidden",
                index === 3 && remainingCount > 0 && "relative"
              )}
              onClick={() => openLightbox(index + 1)}
            >
              <Image
                src={image.thumbnailUrl || image.originalUrl}
                alt={image.altText || `${title} - foto ${index + 2}`}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {/* Overlay for remaining count */}
              {index === 3 && remainingCount > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 transition-colors hover:bg-black/70">
                  <div className="text-center text-white">
                    <Grid3X3 className="mx-auto mb-1 h-6 w-6" />
                    <span className="text-lg font-semibold">+{remainingCount + 1}</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Fill empty slots if less than 4 secondary images */}
          {secondaryImages.length < 4 &&
            Array.from({ length: 4 - secondaryImages.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="bg-muted flex items-center justify-center"
              >
                <span className="text-muted-foreground text-sm">-</span>
              </div>
            ))}
        </div>

        {/* Show all photos button */}
        <div className="mt-3 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openLightbox(0)}
          >
            <Grid3X3 className="mr-2 h-4 w-4" />
            Alle {images.length} foto&apos;s bekijken
          </Button>
        </div>
      </div>

      {/* Mobile Carousel */}
      <div className="md:hidden">
        <Carousel
          setApi={setCarouselApi}
          className="w-full"
          opts={{ loop: true }}
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={image.id}>
                <div
                  className="relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl"
                  onClick={() => openLightbox(index)}
                >
                  <Image
                    src={image.mediumUrl || image.originalUrl}
                    alt={image.altText || `${title} - foto ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority={index === 0}
                  />
                  {/* Image counter */}
                  <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-sm text-white">
                    {index + 1} / {images.length}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-3" />
          <CarouselNext className="right-3" />
        </Carousel>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
          showCloseButton={false}
          onKeyDown={handleKeyDown}
        >
          {/* Close button */}
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </DialogClose>

          {/* Image counter */}
          <div className="absolute top-4 left-4 z-50 text-white">
            <span className="text-lg font-medium">
              {lightboxIndex + 1} / {images.length}
            </span>
          </div>

          {/* Main image */}
          <div className="relative flex h-[80vh] items-center justify-center px-16">
            <Image
              src={images[lightboxIndex]?.largeUrl || images[lightboxIndex]?.originalUrl || ""}
              alt={images[lightboxIndex]?.altText || `${title} - foto ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="95vw"
              priority
            />
          </div>

          {/* Navigation buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full text-white hover:bg-white/20"
            onClick={() => navigateLightbox("prev")}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full text-white hover:bg-white/20"
            onClick={() => navigateLightbox("next")}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          {/* Caption */}
          {images[lightboxIndex]?.caption && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-xl text-center">
              <p className="text-white/90 text-sm bg-black/50 px-4 py-2 rounded-lg">
                {images[lightboxIndex].caption}
              </p>
            </div>
          )}

          {/* Thumbnail strip */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 flex gap-2 overflow-x-auto max-w-[80vw] px-4 py-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setLightboxIndex(index)}
                className={cn(
                  "relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md transition-all",
                  index === lightboxIndex
                    ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                    : "opacity-50 hover:opacity-80"
                )}
              >
                <Image
                  src={image.thumbnailUrl || image.originalUrl}
                  alt={image.altText || `Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
