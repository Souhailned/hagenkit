"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Eraser,
  Wand2,
  Loader2,
  Minus,
  Plus,
  Paintbrush,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InpaintCanvas } from "@/components/property/inpaint-canvas";
import type { InpaintCanvasRef } from "@/components/property/inpaint-canvas";
import { BeforeAfterSlider } from "@/components/property/before-after-slider";
import { createInpaintPlaceholder } from "@/app/actions/ai-inpaint";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface InpaintEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceImageUrl: string;
  propertyTitle: string;
  propertyId?: string;
  sourceConceptId?: string;
  sourceImageId?: string;
  aiQuota?: { freeEditsUsed: number; freeEditsLimit: number };
  onSuccess?: (resultUrl: string) => void;
}

type EditorMode = "remove" | "add";

interface SSEProgress {
  step: string;
  pct: number;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function InpaintEditorModal({
  open,
  onOpenChange,
  sourceImageUrl,
  propertyTitle,
  propertyId,
  sourceConceptId,
  sourceImageId,
  aiQuota,
  onSuccess,
}: InpaintEditorModalProps) {
  const canvasRef = useRef<InpaintCanvasRef>(null);
  const [mode, setMode] = useState<EditorMode>("remove");
  const [brushSize, setBrushSize] = useState(30);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<SSEProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [versions, setVersions] = useState<
    Array<{ id: string; url: string }>
  >([]);

  const remaining =
    aiQuota ? aiQuota.freeEditsLimit - aiQuota.freeEditsUsed : -1;
  const isLimitReached = remaining === 0;

  /* -- Reset state when modal opens ---------------------------------------- */
  useEffect(() => {
    if (open) {
      setError(null);
      setResultUrl(null);
      setProgress(null);
      setIsGenerating(false);
    }
  }, [open]);

  /* -- Generate handler ---------------------------------------------------- */
  const handleGenerate = useCallback(async () => {
    if (isGenerating) return;

    // Validate based on mode
    if (mode === "remove" && !canvasRef.current?.hasMask()) {
      setError("Markeer eerst het gebied dat je wilt verwijderen");
      return;
    }
    if (mode === "add" && !prompt.trim()) {
      setError("Beschrijf wat je wilt toevoegen");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResultUrl(null);

    try {
      // 1. Create placeholder via server action
      const placeholderResult = await createInpaintPlaceholder({
        sourceConceptId,
        sourceImageId,
        sourceImageUrl,
        propertyId,
        prompt:
          prompt.trim() || "Remove the marked area and fill naturally",
        mode,
      });

      if (!placeholderResult.success || !placeholderResult.data) {
        setError(placeholderResult.error || "Kon inpaint niet starten");
        setIsGenerating(false);
        return;
      }

      const { newImageId, sourceImageId: resolvedSourceId } =
        placeholderResult.data;

      // 2. Get mask data URL if in remove mode
      const maskDataUrl =
        mode === "remove" ? canvasRef.current?.exportMask() : undefined;

      // 3. Call SSE endpoint
      const response = await fetch("/api/ai/images/inpaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageId: resolvedSourceId,
          newImageId,
          prompt:
            prompt.trim() || "Remove the marked area and fill naturally",
          mode,
          maskDataUrl: maskDataUrl || undefined,
        }),
      });

      if (!response.ok || !response.body) {
        setError("Verbinding met server mislukt");
        setIsGenerating(false);
        return;
      }

      // 4. Parse SSE events
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const dataMatch = line.match(/^data:\s*(.*)/);
          if (!dataMatch) continue;

          try {
            const event = JSON.parse(dataMatch[1]);

            if (event.type === "progress") {
              setProgress({ step: event.step, pct: event.pct });
            } else if (event.type === "done") {
              setResultUrl(event.resultImageUrl);
              setVersions((prev) => [
                ...prev,
                { id: event.imageId, url: event.resultImageUrl },
              ]);
              onSuccess?.(event.resultImageUrl);
            } else if (event.type === "error") {
              setError(event.message);
            }
          } catch {
            // Ignore parse errors from incomplete SSE chunks
          }
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Er ging iets mis"
      );
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  }, [
    mode,
    prompt,
    sourceConceptId,
    sourceImageId,
    sourceImageUrl,
    propertyId,
    isGenerating,
    onSuccess,
  ]);

  /* -- Progress label ------------------------------------------------------ */
  const progressLabel = progress
    ? progress.step === "uploading"
      ? "Afbeelding uploaden..."
      : progress.step === "generating"
        ? "AI genereert..."
        : "Opslaan..."
    : "Bezig...";

  /* -- Render -------------------------------------------------------------- */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[100dvh] max-w-[100vw] flex-col gap-0 rounded-none border-0 p-0">
        {/* ---------------------------------------------------------------- */}
        {/*  Header                                                          */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-sm font-semibold">
              AI Bewerker &mdash; {propertyTitle}
            </DialogTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            Beta
          </Badge>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/*  Main canvas area                                                */}
        {/* ---------------------------------------------------------------- */}
        <div className="relative flex-1 overflow-hidden bg-muted/30">
          {resultUrl ? (
            <div className="flex h-full items-center justify-center p-4">
              <div className="w-full max-w-4xl">
                <BeforeAfterSlider
                  originalUrl={sourceImageUrl}
                  resultUrl={resultUrl}
                  beforeLabel="Origineel"
                  afterLabel="Bewerkt"
                />
              </div>
            </div>
          ) : (
            <InpaintCanvas
              ref={canvasRef}
              sourceImageUrl={sourceImageUrl}
              brushSize={brushSize}
              className="h-full w-full"
            />
          )}

          {/* Progress overlay */}
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-6 shadow-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium">{progressLabel}</p>
                {progress && (
                  <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${progress.pct}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/*  Version history strip                                           */}
        {/* ---------------------------------------------------------------- */}
        {versions.length > 0 && (
          <div className="flex items-center gap-2 border-t px-4 py-2">
            <span className="text-xs text-muted-foreground">
              Versies:
            </span>
            <div className="flex gap-1.5 overflow-x-auto">
              {versions.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => setResultUrl(v.url)}
                  className={cn(
                    "relative h-10 w-16 flex-shrink-0 overflow-hidden rounded border-2 transition-colors",
                    resultUrl === v.url
                      ? "border-primary"
                      : "border-transparent hover:border-muted-foreground/30"
                  )}
                >
                  <img
                    src={v.url}
                    alt={`Versie ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-0 left-0 bg-black/50 px-1 text-[8px] text-white">
                    v{i + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/*  Toolbar                                                         */}
        {/* ---------------------------------------------------------------- */}
        <div className="space-y-3 border-t px-4 py-3">
          {/* Error display */}
          {error && (
            <p className="text-center text-xs text-destructive">
              {error}
            </p>
          )}

          {/* Brush controls + mode toggle */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Brush size */}
            <div className="flex items-center gap-2">
              <Paintbrush className="h-4 w-4 text-muted-foreground" />
              <Minus className="h-3 w-3 text-muted-foreground" />
              <Slider
                value={[brushSize]}
                onValueChange={([v]) => setBrushSize(v)}
                min={10}
                max={100}
                step={5}
                className="w-32"
              />
              <Plus className="h-3 w-3 text-muted-foreground" />
              <span className="w-10 text-xs text-muted-foreground">
                {brushSize}px
              </span>
            </div>

            {/* Mode toggle */}
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(v) => {
                if (v) setMode(v as EditorMode);
              }}
              className="gap-1"
            >
              <ToggleGroupItem value="remove" className="text-xs">
                <Eraser className="mr-1 h-3.5 w-3.5" />
                Verwijderen
              </ToggleGroupItem>
              <ToggleGroupItem value="add" className="text-xs">
                <Wand2 className="mr-1 h-3.5 w-3.5" />
                Toevoegen
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Prompt + actions */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Input
              placeholder={
                mode === "remove"
                  ? "Optioneel: beschrijf vervanging..."
                  : "Beschrijf wat je wilt toevoegen..."
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />

            <div className="flex items-center gap-2">
              {/* Undo / Redo / Clear */}
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => canvasRef.current?.undo()}
                  disabled={isGenerating || !!resultUrl}
                  title="Ongedaan maken"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => canvasRef.current?.redo()}
                  disabled={isGenerating || !!resultUrl}
                  title="Opnieuw"
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => canvasRef.current?.clearMask()}
                  disabled={isGenerating || !!resultUrl}
                  title="Wis markering"
                >
                  <Eraser className="h-4 w-4" />
                </Button>
              </div>

              {/* Quota indicator */}
              {remaining >= 0 && (
                <Badge
                  variant="secondary"
                  className="whitespace-nowrap text-xs"
                >
                  Nog {remaining}
                </Badge>
              )}

              {/* Generate / Edit again button */}
              {resultUrl ? (
                <Button
                  onClick={() => {
                    setResultUrl(null);
                    setError(null);
                  }}
                  variant="outline"
                >
                  Opnieuw bewerken
                </Button>
              ) : (
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || isLimitReached}
                >
                  <Wand2 className="mr-1.5 h-4 w-4" />
                  {isGenerating ? "Bezig..." : "Genereer"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
