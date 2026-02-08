"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Save, ChevronDown, ChevronUp } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { updateProperty } from "@/app/actions/property";
import type { Property } from "@/lib/validations/property";
import {
  propertyTypeLabels,
  priceTypeLabels,
  PropertyType,
  PriceType,
} from "@/lib/validations/property";

interface PropertyAlgemeenTabProps {
  property: Property;
}

// Form schema
const algemeenFormSchema = z.object({
  // Basic Info
  title: z.string().min(5, "Titel moet minimaal 5 karakters zijn").max(200),
  shortDescription: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  propertyType: z.string(),

  // Location
  address: z.string().min(1, "Adres is verplicht"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "Stad is verplicht"),
  postalCode: z.string().min(1, "Postcode is verplicht"),
  province: z.string().optional(),
  neighborhood: z.string().optional(),

  // Pricing
  priceType: z.string(),
  rentPrice: z.coerce.number().optional(),
  salePrice: z.coerce.number().optional(),
  servicesCosts: z.coerce.number().optional(),
  depositMonths: z.coerce.number().optional(),
  priceNegotiable: z.boolean().default(true),

  // Dimensions
  surfaceTotal: z.coerce.number().positive("Totale oppervlakte is verplicht"),
  surfaceCommercial: z.coerce.number().optional(),
  surfaceKitchen: z.coerce.number().optional(),
  surfaceStorage: z.coerce.number().optional(),
  surfaceTerrace: z.coerce.number().optional(),
  surfaceBasement: z.coerce.number().optional(),
  floors: z.coerce.number().positive().default(1),
  ceilingHeight: z.coerce.number().optional(),

  // Horeca Details
  seatingCapacityInside: z.coerce.number().optional(),
  seatingCapacityOutside: z.coerce.number().optional(),
  standingCapacity: z.coerce.number().optional(),
  kitchenType: z.string().optional(),
  hasBasement: z.boolean().default(false),
  hasStorage: z.boolean().default(false),
  hasTerrace: z.boolean().default(false),
  hasParking: z.boolean().default(false),
  parkingSpaces: z.coerce.number().optional(),

  // Building
  buildYear: z.coerce.number().optional(),
  lastRenovation: z.coerce.number().optional(),
  monumentStatus: z.boolean().optional(),
  energyLabel: z.string().optional(),
});

type AlgemeenFormValues = z.infer<typeof algemeenFormSchema>;

// Convert cents to euros for display
function centsToEuros(cents: number | undefined): number | undefined {
  return cents ? cents / 100 : undefined;
}

// Convert euros to cents for storage
function eurosToCents(euros: number | undefined): number | undefined {
  return euros ? Math.round(euros * 100) : undefined;
}

