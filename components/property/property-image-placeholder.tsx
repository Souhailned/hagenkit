import { Building2 } from "lucide-react";

const typeGradients: Record<string, string> = {
  RESTAURANT: "from-orange-500/20 to-red-500/20",
  CAFE: "from-amber-500/20 to-yellow-500/20",
  BAR: "from-purple-500/20 to-indigo-500/20",
  HOTEL: "from-blue-500/20 to-cyan-500/20",
  EETCAFE: "from-green-500/20 to-emerald-500/20",
  LUNCHROOM: "from-lime-500/20 to-green-500/20",
  KOFFIEBAR: "from-amber-700/20 to-orange-500/20",
  PIZZERIA: "from-red-500/20 to-orange-500/20",
  NIGHTCLUB: "from-violet-500/20 to-purple-500/20",
  BAKERY: "from-yellow-500/20 to-amber-500/20",
};

const typeEmojis: Record<string, string> = {
  RESTAURANT: "🍽️",
  CAFE: "☕",
  BAR: "🍸",
  HOTEL: "🏨",
  EETCAFE: "🍺",
  LUNCHROOM: "🥪",
  KOFFIEBAR: "☕",
  PIZZERIA: "🍕",
  NIGHTCLUB: "🎶",
  BAKERY: "🥐",
  SNACKBAR: "🍟",
  SUSHI: "🍣",
  IJSSALON: "🍦",
  STRANDPAVILJOEN: "🏖️",
};

interface Props {
  propertyType: string;
  className?: string;
}

export function PropertyImagePlaceholder({ propertyType, className }: Props) {
  const gradient = typeGradients[propertyType] || "from-gray-500/20 to-gray-400/20";
  const emoji = typeEmojis[propertyType];

  return (
    <div className={`flex items-center justify-center bg-gradient-to-br ${gradient} ${className || ""}`}>
      {emoji ? (
        <span className="text-5xl opacity-60">{emoji}</span>
      ) : (
        <Building2 className="h-12 w-12 text-muted-foreground/30" />
      )}
    </div>
  );
}
