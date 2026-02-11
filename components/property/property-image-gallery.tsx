"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

interface PropertyImage {
  id: string;
  originalUrl: string;
  thumbnailUrl: string | null;
  mediumUrl: string | null;
  largeUrl: string | null;
  enhancedUrl: string | null;
  type: string;
  caption: string | null;
  altText: string | null;
  order: number;
  isPrimary: boolean;
}

interface PropertyImageGalleryProps {
  images: PropertyImage[];
  propertyTitle: string;
  className?: string;
}

export function PropertyImageGallery({
  images,
  propertyTitle,
  className,
}: PropertyImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = React.useState(0);

  // Sort images: primary first, then by order
  const sortedImages = React.useMemo(() => {
    return [...images].sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return a.order - b.order;
    });
  }, [images]);

  const getImageUrl = (image: PropertyImage, size: "thumbnail" | "medium" | "large" | "original" = "large") => {
    switch (size) {
      case "thumbnail":
        return image.thumbnailUrl || image.mediumUrl || image.originalUrl;
      case "medium":
        return image.mediumUrl || image.largeUrl || image.originalUrl;
      case "large":
        return image.largeUrl || image.enhancedUrl || image.originalUrl;
      default:
        return image.enhancedUrl || image.largeUrl || image.originalUrl;
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const navigateLightbox = React.useCallback((direction: "prev" | "next") => {
    const imageCount = sortedImages.length;
    if (direction === "prev") {
      setLightboxIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1));
    } else {
      setLightboxIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1));
    }
  }, [sortedImages.length]);

  // Handle keyboard navigation in lightbox
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "ArrowLeft") navigateLightbox("prev");
      if (e.key === "ArrowRight") navigateLightbox("next");
      if (e.key === "Escape") setLightboxOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, navigateLightbox]);

  // Update current slide from carousel API
  React.useEffect(() => {
    if (!carouselApi) return;

    carouselApi.on("select", () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  if (sortedImages.length === 0) {
    return (
      <div className={cn("relative aspect-[16/9] bg-muted rounded-2xl flex items-center justify-center", className)}>
        <p className="text-muted-foreground">Geen afbeeldingen beschikbaar</p>
      </div>
    );
  }

  // Single image layout
  if (sortedImages.length === 1) {
    return (
      <div className={cn("relative", className)}>
        <button
          onClick={() => openLightbox(0)}
          className="group relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <Image
            src={getImageUrl(sortedImages[0], "large")}
            alt={sortedImages[0].altText || propertyTitle}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-sm">
              <ZoomIn className="size-4" />
              Bekijk groter
            </span>
          </div>
        </button>
        <LightboxDialog
          images={sortedImages}
          currentIndex={lightboxIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          onNavigate={navigateLightbox}
          propertyTitle={propertyTitle}
        />
      </div>
    );
  }

  // Multiple images: Carousel with thumbnail strip
  return (
    <div className={cn("relative", className)}>
      {/* Main Carousel */}
      <Carousel
        setApi={setCarouselApi}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {sortedImages.map((image, index) => (
            <CarouselItem key={image.id}>
              <button
                onClick={() => openLightbox(index)}
                className="group relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <Image
                  src={getImageUrl(image, "large")}
                  alt={image.altText || `${propertyTitle} - Afbeelding ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-sm">
                    <ZoomIn className="size-4" />
                    Bekijk groter
                  </span>
                </div>
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 size-10 bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:bg-white" />
        <CarouselNext className="right-4 size-10 bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:bg-white" />
      </Carousel>

      {/* Slide counter */}
      <div className="absolute bottom-4 left-4 z-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
          <Grid3X3 className="size-4" />
          Foto&apos;s {currentSlide + 1}/{sortedImages.length}
        </span>
      </div>

      {/* Thumbnail strip */}
      {sortedImages.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => {
                carouselApi?.scrollTo(index);
                setCurrentSlide(index);
              }}
              className={cn(
                "relative flex-shrink-0 aspect-[4/3] w-24 overflow-hidden rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                currentSlide === index
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-muted-foreground/30"
              )}
            >
              <Image
                src={getImageUrl(image, "thumbnail")}
                alt={image.altText || `${propertyTitle} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <LightboxDialog
        images={sortedImages}
        currentIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onNavigate={navigateLightbox}
        propertyTitle={propertyTitle}
      />
    </div>
  );
}

// Lightbox Dialog Component
function LightboxDialog({
  images,
  currentIndex,
  open,
  onOpenChange,
  onNavigate,
  propertyTitle,
}: {
  images: PropertyImage[];
  currentIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (direction: "prev" | "next") => void;
  propertyTitle: string;
}) {
  const currentImage = images[currentIndex];

  const getImageUrl = (image: PropertyImage) => {
    return image.enhancedUrl || image.largeUrl || image.originalUrl;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          {currentImage?.altText || `${propertyTitle} - Afbeelding ${currentIndex + 1}`}
        </DialogTitle>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 size-10 rounded-full bg-white/10 text-white hover:bg-white/20"
          onClick={() => onOpenChange(false)}
        >
          <X className="size-5" />
          <span className="sr-only">Sluiten</span>
        </Button>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 size-12 rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={() => onNavigate("prev")}
            >
              <ChevronLeft className="size-6" />
              <span className="sr-only">Vorige afbeelding</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 size-12 rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={() => onNavigate("next")}
            >
              <ChevronRight className="size-6" />
              <span className="sr-only">Volgende afbeelding</span>
            </Button>
          </>
        )}

        {/* Main image */}
        <div className="relative w-full h-[85vh] flex items-center justify-center">
          {currentImage && (
            <Image
              src={getImageUrl(currentImage)}
              alt={currentImage.altText || `${propertyTitle} - Afbeelding ${currentIndex + 1}`}
              fill
              className="object-contain"
              priority
            />
          )}
        </div>

        {/* Caption and counter */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center justify-between text-white">
            <p className="text-sm">
              {currentImage?.caption || currentImage?.altText || `${propertyTitle}`}
            </p>
            <span className="text-sm opacity-70">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        </div>

        {/* Thumbnail strip in lightbox */}
        {images.length > 1 && (
          <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => {
                  // Update the index via parent state
                  const diff = index - currentIndex;
                  if (diff > 0) {
                    for (let i = 0; i < diff; i++) onNavigate("next");
                  } else {
                    for (let i = 0; i < Math.abs(diff); i++) onNavigate("prev");
                  }
                }}
                className={cn(
                  "relative flex-shrink-0 w-16 h-12 overflow-hidden rounded border-2 transition-all",
                  currentIndex === index
                    ? "border-white opacity-100"
                    : "border-transparent opacity-50 hover:opacity-75"
                )}
              >
                <Image
                  src={image.thumbnailUrl || image.mediumUrl || image.originalUrl}
                  alt=""
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
