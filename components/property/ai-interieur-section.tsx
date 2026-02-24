"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wand2,
  Loader2,
  AlertCircle,
  Video,
  ArrowRight,
  Eye,
  Palette,
  Layers,
  Pencil,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BeforeAfterSlider } from "@/components/property/before-after-slider";
import { triggerVirtualStaging } from "@/app/actions/ai-visualize";
import { trackDreamInteraction } from "@/app/actions/public-demo-concepts";
import type { DemoConceptData } from "@/app/actions/public-demo-concepts";
import type {
  PublishedAiMedia,
  PublishedAiImage,
} from "@/app/actions/public-ai-media";

const InpaintEditorModal = lazy(
  () => import("@/components/property/inpaint-editor-modal").then(
    (m) => ({ default: m.InpaintEditorModal })
  )
);

/* -------------------------------------------------------------------------- */
/*  Types & constants                                                          */
/* -------------------------------------------------------------------------- */

interface AiInterieurSectionProps {
  propertyId: string;
  propertySlug: string;
  propertyTitle: string;
  sourceImageUrl: string;
  demoConcepts: DemoConceptData[];
  publishedAiMedia?: PublishedAiMedia;
  isLoggedIn: boolean;
  teaserStyle?: string;
  aiQuota?: { freeEditsUsed: number; freeEditsLimit: number; remaining: number; totalEdits: number };
}

const visualStyles = [
  { value: "specialty_coffee", label: "Specialty Coffee" },
  { value: "wine_tapas", label: "Wijnbar & Tapas" },
  { value: "bakery_brunch", label: "Bakkerij & Brunch" },
  { value: "healthy_bar", label: "Healthy Bar" },
  { value: "restaurant_modern", label: "Modern Restaurant" },
  { value: "industrial_loft", label: "Industrial Loft" },
];

const VALUE_PROPS = [
  { icon: Eye, text: "6 interieurstijlen bekijken" },
  { icon: Palette, text: "AI visualisaties op maat" },
  { icon: Layers, text: "Voor- en na-vergelijking" },
] as const;

