"use client";

import { useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  type AgentProfileData,
  type StepProps,
  type PropertyType,
  type Region,
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABELS,
  REGIONS,
  isValidPhone,
} from "./types";
import {
  IconUser,
  IconBriefcase,
  IconPhone,
  IconNotes,
  IconBuildingStore,
  IconMapPin,
  IconX,
} from "@tabler/icons-react";

export function StepAgentProfile({
  data,
  onUpdate,
}: StepProps<AgentProfileData>) {
  // Validation state
  const phoneValid = useMemo(
    () => !data.phone || isValidPhone(data.phone),
    [data.phone]
  );

  // Handlers
  const handleChange = useCallback(
    (field: keyof AgentProfileData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onUpdate({ [field]: e.target.value });
      },
    [onUpdate]
  );

  const handleSpecializationToggle = useCallback(
    (type: PropertyType) => {
      const current = data.specializations;
      const updated = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      onUpdate({ specializations: updated });
    },
    [data.specializations, onUpdate]
  );

  const handleRegionToggle = useCallback(
    (region: Region) => {
      const current = data.regions;
      const updated = current.includes(region)
        ? current.filter((r) => r !== region)
        : [...current, region];
      onUpdate({ regions: updated });
    },
    [data.regions, onUpdate]
  );

  const removeSpecialization = useCallback(
    (type: PropertyType) => {
      onUpdate({
        specializations: data.specializations.filter((t) => t !== type),
      });
    },
    [data.specializations, onUpdate]
  );

  const removeRegion = useCallback(
    (region: Region) => {
      onUpdate({ regions: data.regions.filter((r) => r !== region) });
    },
    [data.regions, onUpdate]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <IconUser className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">Jouw profiel</h2>
        <p className="text-sm text-muted-foreground">
          Vertel ons meer over jezelf als makelaar
        </p>
      </div>

      {/* Form fields */}
      <div className="space-y-5">
        {/* Personal info row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full-name" className="flex items-center gap-2">
              <IconUser className="w-4 h-4 text-muted-foreground" />
              Jouw naam *
            </Label>
            <Input
              id="full-name"
              placeholder="Jan de Vries"
              value={data.fullName}
              onChange={handleChange("fullName")}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <IconBriefcase className="w-4 h-4 text-muted-foreground" />
              Functietitel
            </Label>
            <Input
              id="title"
              placeholder="Senior Makelaar"
              value={data.title}
              onChange={handleChange("title")}
              className="h-11"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="agent-phone" className="flex items-center gap-2">
            <IconPhone className="w-4 h-4 text-muted-foreground" />
            Telefoonnummer
          </Label>
          <Input
            id="agent-phone"
            type="tel"
            placeholder="06 12345678"
            value={data.phone}
            onChange={handleChange("phone")}
            className={`h-11 ${!phoneValid ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
            aria-invalid={!phoneValid}
          />
          <p className="text-xs text-muted-foreground">
            Direct bereikbaar nummer voor klanten
          </p>
          {!phoneValid && (
            <p className="text-xs text-destructive">
              Voer een geldig telefoonnummer in
            </p>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio" className="flex items-center gap-2">
            <IconNotes className="w-4 h-4 text-muted-foreground" />
            Over jou
          </Label>
          <Textarea
            id="bio"
            placeholder="Vertel iets over je ervaring en expertise in horecavastgoed..."
            value={data.bio}
            onChange={handleChange("bio")}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {data.bio.length}/500 karakters
          </p>
        </div>

        {/* Specializations multi-select */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <IconBuildingStore className="w-4 h-4 text-muted-foreground" />
            Specialisaties
          </Label>

          {/* Selected badges */}
          {data.specializations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.specializations.map((type) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="pl-2 pr-1 py-1 gap-1 cursor-pointer hover:bg-secondary/80"
                  onClick={() => removeSpecialization(type)}
                >
                  {PROPERTY_TYPE_LABELS[type]}
                  <IconX className="w-3 h-3" />
                </Badge>
              ))}
            </div>
          )}

          {/* Checkboxes grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PROPERTY_TYPES.map((type) => (
              <label
                key={type}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                  data.specializations.includes(type)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Checkbox
                  checked={data.specializations.includes(type)}
                  onCheckedChange={() => handleSpecializationToggle(type)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-sm">{PROPERTY_TYPE_LABELS[type]}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Selecteer de horecatypes waarin je gespecialiseerd bent
          </p>
        </div>

        {/* Regions multi-select */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <IconMapPin className="w-4 h-4 text-muted-foreground" />
            Werkgebied
          </Label>

          {/* Selected badges */}
          {data.regions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.regions.map((region) => (
                <Badge
                  key={region}
                  variant="secondary"
                  className="pl-2 pr-1 py-1 gap-1 cursor-pointer hover:bg-secondary/80"
                  onClick={() => removeRegion(region)}
                >
                  {region}
                  <IconX className="w-3 h-3" />
                </Badge>
              ))}
            </div>
          )}

          {/* Checkboxes grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {REGIONS.map((region) => (
              <label
                key={region}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                  data.regions.includes(region)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Checkbox
                  checked={data.regions.includes(region)}
                  onCheckedChange={() => handleRegionToggle(region)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-sm">{region}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            In welke regio&apos;s ben je actief?
          </p>
        </div>
      </div>

      {/* Helper text */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h4 className="text-sm font-medium">Tips voor je profiel</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>Een compleet profiel krijgt meer vertrouwen van zoekers</li>
          <li>Specialisaties helpen klanten de juiste makelaar te vinden</li>
          <li>Je bio verschijnt op je openbare profielpagina</li>
        </ul>
      </div>
    </div>
  );
}
