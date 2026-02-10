import { Badge } from "@/components/ui/badge";
import { 
  Flame, Star, Clock, TrendingUp, Eye, Sparkles,
} from "lucide-react";

interface PropertyHighlightsProps {
  viewCount: number;
  daysOnline: number;
  isFeatured?: boolean;
  isNew?: boolean;
  className?: string;
}

export function PropertyHighlights({ viewCount, daysOnline, isFeatured, isNew, className }: PropertyHighlightsProps) {
  const highlights: { icon: typeof Star; label: string; variant: string }[] = [];

  if (isNew || daysOnline <= 3) {
    highlights.push({ icon: Sparkles, label: "Nieuw", variant: "bg-green-100 text-green-700" });
  }
  if (isFeatured) {
    highlights.push({ icon: Star, label: "Uitgelicht", variant: "bg-amber-100 text-amber-700" });
  }
  if (viewCount > 100) {
    highlights.push({ icon: Flame, label: "Populair", variant: "bg-red-100 text-red-700" });
  }
  if (viewCount > 50 && viewCount <= 100) {
    highlights.push({ icon: TrendingUp, label: "Trending", variant: "bg-blue-100 text-blue-700" });
  }

  if (highlights.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className || ""}`}>
      {highlights.map((h) => {
        const Icon = h.icon;
        return (
          <Badge key={h.label} variant="outline" className={`border-0 text-xs ${h.variant}`}>
            <Icon className="mr-1 h-3 w-3" />
            {h.label}
          </Badge>
        );
      })}
    </div>
  );
}
