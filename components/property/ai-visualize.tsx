"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Lock, Image as ImageIcon, Video, Wand2, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { triggerVirtualStaging, getVirtualStagingStatus } from "@/app/actions/ai-visualize";

interface AiVisualizeProps {
  propertyId: string;
  propertyTitle: string;
  propertyType: string;
  imageUrl?: string;
  isLoggedIn: boolean;
}

const visualStyles = [
  { value: "restaurant_modern", label: "Modern restaurant" },
  { value: "restaurant_klassiek", label: "Klassiek restaurant" },
  { value: "cafe_gezellig", label: "Gezellig cafe" },
  { value: "bar_lounge", label: "Lounge bar" },
  { value: "hotel_boutique", label: "Boutique hotel" },
  { value: "lunchroom_hip", label: "Hippe lunchroom" },
  { value: "leeg", label: "Lege ruimte (origineel)" },
];

export function AiVisualize({ propertyId, propertyTitle, propertyType, imageUrl, isLoggedIn }: AiVisualizeProps) {
  const [style, setStyle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const pollForResult = useCallback((newImageId: string) => {
    // Poll every 3 seconds for up to 5 minutes
    let attempts = 0;
    const maxAttempts = 100;

    pollRef.current = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        if (pollRef.current) clearInterval(pollRef.current);
        setIsGenerating(false);
        setError("Verwerking duurt te lang. Probeer het later opnieuw.");
        return;
      }

      const result = await getVirtualStagingStatus(newImageId);
      if (!result.success) {
        if (pollRef.current) clearInterval(pollRef.current);
        setIsGenerating(false);
        setError(result.error || "Er ging iets mis");
        return;
      }

      if (result.data?.status === "COMPLETED" && result.data.resultUrl) {
        if (pollRef.current) clearInterval(pollRef.current);
        setIsGenerating(false);
        setGeneratedImage(result.data.resultUrl);
      }
    }, 3000);
  }, []);

  async function handleGenerate() {
    if (!style || !isLoggedIn || !imageUrl) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    const result = await triggerVirtualStaging({
      propertyId,
      imageUrl,
      style,
    });

    if (!result.success) {
      setIsGenerating(false);
      setError(result.error || "Kon de visualisatie niet starten");
      return;
    }

    // Start polling for the result
    pollForResult(result.data!.newImageId);
  }

  if (!isLoggedIn) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">AI Visualisatie</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Stel je voor hoe dit pand eruitziet als jouw droomzaak. 
            Log in om de AI visualisatie te gebruiken.
          </p>
          <div className="mt-4 flex gap-2">
            <Link href="/sign-in">
              <Button>Inloggen</Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="outline">Account aanmaken</Button>
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Gratis account · Max 3 AI acties per dag
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Visualisatie
          <Badge variant="secondary" className="text-xs">Beta</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Stel je voor hoe <strong>{propertyTitle}</strong> eruitziet in een andere stijl. 
          Kies een inrichting en onze AI genereert een visualisatie.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Original */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Origineel</p>
            <div className="aspect-video rounded-lg bg-muted overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt="Origineel" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                </div>
              )}
            </div>
          </div>

          {/* Generated */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">AI Visualisatie</p>
            <div className="aspect-video rounded-lg bg-muted overflow-hidden">
              {isGenerating ? (
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Genereren... dit kan 30-60 sec duren</span>
                </div>
              ) : error ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <span className="text-xs text-center text-destructive">{error}</span>
                </div>
              ) : generatedImage ? (
                <img src={generatedImage} alt="AI Visualisatie" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <Wand2 className="h-8 w-8 text-muted-foreground/30" />
                  <span className="text-xs text-muted-foreground">Kies een stijl</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Kies inrichtingsstijl..." />
            </SelectTrigger>
            <SelectContent>
              {visualStyles.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerate} disabled={!style || !imageUrl || isGenerating}>
            <Sparkles className="mr-1.5 h-4 w-4" />
            {isGenerating ? "Bezig..." : "Genereer"}
          </Button>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ImageIcon className="h-3 w-3" /> AI Inrichting
          </span>
          <span className="flex items-center gap-1">
            <Video className="h-3 w-3" /> AI Video Tour (binnenkort)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
