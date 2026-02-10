"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generatePropertyDescription } from "@/app/actions/ai-description";
import { Sparkles, Copy, Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DescriptionGeneratorProps {
  propertyType: string;
  city: string;
  surface: number;
  features?: string[];
  onDescriptionGenerated?: (description: string) => void;
  className?: string;
}

export function DescriptionGenerator({
  propertyType,
  city,
  surface,
  features = [],
  onDescriptionGenerated,
  className,
}: DescriptionGeneratorProps) {
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState<"professioneel" | "wervend" | "zakelijk">("professioneel");
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  function handleGenerate() {
    startTransition(async () => {
      const result = await generatePropertyDescription({
        propertyType,
        city,
        surface,
        features,
        currentDescription: description || undefined,
        tone,
      });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      setDescription(result.description);
      onDescriptionGenerated?.(result.description);
    });
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(description);
    setCopied(true);
    toast.success("Gekopieerd!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Beschrijving Generator</h3>
          <Badge variant="secondary" className="text-xs">Automatisch</Badge>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Schrijfstijl</Label>
          <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professioneel">Professioneel</SelectItem>
              <SelectItem value="wervend">Wervend & enthousiast</SelectItem>
              <SelectItem value="zakelijk">Zakelijk & feitelijk</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isPending}
          className="mt-5"
        >
          {isPending ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {description ? "Opnieuw genereren" : "Genereer beschrijving"}
        </Button>
      </div>

      {description && (
        <div className="space-y-2">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            className="resize-none"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {description.split(/\s+/).length} woorden
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="mr-1.5 h-3.5 w-3.5" />
              ) : (
                <Copy className="mr-1.5 h-3.5 w-3.5" />
              )}
              {copied ? "Gekopieerd" : "Kopiëren"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
