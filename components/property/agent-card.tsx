import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, Building2 } from "lucide-react";
import Link from "next/link";

interface AgentCardProps {
  agent?: {
    name: string;
    email: string;
    phone?: string;
    agencyName?: string;
  };
}

export function AgentCard({ agent }: AgentCardProps) {
  if (!agent) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-semibold">Neem contact op</p>
          <p className="text-sm text-muted-foreground mt-1">
            Voor meer informatie over dit pand
          </p>
          <Link href="/contact">
            <Button className="mt-4 w-full" size="sm">Contact opnemen</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{agent.name}</p>
            {agent.agencyName && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" /> {agent.agencyName}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <a href={`mailto:${agent.email}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
            <Mail className="h-4 w-4 text-muted-foreground" />
            {agent.email}
          </a>
          {agent.phone && (
            <a href={`tel:${agent.phone}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {agent.phone}
            </a>
          )}
        </div>
        <Button className="mt-4 w-full" size="sm">Bericht sturen</Button>
      </CardContent>
    </Card>
  );
}
