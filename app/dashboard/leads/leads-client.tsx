"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeadThermometer } from "@/components/leads/lead-thermometer";
import { Clock, User, Mail, Phone, Building2, ChevronDown, ChevronUp, Filter, Sparkles } from "lucide-react";
import type { ScoredLead } from "@/app/actions/lead-scoring";
import { cn } from "@/lib/utils";
import type { LeadTemperature } from "@/lib/lead-scoring";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  NEW: { label: "Nieuw", variant: "default" },
  VIEWED: { label: "Bekeken", variant: "outline" },
  CONTACTED: { label: "Contact", variant: "secondary" },
  VIEWING_SCHEDULED: { label: "Bezichtiging", variant: "outline" },
  NEGOTIATING: { label: "Onderhandeling", variant: "default" },
  CLOSED_WON: { label: "Gesloten ✅", variant: "secondary" },
  CLOSED_LOST: { label: "Niet doorgegaan", variant: "destructive" },
  SPAM: { label: "Spam", variant: "destructive" },
};

interface LeadsClientProps {
  leads: ScoredLead[];
}

export function LeadsClient({ leads }: LeadsClientProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterTemp, setFilterTemp] = useState<LeadTemperature | "all">("all");
  const [filterSource, setFilterSource] = useState<"all" | "DREAM_SLIDER">("all");

  const filtered = leads.filter((l) => {
    if (filterTemp !== "all" && l.score.temperature !== filterTemp) return false;
    if (filterSource !== "all" && l.source !== filterSource) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Temperature filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {(["all", "hot", "warm", "cold"] as const).map((temp) => (
          <Button
            key={temp}
            variant={filterTemp === temp ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterTemp(temp)}
            className="h-8"
          >
            {temp === "all" && "Alle"}
            {temp === "hot" && "🔥 Heet"}
            {temp === "warm" && "🌡️ Warm"}
            {temp === "cold" && "🧊 Koud"}
            <span className="ml-1 text-xs opacity-60">
              ({temp === "all" ? leads.length : leads.filter((l) => l.score.temperature === temp).length})
            </span>
          </Button>
        ))}
      </div>

      {/* Source filter */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-muted-foreground" />
        <Button
          variant={filterSource === "all" ? "default" : "outline"}
          size="sm"
          className="h-8"
          onClick={() => setFilterSource("all")}
        >
          Alle bronnen
          <span className="ml-1 text-xs opacity-60">({leads.length})</span>
        </Button>
        <Button
          variant={filterSource === "DREAM_SLIDER" ? "default" : "outline"}
          size="sm"
          className="h-8"
          onClick={() => setFilterSource("DREAM_SLIDER")}
        >
          AI Slider
          <span className="ml-1 text-xs opacity-60">
            ({leads.filter((l) => l.source === "DREAM_SLIDER").length})
          </span>
        </Button>
      </div>

      {/* Lead cards */}
      <div className="space-y-3">
        {filtered.map((lead) => {
          const status = statusLabels[lead.status] || { label: lead.status, variant: "secondary" as const };
          const isExpanded = expandedId === lead.id;

          return (
            <Card
              key={lead.id}
              className={cn(
                "transition-colors",
                lead.status === "NEW" && "border-primary/30 bg-primary/5",
                lead.score.temperature === "hot" && "border-red-500/20",
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{lead.name}</span>
                      {lead.source === "DREAM_SLIDER" && (
                        <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">
                          AI
                        </Badge>
                      )}
                      <LeadThermometer score={lead.score} compact />
                      <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {getTimeAgo(lead.createdAt)}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" /> {lead.email}
                      </span>
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-primary">
                          <Phone className="h-3.5 w-3.5" /> {lead.phone}
                        </a>
                      )}
                      {lead.company && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" /> {lead.company}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      {lead.propertyTitle}
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {lead.message}
                    </p>

                    {/* Expand/collapse for thermometer details */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 text-xs text-muted-foreground"
                      onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" /> Minder details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" /> Lead analyse
                        </>
                      )}
                    </Button>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t">
                        <LeadThermometer score={lead.score} />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m geleden`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}u geleden`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d geleden`;
  return new Date(date).toLocaleDateString("nl-NL");
}
