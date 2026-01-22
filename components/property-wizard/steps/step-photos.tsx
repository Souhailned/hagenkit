"use client";

import { useCallback, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  PropertyWizardData,
  WizardPhoto,
  PropertyImageType,
  PROPERTY_IMAGE_TYPES,
} from "../types";
import {
  IconUpload,
  IconTrash,
  IconStar,
  IconStarFilled,
  IconSparkles,
} from "@tabler/icons-react";

interface StepPhotosProps {
  data: PropertyWizardData;
  onUpdate: (data: Partial<PropertyWizardData>) => void;
}

const IMAGE_TYPE_LABELS: Record<PropertyImageType, string> = {
  EXTERIOR: "Buitenkant",
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

export function StepPhotos({ data, onUpdate }: StepPhotosProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newPhotos: WizardPhoto[] = [];

      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          const id = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          const previewUrl = URL.createObjectURL(file);

          newPhotos.push({
            id,
            file,
            previewUrl,
            type: "INTERIOR",
            isPrimary: data.photos.length === 0 && newPhotos.length === 0,
            aiEnhance: false,
          });
        }
      });

      if (newPhotos.length > 0) {
        onUpdate({ photos: [...data.photos, ...newPhotos] });
      }
    },
    [data.photos, onUpdate]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [handleFiles]
  );

  const removePhoto = useCallback(
    (id: string) => {
      const photo = data.photos.find((p) => p.id === id);
      if (photo?.previewUrl && photo.file) {
        URL.revokeObjectURL(photo.previewUrl);
      }

      const remaining = data.photos.filter((p) => p.id !== id);

      // If removed was primary, make first one primary
      if (photo?.isPrimary && remaining.length > 0) {
        remaining[0].isPrimary = true;
      }

      onUpdate({ photos: remaining });
    },
    [data.photos, onUpdate]
  );

  const setPrimary = useCallback(
    (id: string) => {
      const updated = data.photos.map((p) => ({
        ...p,
        isPrimary: p.id === id,
      }));
      onUpdate({ photos: updated });
    },
    [data.photos, onUpdate]
  );

  const updatePhoto = useCallback(
    (id: string, updates: Partial<WizardPhoto>) => {
      const updated = data.photos.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      );
      onUpdate({ photos: updated });
    },
    [data.photos, onUpdate]
  );

  const toggleAiEnhance = useCallback(
    (id: string) => {
      const photo = data.photos.find((p) => p.id === id);
      if (photo) {
        updatePhoto(id, { aiEnhance: !photo.aiEnhance });
      }
    },
    [data.photos, updatePhoto]
  );

  const hasAiEnhanceEnabled = data.photos.some((p) => p.aiEnhance);

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/30 hover:border-primary/50 hover:bg-accent/30"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        <div
          className={cn(
            "flex size-14 items-center justify-center rounded-full transition-colors",
            dragActive ? "bg-primary text-primary-foreground" : "bg-muted"
          )}
        >
          <IconUpload className="size-6" />
        </div>

        <p className="mt-4 text-center text-sm font-medium">
          {dragActive ? "Laat los om te uploaden" : "Sleep foto's hierheen"}
        </p>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          of klik om bestanden te selecteren
        </p>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          JPG, PNG of WebP • Max 10MB per foto • Max 20 foto&apos;s
        </p>
      </div>

      {/* Photo grid */}
      {data.photos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {data.photos.length} foto{data.photos.length !== 1 ? "'s" : ""} toegevoegd
            </p>
            {hasAiEnhanceEnabled && (
              <span className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                <IconSparkles className="size-3" />
                AI verbetering actief
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.photos.map((photo, index) => (
              <div
                key={photo.id}
                className={cn(
                  "group relative overflow-hidden rounded-lg border bg-card transition-all",
                  photo.isPrimary && "ring-2 ring-primary"
                )}
              >
                {/* Image */}
                <div className="aspect-video bg-muted">
                  <img
                    src={photo.previewUrl}
                    alt={`Foto ${index + 1}`}
                    className="size-full object-cover"
                  />
                </div>

                {/* Primary badge */}
                {photo.isPrimary && (
                  <div className="absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    Hoofdfoto
                  </div>
                )}

                {/* AI enhance badge */}
                {photo.aiEnhance && (
                  <div className="absolute top-2 right-2 rounded-full bg-purple-500 p-1">
                    <IconSparkles className="size-3 text-white" />
                  </div>
                )}

                {/* Actions overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrimary(photo.id);
                    }}
                    disabled={photo.isPrimary}
                    title={photo.isPrimary ? "Dit is de hoofdfoto" : "Maak hoofdfoto"}
                  >
                    {photo.isPrimary ? (
                      <IconStarFilled className="size-4 text-yellow-500" />
                    ) : (
                      <IconStar className="size-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAiEnhance(photo.id);
                    }}
                    title={photo.aiEnhance ? "AI verbetering uitschakelen" : "AI verbetering inschakelen"}
                    className={photo.aiEnhance ? "bg-purple-500 text-white hover:bg-purple-600" : ""}
                  >
                    <IconSparkles className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(photo.id);
                    }}
                    title="Verwijderen"
                  >
                    <IconTrash className="size-4" />
                  </Button>
                </div>

                {/* Photo type selector */}
                <div className="border-t bg-card/95 p-2">
                  <Select
                    value={photo.type}
                    onValueChange={(value: PropertyImageType) =>
                      updatePhoto(photo.id, { type: value })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_IMAGE_TYPES.map((type) => (
                        <SelectItem key={type} value={type} className="text-xs">
                          {IMAGE_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Enhancement info */}
      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950/30">
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
            <IconSparkles className="size-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h5 className="text-sm font-medium text-purple-900 dark:text-purple-200">
              AI Fotoverbetering
            </h5>
            <p className="mt-1 text-xs text-purple-700 dark:text-purple-400">
              Laat AI je foto's automatisch verbeteren met betere belichting, kleuren en scherpte.
              Selecteer de foto's die je wilt verbeteren door op het{" "}
              <IconSparkles className="inline size-3" /> icoon te klikken.
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      {data.photos.length === 0 && (
        <div className="rounded-lg border border-dashed bg-muted/30 p-4">
          <h5 className="text-sm font-medium">Foto tips</h5>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            <li>• Maak foto's bij daglicht voor de beste kwaliteit</li>
            <li>• Voeg minimaal 5 foto's toe voor een aantrekkelijke listing</li>
            <li>• Toon zowel de ruimte als bijzondere details</li>
            <li>• De eerste foto wordt getoond in zoekresultaten</li>
          </ul>
        </div>
      )}
    </div>
  );
}