/** Readable style labels for thumbnail grid */
const styleLabels: Record<string, string> = {
  restaurant_modern: "Modern Restaurant",
  restaurant_klassiek: "Klassiek Restaurant",
  cafe_gezellig: "Gezellig Cafe",
  bar_lounge: "Bar & Lounge",
  hotel_boutique: "Boutique Hotel",
  lunchroom_hip: "Hip Lunchroom",
  specialty_coffee: "Specialty Coffee",
  wine_tapas: "Wijnbar & Tapas",
  bakery_brunch: "Bakkerij & Brunch",
  healthy_bar: "Healthy Bar",
  industrial_loft: "Industrial Loft",
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function AiInterieurSection({
  propertyId,
  propertySlug,
  propertyTitle,
  sourceImageUrl,
  demoConcepts,
  publishedAiMedia,
  isLoggedIn,
  teaserStyle,
  aiQuota,
}: AiInterieurSectionProps) {
  /* -- Determine teaser concept for guests -------------------------------- */
  const teaserConcept = teaserStyle
    ? demoConcepts.find((c) => c.style === teaserStyle) ?? demoConcepts[0] ?? null
    : demoConcepts[0] ?? null;

  /* -- Slider state -------------------------------------------------------- */
  const [activeConcept, setActiveConcept] = useState<DemoConceptData | null>(
    isLoggedIn ? (demoConcepts[0] ?? null) : teaserConcept
  );
  const [activePublishedImage, setActivePublishedImage] =
    useState<PublishedAiImage | null>(null);

  /* -- Generate state (logged-in only) ------------------------------------- */
  const [style, setStyle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* -- Editor modal state -------------------------------------------------- */
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSourceUrl, setEditorSourceUrl] = useState("");
  const [editorConceptId, setEditorConceptId] = useState<string | undefined>();

  const signUpUrl = `/sign-up?source=ai_preview&property=${propertySlug}`;

  const aiImages = publishedAiMedia?.aiImages ?? [];
  const hasVideo = !!publishedAiMedia?.videoUrl;

  /* -- Quota display ------------------------------------------------------- */
  const remaining = aiQuota ? aiQuota.remaining : -1;
  const isLimitReached = remaining === 0;

  /* -- Determine what the slider shows ------------------------------------- */
  const sliderResult = generatedImage
    ? generatedImage
    : activePublishedImage
      ? activePublishedImage.resultImageUrl
      : activeConcept?.imageUrl ?? null;

  const sliderOriginal = activePublishedImage
    ? activePublishedImage.originalImageUrl
    : sourceImageUrl;

  /* -- Track view on mount ------------------------------------------------- */
  useEffect(() => {
    trackDreamInteraction(propertyId, "view").catch(() => {});
  }, [propertyId]);

  /* -- Generate handler (direct -- no polling) ----------------------------- */
  async function handleGenerate() {
    if (!style || !isLoggedIn || !sourceImageUrl) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    setActivePublishedImage(null);

    const result = await triggerVirtualStaging({
      propertyId,
      imageUrl: sourceImageUrl,
      style,
    });

    setIsGenerating(false);

    if (!result.success) {
      setError(result.error || "Kon de visualisatie niet starten");
      return;
    }

    setGeneratedImage(result.data!.resultUrl);
  }

  const handleCtaClick = () => {
    trackDreamInteraction(propertyId, "cta_click").catch(() => {});
  };

  /* -- Open editor with current slider image ------------------------------- */
  function openEditor() {
    const url = sliderResult || sourceImageUrl;
    if (!url) return;
    setEditorSourceUrl(url);
    setEditorConceptId(activeConcept?.id);
    setEditorOpen(true);
  }

  /* -------------------------------------------------------------------------- */
  /*  Render                                                                     */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="rounded-2xl border bg-card">
      {/* 1. Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="space-y-0.5">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Wand2 className="h-4 w-4 text-primary" />
            </div>
            AI Interieur
          </h3>
          <p className="text-sm text-muted-foreground">
            Hoe zou <strong>{propertyTitle}</strong> eruitzien als jouw concept?
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Quota badge for logged-in users */}
          {isLoggedIn && remaining >= 0 && (
            <Badge variant="outline" className="text-xs">
              {remaining} van {aiQuota?.freeEditsLimit} bewerkingen
            </Badge>
          )}
          <Badge
            variant="secondary"
            className="text-xs font-medium text-muted-foreground"
          >
            {isLoggedIn ? "Beta" : "AI Preview"}
          </Badge>
        </div>
      </div>

      {/* 2. Before/After Slider */}
      <div className="px-5 pb-3">
        {sliderResult && sliderOriginal ? (
          <div className="relative">
            <BeforeAfterSlider
              originalUrl={sliderOriginal}
              resultUrl={sliderResult}
            />

            {/* Edit button for logged-in users */}
            {isLoggedIn && (
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-3 right-3 gap-1.5 bg-background/80 backdrop-blur-sm"
                onClick={openEditor}
                disabled={isLimitReached}
              >
                <Pencil className="h-3.5 w-3.5" />
                Bewerk
              </Button>
            )}
          </div>
        ) : (
          /* No concepts: static placeholder */
          <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl border bg-muted/30">
            {sourceImageUrl ? (
              <>
                <Image
                  src={sourceImageUrl}
                  alt="Pand foto"
                  fill
                  className="object-cover opacity-40"
                  unoptimized
                />
                <div className="relative z-10 space-y-2 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Wand2 className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    AI concepten binnenkort beschikbaar
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Wand2 className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  AI interieur preview binnenkort beschikbaar
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Clickable style thumbnails (logged-in users only) */}
      {isLoggedIn && demoConcepts.length > 0 && (
        <div className="px-5 pb-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Kies een stijl
          </p>
          <div className="grid grid-cols-3 gap-2">
            {demoConcepts.slice(0, 6).map((concept) => (
              <button
                key={concept.id}
                onClick={() => {
                  setActiveConcept(concept);
                  setActivePublishedImage(null);
                  setGeneratedImage(null);
                  trackDreamInteraction(propertyId, "style_click", concept.style).catch(
                    () => {}
                  );
                }}
                className={cn(
                  "relative aspect-video overflow-hidden rounded-lg border-2 transition-colors",
                  activeConcept?.id === concept.id &&
                    !activePublishedImage &&
                    !generatedImage
                    ? "border-primary ring-1 ring-primary/20"
                    : "border-transparent hover:border-muted-foreground/30"
                )}
              >
                <Image
                  src={concept.imageUrl}
                  alt={styleLabels[concept.style] || concept.style}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1 pt-3">
                  <span className="text-[10px] font-medium text-white">
                    {styleLabels[concept.style] || concept.style}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Published AI gallery (makelaar images) */}
      {aiImages.length > 0 && (
        <div className="space-y-2 px-5 pb-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              AI-verbeterde foto&apos;s
            </p>
            <Badge variant="secondary">{aiImages.length} foto&apos;s</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {aiImages.map((img, i) => (
              <button
                key={img.id}
                onClick={() => {
                  setActivePublishedImage(img);
                  setGeneratedImage(null);
                }}
                className={cn(
                  "relative aspect-video overflow-hidden rounded-lg border-2 transition-colors",
                  activePublishedImage?.id === img.id
                    ? "border-primary ring-1 ring-primary/20"
                    : "border-transparent hover:border-muted-foreground/30"
                )}
              >
                <img
                  src={img.resultImageUrl}
                  alt={img.roomType ?? `AI foto ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                {img.roomType && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1 pt-3">
                    <span className="text-[10px] font-medium text-white">
                      {img.roomType}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Generate section (logged-in only) */}
      {isLoggedIn && (
        <div className="space-y-3 px-5 pb-4">
          <Separator />
          <p className="text-xs font-medium text-muted-foreground">
            Of genereer je eigen stijl
          </p>

          {/* Loading / error / generated preview */}
          {(isGenerating || error) && (
            <div className="flex aspect-video items-center justify-center rounded-lg bg-muted overflow-hidden">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Genereren... dit kan 30-60 sec duren
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 p-4">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <span className="text-center text-xs text-destructive">
                    {error}
                  </span>
                </div>
              )}
            </div>
          )}

          {isLimitReached ? (
            /* Limit reached: show upgrade CTA instead of generate */
            <div className="rounded-lg border border-dashed p-4 text-center">
              <Sparkles className="mx-auto mb-2 h-6 w-6 text-primary/60" />
              <p className="mb-2 text-sm font-medium text-foreground">
                Je gratis bewerkingen zijn op
              </p>
              <p className="mb-3 text-xs text-muted-foreground">
                Upgrade voor onbeperkte AI visualisaties
              </p>
              <Button size="sm" variant="outline">
                Bekijk opties
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Kies inrichtingsstijl..." />
                </SelectTrigger>
                <SelectContent>
                  {visualStyles.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleGenerate}
                disabled={!style || !sourceImageUrl || isGenerating}
              >
                <Wand2 className="mr-1.5 h-4 w-4" />
                {isGenerating ? "Bezig..." : "Genereer"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 6. Video Tour (logged-in only) */}
      {isLoggedIn && (
        <div className="px-5 pb-4">
          <Separator className="mb-3" />
          <div className="flex items-center gap-2 mb-3">
            <Video className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground">
              Video Tour
            </p>
            {!hasVideo && (
              <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                Binnenkort
              </Badge>
            )}
          </div>
          {hasVideo ? (
            <div className="aspect-video overflow-hidden rounded-xl bg-muted">
              <video
                src={publishedAiMedia!.videoUrl!}
                controls
                poster={publishedAiMedia!.videoThumbnailUrl ?? undefined}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
              <Video className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                Video tour binnenkort beschikbaar
              </p>
            </div>
          )}
        </div>
      )}

      {/* 7. Guest CTA — directly under slider, no overlay */}
      {!isLoggedIn && (
        <>
          {/* Value props */}
          <div className="flex flex-wrap items-center justify-center gap-4 border-t px-5 py-3 sm:gap-6">
            {VALUE_PROPS.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <Icon className="h-3.5 w-3.5 text-primary/70" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* CTA block */}
          <div className="space-y-2 px-5 pb-5">
            <p className="text-center text-sm font-medium text-foreground">
              Bekijk alle 6 stijlen + pas aan met AI
            </p>
            <Button className="w-full" size="lg" asChild>
              <Link href={signUpUrl} onClick={handleCtaClick}>
                Gratis account aanmaken
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Geen creditcard nodig &middot; 30 seconden klaar
            </p>
          </div>
        </>
      )}

      {/* 8. Inpaint Editor Modal (lazy loaded) */}
      {isLoggedIn && editorOpen && (
        <Suspense fallback={null}>
          <InpaintEditorModal
            open={editorOpen}
            onOpenChange={setEditorOpen}
            sourceImageUrl={editorSourceUrl}
            propertyTitle={propertyTitle}
            propertyId={propertyId}
            sourceConceptId={editorConceptId}
            aiQuota={aiQuota ? { freeEditsUsed: aiQuota.freeEditsUsed, freeEditsLimit: aiQuota.freeEditsLimit } : undefined}
            onSuccess={(resultUrl) => {
              setGeneratedImage(resultUrl);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
