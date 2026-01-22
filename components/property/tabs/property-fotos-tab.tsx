"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  Upload,
  Trash2,
  Star,
  GripVertical,
  Sparkles,
  Loader2,
  ImagePlus,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { updatePropertyImages } from "@/app/actions/property";
import type { Property, PropertyImage } from "@/lib/validations/property";
import { cn } from "@/lib/utils";

interface PropertyFotosTabProps {
  property: Property;
}

const imageTypeLabels: Record<string, string> = {
  EXTERIOR: "Exterieur",
  INTERIOR: "Interieur",
  KITCHEN: "Keuken",
  TERRACE: "Terras",
  BATHROOM: "Sanitair",
  STORAGE: "Opslag",
  FLOORPLAN: "Plattegrond",
  LOCATION: "Locatie",
  RENDER: "Render",
  OTHER: "Overig",
};

export function PropertyFotosTab({ property }: PropertyFotosTabProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [images, setImages] = useState<PropertyImage[]>(property.images || []);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<PropertyImage | null>(null);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Handle drag start
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    // Update order numbers
    const reorderedImages = newImages.map((img, i) => ({
      ...img,
      order: i,
    }));

    setImages(reorderedImages);
    setDraggedIndex(index);
  };

  // Handle drag end - save the new order
  const handleDragEnd = () => {
    setDraggedIndex(null);
    saveImages(images);
  };

  // Save images to server
  const saveImages = (updatedImages: PropertyImage[]) => {
    startTransition(async () => {
      const result = await updatePropertyImages(property.id, updatedImages);
      if (result.success) {
        toast.success("Foto's bijgewerkt");
        router.refresh();
      } else {
        toast.error(result.error || "Bijwerken mislukt");
      }
    });
  };

  // Set image as primary
  const setPrimaryImage = (imageId: string) => {
    const updatedImages = images.map((img) => ({
      ...img,
      isPrimary: img.id === imageId,
    }));
    setImages(updatedImages);
    saveImages(updatedImages);
  };

  // Delete image
  const deleteImage = (imageId: string) => {
    const updatedImages = images
      .filter((img) => img.id !== imageId)
      .map((img, i) => ({ ...img, order: i }));

    // If deleted image was primary, set first image as primary
    if (updatedImages.length > 0 && !updatedImages.some((img) => img.isPrimary)) {
      updatedImages[0].isPrimary = true;
    }

    setImages(updatedImages);
    saveImages(updatedImages);
    setDeleteImageId(null);
  };

  // Save selected image changes
  const saveSelectedImage = () => {
    if (selectedImage) {
      const updatedImages = images.map((img) =>
        img.id === selectedImage.id ? selectedImage : img
      );
      setImages(updatedImages);
      saveImages(updatedImages);
      setSelectedImage(null);
    }
  };

  // Handle AI enhance (placeholder)
  const handleAiEnhance = (imageId: string) => {
    toast.info(`AI verbetering wordt gestart voor ${imageId}...`, {
      description: "Dit kan enkele minuten duren",
    });
    // TODO: Implement AI enhancement integration
  };

  // Handle file upload (placeholder)
  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setIsUploading(true);
      toast.info(`${files.length} foto('s) worden geüpload...`);

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create mock uploaded images
      const newImages: PropertyImage[] = Array.from(files).map((file, i) => ({
        id: `new-${Date.now()}-${i}`,
        propertyId: property.id,
        originalUrl: URL.createObjectURL(file),
        thumbnailUrl: URL.createObjectURL(file),
        type: "INTERIOR",
        caption: file.name.replace(/\.[^/.]+$/, ""),
        order: images.length + i,
        isPrimary: images.length === 0 && i === 0,
        aiProcessed: false,
      }));

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      saveImages(updatedImages);
      setIsUploading(false);
      toast.success(`${files.length} foto('s) geüpload`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [images, property.id]
  );

  // Lightbox navigation
  const navigateLightbox = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setLightboxIndex((i) => (i === 0 ? images.length - 1 : i - 1));
    } else {
      setLightboxIndex((i) => (i === images.length - 1 ? 0 : i + 1));
    }
  };

  // Open lightbox
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImagePlus className="h-5 w-5" />
            Foto&apos;s uploaden
          </CardTitle>
          <CardDescription>
            Sleep foto&apos;s hierheen of klik om te uploaden. Maximum 20 foto&apos;s per pand.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <label
            htmlFor="file-upload"
            className={cn(
              "flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
              "hover:border-primary hover:bg-muted/50",
              isUploading && "pointer-events-none opacity-50"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("border-primary", "bg-muted/50");
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove("border-primary", "bg-muted/50");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("border-primary", "bg-muted/50");
              handleFileUpload(e.dataTransfer.files);
            }}
          >
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
              disabled={isUploading || images.length >= 20}
            />
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Uploaden...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Klik of sleep foto&apos;s hierheen
                </span>
                <span className="text-xs text-muted-foreground">
                  JPG, PNG of WebP (max. 10MB per bestand)
                </span>
              </div>
            )}
          </label>
          <p className="mt-2 text-sm text-muted-foreground">
            {images.length} van 20 foto&apos;s geüpload
          </p>
        </CardContent>
      </Card>

      {/* Image Gallery */}
      {images.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Foto&apos;s ({images.length})</CardTitle>
            <CardDescription>
              Sleep foto&apos;s om de volgorde te wijzigen. Klik op een foto om details te
              bewerken.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "group relative aspect-square cursor-move overflow-hidden rounded-lg border bg-muted transition-all",
                    draggedIndex === index && "opacity-50 ring-2 ring-primary",
                    image.isPrimary && "ring-2 ring-primary"
                  )}
                >
                  {/* Image */}
                  <Image
                    src={image.originalUrl}
                    alt={image.caption || "Property image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    {/* Top badges */}
                    <div className="flex items-start justify-between p-2">
                      <div className="flex items-center gap-1">
                        <div className="cursor-grab rounded bg-black/50 p-1">
                          <GripVertical className="h-4 w-4 text-white" />
                        </div>
                        {image.isPrimary && (
                          <Badge variant="default" className="bg-primary text-xs">
                            <Star className="mr-1 h-3 w-3" />
                            Hoofdfoto
                          </Badge>
                        )}
                        {image.aiProcessed && (
                          <Badge variant="secondary" className="text-xs">
                            <Sparkles className="mr-1 h-3 w-3" />
                            AI
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <span className="sr-only">Acties</span>
                            •••
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openLightbox(index)}>
                            <Maximize2 className="mr-2 h-4 w-4" />
                            Vergroten
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedImage(image)}>
                            Bewerken
                          </DropdownMenuItem>
                          {!image.isPrimary && (
                            <DropdownMenuItem
                              onClick={() => setPrimaryImage(image.id)}
                            >
                              <Star className="mr-2 h-4 w-4" />
                              Als hoofdfoto
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleAiEnhance(image.id)}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            AI verbeteren
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteImageId(image.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Verwijderen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Bottom info */}
                    <div className="p-2 text-white">
                      <p className="truncate text-sm font-medium">
                        {image.caption || "Geen titel"}
                      </p>
                      <p className="text-xs opacity-80">
                        {imageTypeLabels[image.type] || image.type}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex min-h-[200px] flex-col items-center justify-center py-10">
            <ImagePlus className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Geen foto&apos;s</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload foto&apos;s om je pand te presenteren
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Image Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Foto bewerken</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex flex-col gap-4">
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <Image
                  src={selectedImage.originalUrl}
                  alt={selectedImage.caption || ""}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-sm font-medium">Titel</label>
                  <Input
                    value={selectedImage.caption || ""}
                    onChange={(e) =>
                      setSelectedImage({
                        ...selectedImage,
                        caption: e.target.value,
                      })
                    }
                    placeholder="Beschrijf deze foto"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Alt tekst</label>
                  <Input
                    value={selectedImage.altText || ""}
                    onChange={(e) =>
                      setSelectedImage({
                        ...selectedImage,
                        altText: e.target.value,
                      })
                    }
                    placeholder="Beschrijving voor screenreaders"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={selectedImage.type}
                    onValueChange={(value) =>
                      setSelectedImage({
                        ...selectedImage,
                        type: value as PropertyImage["type"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(imageTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedImage(null)}>
                  Annuleren
                </Button>
                <Button onClick={saveSelectedImage} disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Opslaan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteImageId}
        onOpenChange={() => setDeleteImageId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Foto verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je deze foto wilt verwijderen? Deze actie kan niet
              ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteImageId && deleteImage(deleteImageId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl bg-black/95 p-0">
          <div className="relative flex h-[80vh] items-center justify-center">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 z-10 text-white hover:bg-white/20"
                  onClick={() => navigateLightbox("prev")}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 z-10 text-white hover:bg-white/20"
                  onClick={() => navigateLightbox("next")}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Image */}
            {images[lightboxIndex] && (
              <div className="relative h-full w-full">
                <Image
                  src={images[lightboxIndex].originalUrl}
                  alt={images[lightboxIndex].caption || ""}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            )}

            {/* Caption */}
            {images[lightboxIndex]?.caption && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2">
                <p className="text-sm text-white">
                  {images[lightboxIndex].caption}
                </p>
              </div>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1">
              <p className="text-xs text-white">
                {lightboxIndex + 1} / {images.length}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
