"use client";

import { useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type AgencyInfoData,
  type StepProps,
  isValidKvkNumber,
  isValidPostalCode,
  isValidEmail,
  isValidPhone,
  isValidUrl,
} from "./types";
import {
  IconBuilding,
  IconId,
  IconPhone,
  IconMail,
  IconWorld,
  IconMapPin,
} from "@tabler/icons-react";

interface ValidationState {
  kvkNumber: boolean;
  email: boolean;
  phone: boolean;
  website: boolean;
  postalCode: boolean;
}

export function StepAgencyInfo({
  data,
  onUpdate,
}: StepProps<AgencyInfoData>) {
  // Memoize validation state to prevent unnecessary recalculations
  const validation = useMemo<ValidationState>(() => ({
    kvkNumber: !data.kvkNumber || isValidKvkNumber(data.kvkNumber),
    email: !data.email || isValidEmail(data.email),
    phone: !data.phone || isValidPhone(data.phone),
    website: isValidUrl(data.website),
    postalCode: !data.postalCode || isValidPostalCode(data.postalCode),
  }), [data.kvkNumber, data.email, data.phone, data.website, data.postalCode]);

  // Stable handlers using useCallback
  const handleChange = useCallback(
    (field: keyof AgencyInfoData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ [field]: e.target.value });
    },
    [onUpdate]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <IconBuilding className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">
          Kantoorgegevens
        </h2>
        <p className="text-sm text-muted-foreground">
          Vul de gegevens van je makelaarskantoor in
        </p>
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        {/* Kantoor naam */}
        <div className="space-y-2">
          <Label htmlFor="agency-name" className="flex items-center gap-2">
            <IconBuilding className="w-4 h-4 text-muted-foreground" />
            Kantoornaam *
          </Label>
          <Input
            id="agency-name"
            placeholder="Bijv. Van der Berg Makelaardij"
            value={data.name}
            onChange={handleChange("name")}
            className="h-11"
          />
        </div>

        {/* KvK nummer */}
        <div className="space-y-2">
          <Label htmlFor="kvk-number" className="flex items-center gap-2">
            <IconId className="w-4 h-4 text-muted-foreground" />
            KvK-nummer
          </Label>
          <Input
            id="kvk-number"
            placeholder="12345678"
            value={data.kvkNumber}
            onChange={handleChange("kvkNumber")}
            maxLength={8}
            className={`h-11 ${!validation.kvkNumber ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
            aria-invalid={!validation.kvkNumber}
          />
          <p className="text-xs text-muted-foreground">
            8 cijfers, te vinden op{" "}
            <a
              href="https://www.kvk.nl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              kvk.nl
            </a>
          </p>
          {!validation.kvkNumber && (
            <p className="text-xs text-destructive">
              Voer een geldig KvK-nummer in (8 cijfers)
            </p>
          )}
        </div>

        {/* Contact row: Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <IconPhone className="w-4 h-4 text-muted-foreground" />
              Telefoon *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="020 123 4567"
              value={data.phone}
              onChange={handleChange("phone")}
              className={`h-11 ${!validation.phone ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
              aria-invalid={!validation.phone}
            />
            {!validation.phone && (
              <p className="text-xs text-destructive">
                Voer een geldig telefoonnummer in
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <IconMail className="w-4 h-4 text-muted-foreground" />
              E-mailadres *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="info@kantoor.nl"
              value={data.email}
              onChange={handleChange("email")}
              className={`h-11 ${!validation.email ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
              aria-invalid={!validation.email}
            />
            {!validation.email && (
              <p className="text-xs text-destructive">
                Voer een geldig e-mailadres in
              </p>
            )}
          </div>
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website" className="flex items-center gap-2">
            <IconWorld className="w-4 h-4 text-muted-foreground" />
            Website
          </Label>
          <Input
            id="website"
            type="url"
            placeholder="https://www.uwkantoor.nl"
            value={data.website}
            onChange={handleChange("website")}
            className={`h-11 ${!validation.website ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
            aria-invalid={!validation.website}
          />
          {!validation.website && (
            <p className="text-xs text-destructive">
              Voer een geldige URL in
            </p>
          )}
        </div>

        {/* Adres sectie */}
        <div className="pt-2">
          <Label className="flex items-center gap-2 mb-3">
            <IconMapPin className="w-4 h-4 text-muted-foreground" />
            Kantooradres
          </Label>

          <div className="space-y-3">
            <Input
              id="address"
              placeholder="Straatnaam en huisnummer"
              value={data.address}
              onChange={handleChange("address")}
              className="h-11"
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                id="postal-code"
                placeholder="1234 AB"
                value={data.postalCode}
                onChange={handleChange("postalCode")}
                className={`h-11 ${!validation.postalCode ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                aria-invalid={!validation.postalCode}
              />
              <Input
                id="city"
                placeholder="Stad"
                value={data.city}
                onChange={handleChange("city")}
                className="h-11 col-span-2"
              />
            </div>
            {!validation.postalCode && (
              <p className="text-xs text-destructive">
                Voer een geldige postcode in (bijv. 1234 AB)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Helper text */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h4 className="text-sm font-medium">Waarom deze gegevens?</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>Je kantoorgegevens worden getoond op je openbare profiel</li>
          <li>Zoekers kunnen direct contact met je opnemen</li>
          <li>KvK-nummer verhoogt vertrouwen bij potentiële klanten</li>
        </ul>
      </div>
    </div>
  );
}
