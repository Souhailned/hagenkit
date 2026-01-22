"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PropertyWizardData,
  PROPERTY_TYPE_LABELS,
  PRICE_TYPE_LABELS,
  FEATURE_DEFINITIONS,
  CATEGORY_LABELS,
  FeatureCategory,
} from "../types";
import {
  IconEdit,
  IconCheck,
  IconMapPin,
  IconCurrencyEuro,
  IconRuler2,
  IconLicense,
  IconPhoto,
  IconAlertTriangle,
} from "@tabler/icons-react";

interface StepReviewProps {
  data: PropertyWizardData;
  onUpdate: (data: Partial<PropertyWizardData>) => void;
  onGoToStep: (step: number) => void;
}

interface ReviewSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  onEdit: () => void;
  isValid: boolean;
  children: React.ReactNode;
}

function ReviewSection({
  title,
  icon: Icon,
  onEdit,
  isValid,
  children,
}: ReviewSectionProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("size-4", isValid ? "text-primary" : "text-muted-foreground")} />
          <h4 className="text-sm font-medium">{title}</h4>
          {isValid ? (
            <IconCheck className="size-4 text-green-500" />
          ) : (
            <IconAlertTriangle className="size-4 text-amber-500" />
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-7 gap-1 px-2 text-xs"
        >
          <IconEdit className="size-3" />
          Bewerken
        </Button>
      </div>
      <div className="p-4 text-sm">{children}</div>
    </div>
  );
}

// Format price with thousands separator
const formatPrice = (value: number | undefined): string => {
  if (value === undefined) return "-";
  return "€" + value.toLocaleString("nl-NL");
};

