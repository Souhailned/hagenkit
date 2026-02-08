import {
  Wine,
  Sun,
  Moon,
  Music,
  FileCheck,
  ChefHat,
  Wind,
  Snowflake,
  Package,
  ArrowDown,
  Umbrella,
  Beer,
  Bath,
  Thermometer,
  Flame,
  Wifi,
  Bell,
  Camera,
  CreditCard,
  Accessibility,
  Car,
  Train,
  Truck,
  Check,
  X,
  LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PropertyFeatureRecord, FeatureCategory } from "@/types/property";
import {
  FeatureCategoryLabels,
  getFeatureDefinition,
} from "@/types/property";

// Icon mapping for features
const featureIcons: Record<string, LucideIcon> = {
  Wine,
  Sun,
  Moon,
  Music,
  FileCheck,
  ChefHat,
  Wind,
  Snowflake,
  Package,
  ArrowDown,
  Umbrella,
  Beer,
  Bath,
  Thermometer,
  Flame,
  Wifi,
  Bell,
  Camera,
  CreditCard,
  Accessibility,
  Car,
  Train,
  Truck,
};

interface PropertyFeaturesProps {
  features: PropertyFeatureRecord[];
  className?: string;
}

export function PropertyFeatures({ features, className }: PropertyFeaturesProps) {
  // Group features by category
  const groupedFeatures = features.reduce((acc, feature) => {
    const category = feature.category as FeatureCategory;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(feature);
    return acc;
  }, {} as Record<FeatureCategory, PropertyFeatureRecord[]>);

  // Sort features within each category by displayOrder
  Object.keys(groupedFeatures).forEach((category) => {
    groupedFeatures[category as FeatureCategory].sort(
      (a, b) => a.displayOrder - b.displayOrder
    );
  });

  // Define category order
  const categoryOrder: FeatureCategory[] = [
    "LICENSE",
    "FACILITY",
    "UTILITY",
    "ACCESSIBILITY",
  ];

  const getIcon = (feature: PropertyFeatureRecord): LucideIcon => {
    const definition = getFeatureDefinition(feature.key);
    if (definition?.icon && featureIcons[definition.icon]) {
      return featureIcons[definition.icon];
    }
    return Check; // Default icon
  };

  const getDisplayValue = (feature: PropertyFeatureRecord): string => {
    if (feature.booleanValue === true) {
      return feature.value || "Ja";
    }
    if (feature.booleanValue === false) {
      return "Nee";
    }
    if (feature.numericValue !== null && feature.numericValue !== undefined) {
      return feature.value || `${feature.numericValue}`;
    }
    return feature.value || "-";
  };

  const getFeatureLabel = (feature: PropertyFeatureRecord): string => {
    const definition = getFeatureDefinition(feature.key);
    return definition?.label || feature.key.replace(/_/g, " ");
  };

  return (
    <div className={cn("space-y-6", className)}>
      {categoryOrder.map((category) => {
        const categoryFeatures = groupedFeatures[category];
        if (!categoryFeatures || categoryFeatures.length === 0) return null;

        return (
          <div key={category}>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {FeatureCategoryLabels[category]}
              <Badge variant="secondary" className="text-xs">
                {categoryFeatures.length}
              </Badge>
            </h3>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {categoryFeatures.map((feature) => {
                const Icon = getIcon(feature);
                const isPositive = feature.booleanValue !== false;

                return (
                  <div
                    key={feature.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                      feature.highlighted
                        ? "border-primary/30 bg-primary/5"
                        : "bg-card",
                      !isPositive && "opacity-60"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg",
                        isPositive
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isPositive ? (
                        <Icon className="h-5 w-5" />
                      ) : (
                        <X className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          !isPositive && "line-through"
                        )}
                      >
                        {getFeatureLabel(feature)}
                      </p>
                      {feature.value && feature.value !== "Ja" && (
                        <p className="text-xs text-muted-foreground truncate">
                          {getDisplayValue(feature)}
                        </p>
                      )}
                    </div>
                    {feature.verified && (
                      <Badge
                        variant="outline"
                        className="flex-shrink-0 border-emerald-200 bg-emerald-50 text-emerald-700 text-xs"
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Geverifieerd
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {Object.keys(groupedFeatures).length === 0 && (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-muted-foreground">
            Geen kenmerken beschikbaar voor dit pand.
          </p>
        </div>
      )}
    </div>
  );
}
