import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Agency, AgentProfile, PropertyType } from "@/lib/types/property";
import { PropertyTypeLabels } from "@/lib/types/property";

interface AgentCardProps {
  agent?: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    agentProfile?: AgentProfile | null;
  } | null;
  agency?: Agency | null;
  className?: string;
}

export function AgentCard({ agent, agency, className }: AgentCardProps) {
  if (!agent && !agency) return null;

  const profile = agent?.agentProfile;
  const agentName = agent?.name || profile?.user?.name || "Makelaar";
  const agentAvatar = profile?.avatar || agent?.image;
  const agentPhone = profile?.phonePublic ? profile.phone : null;
  const agentEmail = agent?.email;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-4">
        <h3 className="text-lg font-semibold">Over de makelaar</h3>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Agent Profile */}
        {agent && (
          <div className="flex items-start gap-4">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-muted">
              {agentAvatar ? (
                <Image
                  src={agentAvatar}
                  alt={agentName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-muted-foreground">
                  {agentName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{agentName}</h4>
                {profile?.verified && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                )}
              </div>
              {profile?.title && (
                <p className="text-sm text-muted-foreground">{profile.title}</p>
              )}
              {agency && (
                <p className="text-sm text-muted-foreground">
                  {agency.name}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Agent Bio */}
        {profile?.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Agent Specializations */}
        {profile?.specializations && profile.specializations.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Specialisaties
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.specializations.map((type) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {PropertyTypeLabels[type as PropertyType] || type}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Contact buttons for agent */}
        {(agentPhone || agentEmail) && (
          <div className="flex flex-col gap-2">
            {agentPhone && (
              <Button variant="outline" size="sm" asChild className="justify-start">
                <a href={`tel:${agentPhone}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  {agentPhone}
                </a>
              </Button>
            )}
            {agentEmail && (
              <Button variant="outline" size="sm" asChild className="justify-start">
                <a href={`mailto:${agentEmail}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  {agentEmail}
                </a>
              </Button>
            )}
          </div>
        )}

        {/* Agency Section */}
        {agency && (
          <div className="border-t pt-4">
            <div className="flex items-start gap-3">
              {agency.logo ? (
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={agency.logo}
                    alt={agency.name}
                    fill
                    className="object-contain p-1"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <span className="text-lg font-bold text-primary">
                    {agency.name.charAt(0)}
                  </span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium truncate">{agency.name}</h4>
                  {agency.verified && (
                    <Badge
                      variant="outline"
                      className="flex-shrink-0 border-emerald-200 bg-emerald-50 text-emerald-700 text-xs"
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Geverifieerd
                    </Badge>
                  )}
                </div>
                {agency.city && (
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {agency.city}
                  </p>
                )}
              </div>
            </div>

            {agency.description && (
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                {agency.description}
              </p>
            )}

            {/* Agency contact */}
            <div className="mt-3 flex flex-wrap gap-2">
              {agency.phone && (
                <Button variant="ghost" size="sm" asChild className="h-8 px-2">
                  <a href={`tel:${agency.phone}`}>
                    <Phone className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {agency.email && (
                <Button variant="ghost" size="sm" asChild className="h-8 px-2">
                  <a href={`mailto:${agency.email}`}>
                    <Mail className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {agency.website && (
                <Button variant="ghost" size="sm" asChild className="h-8 px-2">
                  <a
                    href={agency.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>

            {/* View agency profile link */}
            <Link
              href={`/makelaars/${agency.slug}`}
              className="mt-3 flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Bekijk kantoorprofiel
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
