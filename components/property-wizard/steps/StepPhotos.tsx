"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type PropertyWizardData, type PropertyPhoto } from "../types";
import {
  Upload,
  X,
  Star,
  Sparkles,
  ImageIcon,
  GripVertical,
} from "lucide-react";

interface StepPhotosProps {
  data: PropertyWizardData;
  onUpdate: (updates: Partial<PropertyWizardData>) => void;
}

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function StepPhotos({ data, onUpdate }: StepPhotosProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFiles = useCallback(
    (files: FileList) => {
      const newPhotos: PropertyPhoto[] = [];
      const maxFiles = 20 - data.photos.length;

      for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          newPhotos.push({
            id: generateId(),
            file,
            previewUrl: URL.createObjectURL(file),
            isPrimary: data.photos.length === 0 && i === 0,
            aiEnhance: false,
          });
        }
      }

      if (newPhotos.length > 0) {
        onUpdate({ photos: [...data.photos, ...newPhotos] });
      }
    },
    [data.photos, onUpdate]
  );

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  // Set primary photo
  const setPrimary = useCallback(
    (id: string) => {
      const updatedPhotos = data.photos.map((photo) => ({
        ...photo,
        isPrimary: photo.id === id,
      }));
      onUpdate({ photos: updatedPhotos });
    },
    [data.photos, onUpdate]
  );

  // Toggle AI enhance
  const toggleAiEnhance = useCallback(
    (id: string, checked: boolean) => {
      const updatedPhotos = data.photos.map((photo) =>
        photo.id === id ? { ...photo, aiEnhance: checked } : photo
      );
      onUpdate({ photos: updatedPhotos });
    },
    [data.photos, onUpdate]
  );

  // Remove photo
  const removePhoto = useCallback(
    (id: string) => {
      const updatedPhotos = data.photos.filter((photo) => photo.id !== id);
      // If we removed the primary, make the first one primary
      if (updatedPhotos.length > 0 && !updatedPhotos.some((p) => p.isPrimary)) {
        updatedPhotos[0].isPrimary = true;
      }
      onUpdate({ photos: updatedPhotos });
    },
    [data.photos, onUpdate]
  );

  // Reorder photos via drag
  const handlePhotoReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      const updatedPhotos = [...data.photos];
      const [removed] = updatedPhotos.splice(fromIndex, 1);
      updatedPhotos.splice(toIndex, 0, removed);
      onUpdate({ photos: updatedPhotos });
    },
    [data.photos, onUpdate]
  );

  const handlePhotoDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handlePhotoDragEnd = () => {
    setDraggedIndex(null);
  };

  const handlePhotoDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      handlePhotoReorder(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        className={cn(
          "relative rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          data.photos.length >= 20 && "opacity-50 pointer-events-none"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium">
              {isDragging ? "Laat los om te uploaden" : "Sleep foto's hierheen"}
            </p>
            <p className="text-sm text-muted-foreground">
              of{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline"
              >
                selecteer bestanden
              </button>
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            JPG, PNG of WEBP • Max 20 foto&apos;s • Max 10MB per foto
          </p>
        </div>
      </div>

      {/* Photo count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {data.photos.length}/20 foto&apos;s
        </span>
        {data.photos.length > 0 && (
          <button
            type="button"
            onClick={() => onUpdate({ photos: [] })}
            className="text-destructive hover:underline"
          >
            Alle verwijderen
          </button>
        )}
      </div>

      {/* Photo Grid */}
      {data.photos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.photos.map((photo, index) => (
            <div
              key={photo.id}
              draggable
              onDragStart={() => handlePhotoDragStart(index)}
              onDragEnd={handlePhotoDragEnd}
              onDragOver={(e) => handlePhotoDragOver(e, index)}
              className={cn(
                "group relative overflow-hidden rounded-lg border bg-muted/30 transition-all",
                photo.isPrimary && "ring-2 ring-primary",
                draggedIndex === index && "opacity-50 scale-95"
              )}
            >
              {/* Image */}
              <div className="aspect-[4/3] relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.previewUrl}
                  alt={`Foto ${index + 1}`}
                  className="h-full w-full object-cover"
                />

                {/* Drag handle overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                  <GripVertical className="h-5 w-5 text-white drop-shadow-lg" />
                </div>

                {/* Primary badge */}
                {photo.isPrimary && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                    <Star className="h-3 w-3 fill-current" />
                    Hoofd
                  </div>
                )}

                {/* AI Enhanced indicator */}
                {photo.aiEnhance && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-purple-500 px-2 py-1 text-xs font-medium text-white">
                    <Sparkles className="h-3 w-3" />
                    AI
                  </div>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-destructive p-1.5 text-destructive-foreground hover:bg-destructive/90"
                  aria-label="Verwijder foto"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 p-3">
                {/* Set as primary */}
                {!photo.isPrimary && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPrimary(photo.id)}
                    className="h-8 text-xs"
                  >
                    <Star className="mr-1 h-3 w-3" />
                    Maak hoofdfoto
                  </Button>
                )}
                {photo.isPrimary && (
                  <span className="text-xs text-muted-foreground">Hoofdfoto</span>
                )}

                {/* AI Enhance checkbox */}
                <Label className="flex cursor-pointer items-center gap-2 text-xs">
                  <Checkbox
                    checked={photo.aiEnhance}
                    onCheckedChange={(checked) =>
                      toggleAiEnhance(photo.id, checked === true)
                    }
                  />
                  <Sparkles className="h-3 w-3 text-purple-500" />
                  AI
                </Label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {data.photos.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
          <div>
            <p className="font-medium">Nog geen foto&apos;s</p>
            <p className="text-sm text-muted-foreground">
              Upload foto&apos;s om uw pand te presenteren
            </p>
          </div>
        </div>
      )}

      {/* AI Enhancement Info */}
      <div className="rounded-lg bg-purple-500/5 border border-purple-500/20 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-purple-600 dark:text-purple-400">
              AI Foto Verbetering
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Schakel AI verbetering in voor foto&apos;s die u wilt laten optimaliseren.
              Onze AI verbetert belichting, kleuren en zorgt voor professionele
              presentatie. Dit gebeurt na het publiceren.
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-lg bg-primary/5 p-4">
        <h4 className="text-sm font-medium text-primary">Fototips</h4>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc list-inside">
          <li>Zorg voor goede belichting - natuurlijk licht werkt het beste</li>
          <li>Fotografeer vanuit de hoeken voor ruimtelijk effect</li>
          <li>Neem foto&apos;s van binnen én buiten</li>
          <li>De eerste foto is de hoofdfoto die in zoekresultaten verschijnt</li>
        </ul>
      </div>
    </div>
  );
}
