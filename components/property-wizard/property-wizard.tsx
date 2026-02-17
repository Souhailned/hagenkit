"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProperty } from "@/app/actions/create-property";
import type { PropertyType, PriceType } from "@/lib/validations/property";
import { DescriptionGenerator } from "@/components/ai/description-generator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  MapPin,
  Ruler,
  FileText,
  Check,
  Sparkles,
} from "lucide-react";

const propertyTypes = [
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "CAFE", label: "Café" },
  { value: "BAR", label: "Bar" },
  { value: "HOTEL", label: "Hotel" },
  { value: "EETCAFE", label: "Eetcafé" },
  { value: "GRAND_CAFE", label: "Grand Café" },
  { value: "LUNCHROOM", label: "Lunchroom" },
  { value: "KOFFIEBAR", label: "Koffiebar" },
  { value: "PIZZERIA", label: "Pizzeria" },
  { value: "BAKERY", label: "Bakkerij" },
  { value: "DARK_KITCHEN", label: "Dark Kitchen" },
  { value: "SNACKBAR", label: "Snackbar" },
  { value: "COCKTAILBAR", label: "Cocktailbar" },
  { value: "BED_AND_BREAKFAST", label: "Bed & Breakfast" },
  { value: "NIGHTCLUB", label: "Nachtclub" },
  { value: "OTHER", label: "Anders" },
];

const steps = [
  { label: "Basis", icon: Building2 },
  { label: "Locatie", icon: MapPin },
  { label: "Details", icon: Ruler },
  { label: "Beschrijving", icon: FileText },
];

