import Image from "next/image";
import { Star, Award, Linkedin, Twitter, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { AgentProfile } from "@/types/agency";

interface AgentCardProps {
  agent: AgentProfile;
  className?: string;
}

export function AgentCard({ agent, className }: AgentCardProps) {
  const fullName = `${agent.firstName} ${agent.lastName}`;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-all duration-300",
        "hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
    >
      {/* Avatar Section */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50">
        {agent.avatar ? (
          <Image
            src={agent.avatar}
            alt={fullName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <span className="text-5xl font-bold text-primary/40">
              {agent.firstName[0]}
              {agent.lastName[0]}
            </span>
          </div>
        )}

        {/* Verified Badge Overlay */}
        {agent.verified && (
          <div className="absolute right-3 top-3">
            <div className="flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-1 text-xs font-medium text-white shadow-md backdrop-blur-sm">
              <Award className="h-3 w-3" />
              <span>Verified</span>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-5">
        {/* Name & Rating */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-foreground">{fullName}</h3>
          {agent.rating && (
            <div className="flex shrink-0 items-center gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">{agent.rating}</span>
            </div>
          )}
        </div>

        {/* Experience & Reviews */}
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {agent.yearsExperience && (
            <span>{agent.yearsExperience} jaar ervaring</span>
          )}
          {agent.yearsExperience && agent.reviewCount > 0 && (
            <span className="text-border">•</span>
          )}
          {agent.reviewCount > 0 && <span>{agent.reviewCount} reviews</span>}
        </div>

        {/* Bio */}
        {agent.bio && (
          <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {agent.bio}
          </p>
        )}

        {/* Specializations */}
        {agent.specializations.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {agent.specializations.slice(0, 3).map((spec) => (
              <Badge key={spec} variant="secondary" className="text-xs">
                {spec}
              </Badge>
            ))}
            {agent.specializations.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{agent.specializations.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Languages */}
        {agent.languages.length > 0 && (
          <div className="mb-4 text-xs text-muted-foreground">
            <span className="font-medium">Talen: </span>
            {agent.languages.join(", ")}
          </div>
        )}

        {/* Contact & Social Links */}
        <div className="mt-auto flex items-center gap-2 border-t border-border/50 pt-4">
          {agent.email && (
            <a
              href={`mailto:${agent.email}`}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={`Email ${fullName}`}
            >
              <Mail className="h-4 w-4" />
            </a>
          )}
          {agent.phone && (
            <a
              href={`tel:${agent.phone}`}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={`Bel ${fullName}`}
            >
              <Phone className="h-4 w-4" />
            </a>
          )}
          {agent.linkedIn && (
            <a
              href={agent.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-[#0A66C2]"
              aria-label={`${fullName} op LinkedIn`}
            >
              <Linkedin className="h-4 w-4" />
            </a>
          )}
          {agent.twitter && (
            <a
              href={agent.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={`${fullName} op Twitter`}
            >
              <Twitter className="h-4 w-4" />
            </a>
          )}

          {/* Stats */}
          <div className="ml-auto text-right text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {agent.dealsCompleted}
            </span>{" "}
            deals
          </div>
        </div>
      </div>
    </div>
  );
}

export function AgentCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="h-5 w-12 animate-pulse rounded bg-muted" />
        </div>
        <div className="mb-3 h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="mb-4 h-16 w-full animate-pulse rounded bg-muted" />
        <div className="mb-4 flex gap-1.5">
          <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="mt-auto flex items-center gap-2 border-t border-border/50 pt-4">
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}
