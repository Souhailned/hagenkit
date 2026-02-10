"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSearchAlert } from "@/app/actions/search-alerts";
import { Bell, Check } from "lucide-react";
import { toast } from "sonner";

interface SaveSearchDialogProps {
  cities?: string[];
  types?: string[];
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
}

export function SaveSearchDialog({
  cities = [],
  types = [],
  priceMin,
  priceMax,
  areaMin,
  areaMax,
}: SaveSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<"INSTANT" | "DAILY" | "WEEKLY">("DAILY");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  // Generate default name
  const defaultName = [
    ...cities,
    ...types.map((t) => t.replace(/_/g, " ").toLowerCase()),
  ]
    .slice(0, 3)
    .join(", ") || "Mijn zoekopdracht";

  function handleSave() {
    startTransition(async () => {
      const result = await createSearchAlert({
        name: name || defaultName,
        cities,
        propertyTypes: types,
        priceMin,
        priceMax,
        surfaceMin: areaMin,
        surfaceMax: areaMax,
        frequency,
      });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      setSaved(true);
      toast.success("Zoekopdracht opgeslagen! Je ontvangt alerts bij nieuwe panden.");
      setTimeout(() => {
        setOpen(false);
        setSaved(false);
        setName("");
      }, 1500);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Bell className="mr-2 h-4 w-4" />
          Bewaar zoekopdracht
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Zoekopdracht opslaan</DialogTitle>
          <DialogDescription>
            Ontvang een melding wanneer er nieuwe panden worden aangeboden die passen bij je zoekcriteria.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="alert-name">Naam</Label>
            <Input
              id="alert-name"
              placeholder={defaultName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Hoe vaak wil je meldingen?</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as typeof frequency)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INSTANT">Direct bij nieuw pand</SelectItem>
                <SelectItem value="DAILY">Dagelijkse samenvatting</SelectItem>
                <SelectItem value="WEEKLY">Wekelijkse samenvatting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Show current filters */}
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium mb-1">Je huidige filters:</p>
            <ul className="text-muted-foreground space-y-0.5">
              {cities.length > 0 && <li>📍 {cities.join(", ")}</li>}
              {types.length > 0 && (
                <li>🏢 {types.map((t) => t.replace(/_/g, " ")).join(", ")}</li>
              )}
              {priceMin && <li>💰 Vanaf €{priceMin.toLocaleString("nl-NL")}</li>}
              {priceMax && <li>💰 Tot €{priceMax.toLocaleString("nl-NL")}</li>}
              {areaMin && <li>📐 Vanaf {areaMin} m²</li>}
              {areaMax && <li>📐 Tot {areaMax} m²</li>}
              {cities.length === 0 && types.length === 0 && !priceMin && !priceMax && (
                <li>Alle horecapanden in Nederland</li>
              )}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuleren
          </Button>
          <Button onClick={handleSave} disabled={isPending || saved}>
            {saved ? (
              <><Check className="mr-2 h-4 w-4" /> Opgeslagen!</>
            ) : isPending ? (
              "Opslaan..."
            ) : (
              <><Bell className="mr-2 h-4 w-4" /> Opslaan</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