export function PropertyWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Form data
  const [title, setTitle] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType | "">("");
  const [priceType, setPriceType] = useState<PriceType | "">("");
  const [rentPrice, setRentPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [province, setProvince] = useState("");
  const [surfaceTotal, setSurfaceTotal] = useState("");
  const [surfaceKitchen, setSurfaceKitchen] = useState("");
  const [surfaceTerrace, setSurfaceTerrace] = useState("");
  const [floors, setFloors] = useState("1");
  const [seatingInside, setSeatingInside] = useState("");
  const [seatingOutside, setSeatingOutside] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");

  function handleSubmit() {
    if (!propertyType || !priceType) return;
    startTransition(async () => {
      const result = await createProperty({
        title,
        propertyType,
        priceType,
        rentPrice: rentPrice ? parseFloat(rentPrice) : undefined,
        salePrice: salePrice ? parseFloat(salePrice) : undefined,
        address,
        city,
        postalCode,
        province,
        surfaceTotal: parseInt(surfaceTotal) || 0,
        surfaceKitchen: surfaceKitchen ? parseInt(surfaceKitchen) : undefined,
        surfaceTerrace: surfaceTerrace ? parseInt(surfaceTerrace) : undefined,
        floors: parseInt(floors) || 1,
        seatingCapacityInside: seatingInside ? parseInt(seatingInside) : undefined,
        seatingCapacityOutside: seatingOutside ? parseInt(seatingOutside) : undefined,
        description,
        shortDescription,
      });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Pand succesvol aangemaakt!");
      router.push("/dashboard/panden");
    });
  }

  const canProceed = () => {
    switch (step) {
      case 0: return title && propertyType && priceType;
      case 1: return address && city && postalCode;
      case 2: return surfaceTotal;
      case 3: return true;
      default: return true;
    }
  };

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Nieuw pand toevoegen</h1>
        <div className="flex items-center gap-2">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    i < step ? "border-primary bg-primary text-primary-foreground" :
                    i === step ? "border-primary text-primary" :
                    "border-muted text-muted-foreground"
                  )}
                >
                  {i < step ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={cn(
                  "hidden sm:block text-sm font-medium",
                  i <= step ? "text-foreground" : "text-muted-foreground"
                )}>
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 rounded",
                    i < step ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 0: Basis */}
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <Label htmlFor="title">Titel van het pand *</Label>
            <Input
              id="title"
              placeholder="Bijv. Gezellig café in het centrum"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Type pand *</Label>
            <Select value={propertyType} onValueChange={(v) => setPropertyType(v as PropertyType)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Selecteer type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Aanbieding type *</Label>
            <Select value={priceType} onValueChange={(v) => setPriceType(v as PriceType)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Te huur of te koop?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RENT">Te huur</SelectItem>
                <SelectItem value="SALE">Te koop</SelectItem>
                <SelectItem value="RENT_OR_SALE">Te huur of te koop</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(priceType === "RENT" || priceType === "RENT_OR_SALE") && (
            <div>
              <Label htmlFor="rent">Huurprijs per maand (€)</Label>
              <Input
                id="rent"
                type="number"
                placeholder="2500"
                value={rentPrice}
                onChange={(e) => setRentPrice(e.target.value)}
                className="mt-1.5"
              />
            </div>
          )}
          {(priceType === "SALE" || priceType === "RENT_OR_SALE") && (
            <div>
              <Label htmlFor="sale">Koopprijs (€)</Label>
              <Input
                id="sale"
                type="number"
                placeholder="250000"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="mt-1.5"
              />
            </div>
          )}
        </div>
      )}

      {/* Step 1: Locatie */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <Label htmlFor="address">Adres *</Label>
            <Input
              id="address"
              placeholder="Straatnaam + huisnummer"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postalCode">Postcode *</Label>
              <Input
                id="postalCode"
                placeholder="1234 AB"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="city">Stad *</Label>
              <Input
                id="city"
                placeholder="Amsterdam"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="province">Provincie</Label>
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Selecteer provincie" />
              </SelectTrigger>
              <SelectContent>
                {["Noord-Holland", "Zuid-Holland", "Utrecht", "Noord-Brabant",
                  "Gelderland", "Overijssel", "Limburg", "Friesland",
                  "Groningen", "Drenthe", "Flevoland", "Zeeland"].map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="surface">Totaal oppervlakte (m²) *</Label>
              <Input
                id="surface"
                type="number"
                placeholder="200"
                value={surfaceTotal}
                onChange={(e) => setSurfaceTotal(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="floors">Aantal verdiepingen</Label>
              <Input
                id="floors"
                type="number"
                placeholder="1"
                value={floors}
                onChange={(e) => setFloors(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kitchen">Keuken (m²)</Label>
              <Input
                id="kitchen"
                type="number"
                placeholder="30"
                value={surfaceKitchen}
                onChange={(e) => setSurfaceKitchen(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="terrace">Terras (m²)</Label>
              <Input
                id="terrace"
                type="number"
                placeholder="50"
                value={surfaceTerrace}
                onChange={(e) => setSurfaceTerrace(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="seatingIn">Zitplaatsen binnen</Label>
              <Input
                id="seatingIn"
                type="number"
                placeholder="60"
                value={seatingInside}
                onChange={(e) => setSeatingInside(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="seatingOut">Zitplaatsen buiten</Label>
              <Input
                id="seatingOut"
                type="number"
                placeholder="30"
                value={seatingOutside}
                onChange={(e) => setSeatingOutside(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Beschrijving */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <Label htmlFor="short">Korte beschrijving (voor previews)</Label>
            <Input
              id="short"
              placeholder="Max 200 tekens"
              maxLength={200}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="desc">Uitgebreide beschrijving</Label>
            <Textarea
              id="desc"
              rows={8}
              placeholder="Beschrijf het pand..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5"
            />
          </div>

          {/* AI Description Generator */}
          {propertyType && city && surfaceTotal && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <DescriptionGenerator
                propertyType={propertyType}
                city={city}
                surface={parseInt(surfaceTotal) || 0}
                onDescriptionGenerated={(desc) => setDescription(desc)}
              />
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={() => step > 0 ? setStep(step - 1) : router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {step === 0 ? "Annuleren" : "Vorige"}
        </Button>

        {step < steps.length - 1 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
          >
            Volgende <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? "Opslaan..." : "Pand opslaan"}
            <Check className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
