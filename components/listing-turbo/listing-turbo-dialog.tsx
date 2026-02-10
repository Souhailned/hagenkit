"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { generateListingTurbo, type ListingTurboInput, type ListingTurboOutput } from "@/app/actions/listing-turbo";
import { Zap, Copy, Check, FileText, Instagram, Linkedin, Facebook, Sparkles } from "lucide-react";

interface ListingTurboDialogProps {
  input: ListingTurboInput;
  onApplyDescription?: (description: string) => void;
  onApplyShortDescription?: (shortDescription: string) => void;
}

export function ListingTurboDialog({ input, onApplyDescription, onApplyShortDescription }: ListingTurboDialogProps) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ListingTurboOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleGenerate = () => {
    startTransition(async () => {
      const res = await generateListingTurbo(input);
      if (res.success) {
        setResult(res.data);
      } else {
        toast.error(res.error);
      }
    });
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Gekopieerd!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyBtn = ({ text, field }: { text: string; field: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 text-xs"
      onClick={() => copyToClipboard(text, field)}
    >
      {copiedField === field ? (
        <Check className="h-3 w-3 mr-1 text-green-500" />
      ) : (
        <Copy className="h-3 w-3 mr-1" />
      )}
      Kopieer
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          Listing Turbo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Listing Turbo
          </DialogTitle>
          <DialogDescription>
            Genereer automatisch alle teksten voor je listing: beschrijving, highlights en social media posts.
          </DialogDescription>
        </DialogHeader>

        {!result && !isPending && (
          <div className="flex flex-col items-center py-8 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
              <Sparkles className="h-8 w-8 text-amber-500" />
            </div>
            <p className="text-center text-sm text-muted-foreground max-w-sm">
              Klik op de knop om professionele teksten te genereren voor je listing.
              Inclusief beschrijving, highlights en social media posts.
            </p>
            <Button onClick={handleGenerate} className="gap-2">
              <Zap className="h-4 w-4" />
              Genereer teksten
            </Button>
          </div>
        )}

        {isPending && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Teksten worden gegenereerd...
            </div>
            <Skeleton className="h-32" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        )}

        {result && (
          <Tabs defaultValue="beschrijving" className="mt-2">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="beschrijving" className="text-xs">
                <FileText className="h-3 w-3 mr-1" /> Teksten
              </TabsTrigger>
              <TabsTrigger value="instagram" className="text-xs">
                <Instagram className="h-3 w-3 mr-1" /> Instagram
              </TabsTrigger>
              <TabsTrigger value="linkedin" className="text-xs">
                <Linkedin className="h-3 w-3 mr-1" /> LinkedIn
              </TabsTrigger>
              <TabsTrigger value="facebook" className="text-xs">
                <Facebook className="h-3 w-3 mr-1" /> Facebook
              </TabsTrigger>
            </TabsList>

            <TabsContent value="beschrijving" className="space-y-4 mt-4">
              {/* Short description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Korte beschrijving</h4>
                  <div className="flex gap-1">
                    <CopyBtn text={result.shortDescription} field="short" />
                    {onApplyShortDescription && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          onApplyShortDescription(result.shortDescription);
                          toast.success("Toegepast!");
                        }}
                      >
                        Toepassen
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm bg-muted/50 rounded-lg p-3">{result.shortDescription}</p>
              </div>

              {/* Full description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Volledige beschrijving</h4>
                  <div className="flex gap-1">
                    <CopyBtn text={result.description} field="description" />
                    {onApplyDescription && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          onApplyDescription(result.description);
                          toast.success("Toegepast!");
                        }}
                      >
                        Toepassen
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm bg-muted/50 rounded-lg p-3 whitespace-pre-line">{result.description}</p>
              </div>

              {/* Highlights */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Highlights</h4>
                  <CopyBtn text={result.highlights.join("\n")} field="highlights" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.highlights.map((h, i) => (
                    <Badge key={i} variant="secondary">{h}</Badge>
                  ))}
                </div>
              </div>

              {/* SEO */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">SEO</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Title:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs">{result.seoTitle}</span>
                      <CopyBtn text={result.seoTitle} field="seo-title" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Description:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs truncate max-w-xs">{result.seoDescription}</span>
                      <CopyBtn text={result.seoDescription} field="seo-desc" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="instagram" className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Instagram Caption</h4>
                <CopyBtn text={result.socialMedia.instagram} field="instagram" />
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-line">
                {result.socialMedia.instagram}
              </div>
            </TabsContent>

            <TabsContent value="linkedin" className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">LinkedIn Post</h4>
                <CopyBtn text={result.socialMedia.linkedin} field="linkedin" />
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-line">
                {result.socialMedia.linkedin}
              </div>
            </TabsContent>

            <TabsContent value="facebook" className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Facebook Post</h4>
                <CopyBtn text={result.socialMedia.facebook} field="facebook" />
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-line">
                {result.socialMedia.facebook}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
