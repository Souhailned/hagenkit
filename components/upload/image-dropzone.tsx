"use client";

import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageDropzoneProps {
  maxFiles?: number;
  onFilesSelected?: (files: File[]) => void;
  className?: string;
}

export function ImageDropzone({ maxFiles = 10, onFilesSelected, className }: ImageDropzoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;
      const accepted = Array.from(newFiles)
        .filter((f) => f.type.startsWith("image/"))
        .slice(0, maxFiles - files.length);

      const updated = [...files, ...accepted];
      setFiles(updated);
      onFilesSelected?.(updated);
    },
    [files, maxFiles, onFilesSelected]
  );

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesSelected?.(updated);
  };

  return (
    <div className={className}>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
          ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
        <p className="font-medium">Sleep foto&apos;s hierheen</p>
        <p className="text-sm text-muted-foreground mt-1">of klik om te selecteren</p>
        <p className="text-xs text-muted-foreground mt-2">
          JPG, PNG of WebP · Max {maxFiles} foto&apos;s
        </p>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {files.map((file, i) => (
            <div key={i} className="group relative aspect-square rounded-lg bg-muted overflow-hidden">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="h-full w-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
