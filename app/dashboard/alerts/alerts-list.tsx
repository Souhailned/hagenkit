"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { deleteSearchAlert, toggleSearchAlert } from "@/app/actions/search-alerts";
import { Bell, BellOff, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Alert {
  id: string;
  name: string;
  active: boolean;
  cities: string[];
  propertyTypes: string[];
  priceMin: number | null;
  priceMax: number | null;
  surfaceMin: number | null;
  surfaceMax: number | null;
  frequency: string;
  matchCount: number;
  createdAt: Date;
}

export function AlertsList({ alerts: initialAlerts }: { alerts: Alert[] }) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [isPending, startTransition] = useTransition();

  function handleToggle(alertId: string) {
    startTransition(async () => {
      const result = await toggleSearchAlert(alertId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, active: result.active! } : a))
      );
    });
  }

  function handleDelete(alertId: string) {
    startTransition(async () => {
      const result = await deleteSearchAlert(alertId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      toast.success("Zoekopdracht verwijderd");
    });
  }

  const freqLabels: Record<string, string> = {
    INSTANT: "Direct",
    DAILY: "Dagelijks",
    WEEKLY: "Wekelijks",
  };

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Card key={alert.id} className={!alert.active ? "opacity-60" : ""}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              {alert.active ? (
                <Bell className="h-5 w-5 text-primary" />
              ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{alert.name}</h3>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {alert.cities.length > 0 && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {alert.cities.join(", ")}
                  </span>
                )}
                <Badge variant="outline" className="text-xs">
                  {freqLabels[alert.frequency] || alert.frequency}
                </Badge>
                <span>{alert.matchCount} matches</span>
              </div>
            </div>
            <Switch
              checked={alert.active}
              onCheckedChange={() => handleToggle(alert.id)}
              disabled={isPending}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(alert.id)}
              disabled={isPending}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