export function PropertyAlgemeenTab({ property }: PropertyAlgemeenTabProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basis: true,
    locatie: true,
    prijzen: true,
    afmetingen: false,
    horeca: false,
    gebouw: false,
  });

  const form = useForm<AlgemeenFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(algemeenFormSchema) as any,
    defaultValues: {
      // Basic Info
      title: property.title,
      shortDescription: property.shortDescription || "",
      description: property.description || "",
      propertyType: property.propertyType,

      // Location
      address: property.address,
      addressLine2: property.addressLine2 || "",
      city: property.city,
      postalCode: property.postalCode,
      province: property.province || "",
      neighborhood: property.neighborhood || "",

      // Pricing (convert cents to euros for display)
      priceType: property.priceType,
      rentPrice: centsToEuros(property.rentPrice),
      salePrice: centsToEuros(property.salePrice),
      servicesCosts: centsToEuros(property.servicesCosts),
      depositMonths: property.depositMonths,
      priceNegotiable: property.priceNegotiable,

      // Dimensions
      surfaceTotal: property.surfaceTotal,
      surfaceCommercial: property.surfaceCommercial,
      surfaceKitchen: property.surfaceKitchen,
      surfaceStorage: property.surfaceStorage,
      surfaceTerrace: property.surfaceTerrace,
      surfaceBasement: property.surfaceBasement,
      floors: property.floors,
      ceilingHeight: property.ceilingHeight,

      // Horeca Details
      seatingCapacityInside: property.seatingCapacityInside,
      seatingCapacityOutside: property.seatingCapacityOutside,
      standingCapacity: property.standingCapacity,
      kitchenType: property.kitchenType || "",
      hasBasement: property.hasBasement,
      hasStorage: property.hasStorage,
      hasTerrace: property.hasTerrace,
      hasParking: property.hasParking,
      parkingSpaces: property.parkingSpaces,

      // Building
      buildYear: property.buildYear,
      lastRenovation: property.lastRenovation,
      monumentStatus: property.monumentStatus,
      energyLabel: property.energyLabel || "",
    },
  });

  const watchPriceType = form.watch("priceType");
  const watchHasParking = form.watch("hasParking");

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const onSubmit = (data: AlgemeenFormValues) => {
    startTransition(async () => {
      // Convert euros back to cents for storage
      const result = await updateProperty({
        id: property.id,
        ...data,
        propertyType: data.propertyType as PropertyType,
        priceType: data.priceType as PriceType,
        rentPrice: eurosToCents(data.rentPrice),
        salePrice: eurosToCents(data.salePrice),
        servicesCosts: eurosToCents(data.servicesCosts),
      });

      if (result.success) {
        toast.success("Pand bijgewerkt");
        router.refresh();
      } else {
        toast.error(result.error || "Bijwerken mislukt");
      }
    });
  };

  const SectionHeader = ({
    section,
    title,
    children,
  }: {
    section: string;
    title: string;
    children: React.ReactNode;
  }) => (
    <Collapsible open={openSections[section]} onOpenChange={() => toggleSection(section)}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{title}</CardTitle>
              {openSections[section] ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Basis Info Section */}
      <SectionHeader section="basis" title="Basis Informatie">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="title">Titel *</FieldLabel>
            <Input
              id="title"
              placeholder="Bijv. Karakteristiek Grand Café in Amsterdam"
              {...form.register("title")}
            />
            <FieldDescription>
              Een pakkende titel die de essentie van het pand beschrijft
            </FieldDescription>
            <FieldError errors={[form.formState.errors.title]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="propertyType">Type pand *</FieldLabel>
            <Select
              value={form.watch("propertyType")}
              onValueChange={(value) => form.setValue("propertyType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecteer type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(propertyTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.propertyType]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="shortDescription">Korte beschrijving</FieldLabel>
            <Input
              id="shortDescription"
              placeholder="Max. 200 karakters"
              maxLength={200}
              {...form.register("shortDescription")}
            />
            <FieldDescription>
              Wordt getoond in zoekresultaten ({form.watch("shortDescription")?.length || 0}/200)
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="description">Uitgebreide beschrijving</FieldLabel>
            <Textarea
              id="description"
              placeholder="Beschrijf het pand, de mogelijkheden en bijzonderheden..."
              rows={8}
              {...form.register("description")}
            />
            <FieldDescription>
              Geef potentiële huurders/kopers een compleet beeld van het pand
            </FieldDescription>
          </Field>
        </FieldGroup>
      </SectionHeader>

      {/* Locatie Section */}
      <SectionHeader section="locatie" title="Locatie">
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="address">Adres *</FieldLabel>
              <Input
                id="address"
                placeholder="Straatnaam en huisnummer"
                {...form.register("address")}
              />
              <FieldError errors={[form.formState.errors.address]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="addressLine2">Toevoeging</FieldLabel>
              <Input
                id="addressLine2"
                placeholder="Bijv. 2e verdieping"
                {...form.register("addressLine2")}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="postalCode">Postcode *</FieldLabel>
              <Input
                id="postalCode"
                placeholder="1234 AB"
                {...form.register("postalCode")}
              />
              <FieldError errors={[form.formState.errors.postalCode]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="city">Stad *</FieldLabel>
              <Input
                id="city"
                placeholder="Stad"
                {...form.register("city")}
              />
              <FieldError errors={[form.formState.errors.city]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="province">Provincie</FieldLabel>
              <Input
                id="province"
                placeholder="Provincie"
                {...form.register("province")}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="neighborhood">Buurt/wijk</FieldLabel>
            <Input
              id="neighborhood"
              placeholder="Bijv. Jordaan, De Pijp"
              {...form.register("neighborhood")}
            />
          </Field>
        </FieldGroup>
      </SectionHeader>

      {/* Prijzen Section */}
      <SectionHeader section="prijzen" title="Prijzen">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="priceType">Prijstype *</FieldLabel>
            <Select
              value={form.watch("priceType")}
              onValueChange={(value) => form.setValue("priceType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecteer prijstype" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(priceTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            {(watchPriceType === "RENT" || watchPriceType === "RENT_OR_SALE") && (
              <Field>
                <FieldLabel htmlFor="rentPrice">Huurprijs (€/maand)</FieldLabel>
                <Input
                  id="rentPrice"
                  type="number"
                  placeholder="0"
                  {...form.register("rentPrice")}
                />
              </Field>
            )}

            {(watchPriceType === "SALE" || watchPriceType === "RENT_OR_SALE") && (
              <Field>
                <FieldLabel htmlFor="salePrice">Verkoopprijs (€)</FieldLabel>
                <Input
                  id="salePrice"
                  type="number"
                  placeholder="0"
                  {...form.register("salePrice")}
                />
              </Field>
            )}
          </div>

          {(watchPriceType === "RENT" || watchPriceType === "RENT_OR_SALE") && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="servicesCosts">Servicekosten (€/maand)</FieldLabel>
                <Input
                  id="servicesCosts"
                  type="number"
                  placeholder="0"
                  {...form.register("servicesCosts")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="depositMonths">Borg (maanden huur)</FieldLabel>
                <Input
                  id="depositMonths"
                  type="number"
                  placeholder="0"
                  {...form.register("depositMonths")}
                />
              </Field>
            </div>
          )}

          <Field orientation="horizontal">
            <div className="flex items-center gap-2">
              <Checkbox
                id="priceNegotiable"
                checked={form.watch("priceNegotiable")}
                onCheckedChange={(checked) =>
                  form.setValue("priceNegotiable", checked === true)
                }
              />
              <FieldLabel htmlFor="priceNegotiable" className="cursor-pointer">
                Prijs onderhandelbaar
              </FieldLabel>
            </div>
          </Field>
        </FieldGroup>
      </SectionHeader>

      {/* Afmetingen Section */}
      <SectionHeader section="afmetingen" title="Afmetingen">
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="surfaceTotal">Totaal oppervlak (m²) *</FieldLabel>
              <Input
                id="surfaceTotal"
                type="number"
                placeholder="0"
                {...form.register("surfaceTotal")}
              />
              <FieldError errors={[form.formState.errors.surfaceTotal]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="surfaceCommercial">Commercieel (m²)</FieldLabel>
              <Input
                id="surfaceCommercial"
                type="number"
                placeholder="0"
                {...form.register("surfaceCommercial")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="surfaceKitchen">Keuken (m²)</FieldLabel>
              <Input
                id="surfaceKitchen"
                type="number"
                placeholder="0"
                {...form.register("surfaceKitchen")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="surfaceStorage">Opslag (m²)</FieldLabel>
              <Input
                id="surfaceStorage"
                type="number"
                placeholder="0"
                {...form.register("surfaceStorage")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="surfaceTerrace">Terras (m²)</FieldLabel>
              <Input
                id="surfaceTerrace"
                type="number"
                placeholder="0"
                {...form.register("surfaceTerrace")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="surfaceBasement">Kelder (m²)</FieldLabel>
              <Input
                id="surfaceBasement"
                type="number"
                placeholder="0"
                {...form.register("surfaceBasement")}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="floors">Aantal verdiepingen</FieldLabel>
              <Input
                id="floors"
                type="number"
                min="1"
                placeholder="1"
                {...form.register("floors")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="ceilingHeight">Plafondhoogte (m)</FieldLabel>
              <Input
                id="ceilingHeight"
                type="number"
                step="0.1"
                placeholder="2.8"
                {...form.register("ceilingHeight")}
              />
            </Field>
          </div>
        </FieldGroup>
      </SectionHeader>

      {/* Horeca Details Section */}
      <SectionHeader section="horeca" title="Horeca Details">
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="seatingCapacityInside">Zitplaatsen binnen</FieldLabel>
              <Input
                id="seatingCapacityInside"
                type="number"
                placeholder="0"
                {...form.register("seatingCapacityInside")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="seatingCapacityOutside">Zitplaatsen buiten</FieldLabel>
              <Input
                id="seatingCapacityOutside"
                type="number"
                placeholder="0"
                {...form.register("seatingCapacityOutside")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="standingCapacity">Staplaatsen</FieldLabel>
              <Input
                id="standingCapacity"
                type="number"
                placeholder="0"
                {...form.register("standingCapacity")}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="kitchenType">Type keuken</FieldLabel>
            <Input
              id="kitchenType"
              placeholder="Bijv. Professioneel, gas, inductie"
              {...form.register("kitchenType")}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field orientation="horizontal">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hasTerrace"
                  checked={form.watch("hasTerrace")}
                  onCheckedChange={(checked) =>
                    form.setValue("hasTerrace", checked === true)
                  }
                />
                <FieldLabel htmlFor="hasTerrace" className="cursor-pointer">
                  Terras
                </FieldLabel>
              </div>
            </Field>

            <Field orientation="horizontal">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hasStorage"
                  checked={form.watch("hasStorage")}
                  onCheckedChange={(checked) =>
                    form.setValue("hasStorage", checked === true)
                  }
                />
                <FieldLabel htmlFor="hasStorage" className="cursor-pointer">
                  Opslag
                </FieldLabel>
              </div>
            </Field>

            <Field orientation="horizontal">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hasBasement"
                  checked={form.watch("hasBasement")}
                  onCheckedChange={(checked) =>
                    form.setValue("hasBasement", checked === true)
                  }
                />
                <FieldLabel htmlFor="hasBasement" className="cursor-pointer">
                  Kelder
                </FieldLabel>
              </div>
            </Field>

            <Field orientation="horizontal">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hasParking"
                  checked={form.watch("hasParking")}
                  onCheckedChange={(checked) =>
                    form.setValue("hasParking", checked === true)
                  }
                />
                <FieldLabel htmlFor="hasParking" className="cursor-pointer">
                  Parkeren
                </FieldLabel>
              </div>
            </Field>
          </div>

          {watchHasParking && (
            <Field>
              <FieldLabel htmlFor="parkingSpaces">Aantal parkeerplaatsen</FieldLabel>
              <Input
                id="parkingSpaces"
                type="number"
                placeholder="0"
                {...form.register("parkingSpaces")}
              />
            </Field>
          )}
        </FieldGroup>
      </SectionHeader>

      {/* Gebouw Section */}
      <SectionHeader section="gebouw" title="Gebouw Informatie">
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field>
              <FieldLabel htmlFor="buildYear">Bouwjaar</FieldLabel>
              <Input
                id="buildYear"
                type="number"
                placeholder="Bijv. 1920"
                {...form.register("buildYear")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="lastRenovation">Laatste renovatie</FieldLabel>
              <Input
                id="lastRenovation"
                type="number"
                placeholder="Bijv. 2020"
                {...form.register("lastRenovation")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="energyLabel">Energielabel</FieldLabel>
              <Select
                value={form.watch("energyLabel") || ""}
                onValueChange={(value) => form.setValue("energyLabel", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer" />
                </SelectTrigger>
                <SelectContent>
                  {["A+++", "A++", "A+", "A", "B", "C", "D", "E", "F", "G"].map((label) => (
                    <SelectItem key={label} value={label}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field orientation="horizontal">
            <div className="flex items-center gap-2">
              <Checkbox
                id="monumentStatus"
                checked={form.watch("monumentStatus") === true}
                onCheckedChange={(checked) =>
                  form.setValue("monumentStatus", checked === true)
                }
              />
              <FieldLabel htmlFor="monumentStatus" className="cursor-pointer">
                Rijksmonument / Gemeentelijk monument
              </FieldLabel>
            </div>
          </Field>
        </FieldGroup>
      </SectionHeader>

      {/* Save Button */}
      <div className="sticky bottom-4 flex justify-end rounded-lg border bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Wijzigingen opslaan
        </Button>
      </div>
    </form>
  );
}