export function StepReview({ data, onGoToStep }: StepReviewProps) {
  // Validation checks
  const isBasicValid = Boolean(data.title && data.propertyType);
  const isLocationValid = Boolean(data.address && data.city && data.postalCode);
  const isPricingValid = Boolean(
    data.priceType &&
    ((data.priceType === "RENT" && data.rentPrice) ||
      (data.priceType === "SALE" && data.salePrice) ||
      (data.priceType === "RENT_OR_SALE" && (data.rentPrice || data.salePrice)))
  );
  const isDimensionsValid = Boolean(data.surfaceTotal && data.surfaceTotal > 0);
  const isFeaturesValid = true; // Features are optional
  const isPhotosValid = data.photos.length > 0;

  const isAllValid =
    isBasicValid && isLocationValid && isPricingValid && isDimensionsValid && isPhotosValid;

  // Get selected features grouped by category
  const selectedFeatures = FEATURE_DEFINITIONS.filter((f) => data.features[f.key]);
  const featuresByCategory = selectedFeatures.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<FeatureCategory, typeof selectedFeatures>);

  const aiEnhanceCount = data.photos.filter((p) => p.aiEnhance).length;

  return (
    <div className="space-y-4">
      {/* Status banner */}
      {!isAllValid && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <IconAlertTriangle className="size-5 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
              Nog niet klaar om te publiceren
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Vul alle verplichte velden in om het pand te kunnen publiceren
            </p>
          </div>
        </div>
      )}

      {isAllValid && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
          <IconCheck className="size-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-900 dark:text-green-200">
              Klaar om te publiceren
            </p>
            <p className="text-xs text-green-700 dark:text-green-400">
              Alle verplichte velden zijn ingevuld. Je kunt nu publiceren of als concept bewaren.
            </p>
          </div>
        </div>
      )}

      {/* Review sections */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Basic Info */}
        <ReviewSection
          title="Basisinformatie"
          icon={IconCheck}
                    onEdit={() => onGoToStep(1)}
          isValid={isBasicValid}
        >
          {isBasicValid ? (
            <div className="space-y-2">
              <p className="font-medium">{data.title}</p>
              <Badge variant="secondary">
                {data.propertyType ? PROPERTY_TYPE_LABELS[data.propertyType] : "-"}
              </Badge>
              {data.description && (
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  {data.description}
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Vul titel en type in</p>
          )}
        </ReviewSection>

        {/* Location */}
        <ReviewSection
          title="Locatie"
          icon={IconMapPin}
                    onEdit={() => onGoToStep(2)}
          isValid={isLocationValid}
        >
          {isLocationValid ? (
            <div className="space-y-1">
              <p>{data.address}</p>
              <p>
                {data.postalCode} {data.city}
              </p>
              {(data.latitude || data.longitude) && (
                <p className="text-xs text-muted-foreground">
                  GPS: {data.latitude}, {data.longitude}
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Vul het adres in</p>
          )}
        </ReviewSection>

        {/* Pricing */}
        <ReviewSection
          title="Prijsinformatie"
          icon={IconCurrencyEuro}
                    onEdit={() => onGoToStep(3)}
          isValid={isPricingValid}
        >
          {isPricingValid && data.priceType ? (
            <div className="space-y-2">
              <Badge variant="outline">{PRICE_TYPE_LABELS[data.priceType]}</Badge>
              <div className="space-y-1">
                {data.rentPrice && (
                  <p>
                    Huur: <span className="font-medium">{formatPrice(data.rentPrice)}/maand</span>
                    {data.servicesCosts && (
                      <span className="text-muted-foreground">
                        {" "}
                        + {formatPrice(data.servicesCosts)} servicekosten
                      </span>
                    )}
                  </p>
                )}
                {data.salePrice && (
                  <p>
                    Koop: <span className="font-medium">{formatPrice(data.salePrice)}</span>
                  </p>
                )}
                {data.depositMonths && (
                  <p className="text-xs text-muted-foreground">
                    Borg: {data.depositMonths} maanden
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Selecteer prijstype en vul bedragen in</p>
          )}
        </ReviewSection>

        {/* Dimensions */}
        <ReviewSection
          title="Afmetingen"
          icon={IconRuler2}
                    onEdit={() => onGoToStep(4)}
          isValid={isDimensionsValid}
        >
          {isDimensionsValid ? (
            <div className="space-y-1">
              <p>
                Totaal: <span className="font-medium">{data.surfaceTotal} m²</span>
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {data.surfaceCommercial && <span>Zaal: {data.surfaceCommercial} m²</span>}
                {data.surfaceKitchen && <span>Keuken: {data.surfaceKitchen} m²</span>}
                {data.surfaceStorage && <span>Opslag: {data.surfaceStorage} m²</span>}
                {data.surfaceTerrace && <span>Terras: {data.surfaceTerrace} m²</span>}
              </div>
              <p className="text-xs text-muted-foreground">
                {data.floors} verdieping{data.floors !== 1 ? "en" : ""}
                {data.ceilingHeight && ` • ${data.ceilingHeight}m plafond`}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">Vul de totale oppervlakte in</p>
          )}
        </ReviewSection>

        {/* Features */}
        <ReviewSection
          title="Kenmerken"
          icon={IconLicense}
                    onEdit={() => onGoToStep(5)}
          isValid={isFeaturesValid}
        >
          {selectedFeatures.length > 0 ? (
            <div className="space-y-2">
              {(Object.keys(featuresByCategory) as FeatureCategory[]).map((category) => (
                <div key={category}>
                  <p className="text-xs font-medium text-muted-foreground">
                    {CATEGORY_LABELS[category]}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {featuresByCategory[category].map((feature) => (
                      <Badge key={feature.key} variant="secondary" className="text-xs">
                        {feature.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Geen kenmerken geselecteerd</p>
          )}
        </ReviewSection>

        {/* Photos */}
        <ReviewSection
          title="Foto's"
          icon={IconPhoto}
                    onEdit={() => onGoToStep(6)}
          isValid={isPhotosValid}
        >
          {isPhotosValid ? (
            <div className="space-y-2">
              <p>
                {data.photos.length} foto{data.photos.length !== 1 ? "'s" : ""} toegevoegd
                {aiEnhanceCount > 0 && (
                  <span className="text-primary"> ({aiEnhanceCount} met AI verbetering)</span>
                )}
              </p>
              <div className="flex gap-1 overflow-hidden">
                {data.photos.slice(0, 4).map((photo, i) => (
                  <div
                    key={photo.id}
                    className={cn(
                      "relative size-12 overflow-hidden rounded",
                      photo.isPrimary && "ring-2 ring-primary"
                    )}
                  >
                    <img
                      src={photo.previewUrl}
                      alt={`Preview ${i + 1}`}
                      className="size-full object-cover"
                    />
                  </div>
                ))}
                {data.photos.length > 4 && (
                  <div className="flex size-12 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                    +{data.photos.length - 4}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Voeg minimaal 1 foto toe</p>
          )}
        </ReviewSection>
      </div>
    </div>
  );
}
