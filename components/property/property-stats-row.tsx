import { Eye, Heart, MessageCircle, Calendar } from "lucide-react";

interface PropertyStatsRowProps {
  viewCount: number;
  favoriteCount: number;
  inquiryCount: number;
  daysOnline?: number;
  className?: string;
}

export function PropertyStatsRow({
  viewCount, favoriteCount, inquiryCount, daysOnline, className,
}: PropertyStatsRowProps) {
  const stats = [
    { icon: Eye, value: viewCount, label: "views" },
    { icon: Heart, value: favoriteCount, label: "favorieten" },
    { icon: MessageCircle, value: inquiryCount, label: "aanvragen" },
    ...(daysOnline !== undefined ? [{ icon: Calendar, value: daysOnline, label: "dagen online" }] : []),
  ];

  return (
    <div className={`flex items-center gap-4 text-sm text-muted-foreground ${className || ""}`}>
      {stats.map(({ icon: Icon, value, label }) => (
        <span key={label} className="flex items-center gap-1.5" title={label}>
          <Icon className="h-3.5 w-3.5" />
          <span className="font-medium tabular-nums">{value}</span>
        </span>
      ))}
    </div>
  );
}
