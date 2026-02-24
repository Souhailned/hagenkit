"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Copy, Check, Loader2 } from "lucide-react";
import {
  generateListingPackage,
  type ListingPackage,
} from "@/app/actions/ai-listing-package";
import { toast } from "sonner";

interface ListingGeneratorProps {
  propertyId: string;
  propertyTitle: string;
}

export function ListingGenerator({
  propertyId,
  propertyTitle,
}: ListingGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ListingPackage | null>(null);
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  const steps = [
    "Pand data ophalen...",
    "Beschrijvingen genereren...",
    "SWOT analyseren...",
    "Social media content maken...",
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    setStep(0);

    // Cosmetic progress
    const interval = setInterval(() => {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }, 1500);

    const res = await generateListingPackage(propertyId);
    clearInterval(interval);
    setLoading(false);

    if (res.success && res.data) {
      setResult(res.data);
      toast.success("Listing pakket gegenereerd!");
    } else {
      toast.error(res.error || "Genereren mislukt");
    }
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">AI Listing Pakket</h3>
          <p className="text-xs text-muted-foreground">
            Genereer beschrijvingen, SWOT en social media in een klik
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={loading}
          size="sm"
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {loading ? steps[step] : "Genereer pakket"}
        </Button>
      </div>

      {result && (
        <Tabs defaultValue="starter" className="w-full">
          <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="starter">Starter</TabsTrigger>
            <TabsTrigger value="investeerder">Investeerder</TabsTrigger>
            <TabsTrigger value="keten">Keten</TabsTrigger>
            <TabsTrigger value="swot">SWOT</TabsTrigger>
            <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
          </TabsList>

          {(["starter", "investeerder", "keten"] as const).map((key) => (
            <TabsContent key={key} value={key}>
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 text-xs"
                      onClick={() =>
                        handleCopy(result.descriptions[key], key)
                      }
                    >
                      {copied === key ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      {copied === key ? "Gekopieerd!" : "Kopieer"}
                    </Button>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {result.descriptions[key]}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          ))}

          <TabsContent value="swot">
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  "strengths",
                  "weaknesses",
                  "opportunities",
                  "threats",
                ] as const
              ).map((key) => {
                const labels = {
                  strengths: "Sterktes",
                  weaknesses: "Zwaktes",
                  opportunities: "Kansen",
                  threats: "Bedreigingen",
                };
                return (
                  <Card key={key}>
                    <CardContent className="p-3">
                      <p className="text-xs font-semibold mb-2">
                        {labels[key]}
                      </p>
                      <ul className="space-y-1">
                        {result.swot[key].map((item, i) => (
                          <li
                            key={i}
                            className="text-xs text-muted-foreground flex gap-1.5"
                          >
                            <span className="shrink-0">-</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {(["linkedin", "instagram"] as const).map((key) => (
            <TabsContent key={key} value={key}>
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 text-xs"
                      onClick={() =>
                        handleCopy(
                          key === "linkedin"
                            ? result.linkedin
                            : result.instagram,
                          key
                        )
                      }
                    >
                      {copied === key ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      {copied === key ? "Gekopieerd!" : "Kopieer"}
                    </Button>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {key === "linkedin" ? result.linkedin : result.instagram}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
