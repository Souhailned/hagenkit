import { ProgressBar } from "@/components/ui/progress-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";

interface ListingCompletenessProps {
  property: {
    title: string;
    description: string | null;
    shortDescription: string | null;
    address: string;
    rentPrice: number | null;
    salePrice: number | null;
    buildYear: number | null;
  };
  imageCount: number;
}

export function ListingCompleteness({ property, imageCount }: ListingCompletenessProps) {
  const checks = [
    { label: "Titel", done: !!property.title },
    { label: "Beschrijving", done: !!property.description },
    { label: "Korte beschrijving", done: !!property.shortDescription },
    { label: "Adres", done: !!property.address },
    { label: "Prijs", done: !!(property.rentPrice || property.salePrice) },
    { label: "Bouwjaar", done: !!property.buildYear },
    { label: "Minimaal 3 foto's", done: imageCount >= 3 },
  ];

  const completed = checks.filter((c) => c.done).length;
  const percentage = Math.round((completed / checks.length) * 100);
  const color = percentage === 100 ? "green" : percentage >= 60 ? "amber" : "red";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Listing compleetheid</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ProgressBar value={percentage} color={color} />
        <p className="text-xs text-muted-foreground">{completed}/{checks.length} velden ingevuld</p>
        <div className="space-y-1.5">
          {checks.map((check) => (
            <div key={check.label} className="flex items-center gap-2 text-sm">
              {check.done ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/30 shrink-0" />
              )}
              <span className={check.done ? "text-muted-foreground" : "font-medium"}>{check.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
