import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, User, Mail, Phone, Building2 } from "lucide-react";

export const metadata = { title: "Leads - Horecagrond" };

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  NEW: { label: "Nieuw", variant: "default" },
  VIEWED: { label: "Bekeken", variant: "outline" },
  CONTACTED: { label: "Contact", variant: "secondary" },
  VIEWING_SCHEDULED: { label: "Bezichtiging", variant: "outline" },
  NEGOTIATING: { label: "Onderhandeling", variant: "default" },
  CLOSED_WON: { label: "Gesloten ✅", variant: "secondary" },
  CLOSED_LOST: { label: "Niet doorgegaan", variant: "destructive" },
};

export default async function LeadsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/sign-in");

  const inquiries = await prisma.propertyInquiry.findMany({
    where: {
      property: { createdById: session.user.id },
    },
    include: {
      property: { select: { title: true, slug: true, city: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const newCount = inquiries.filter((i) => i.status === "NEW").length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <p className="mt-2 text-muted-foreground">
          {inquiries.length} aanvragen · {newCount} nieuw
        </p>
      </div>

      {inquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Nog geen aanvragen</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Wanneer ondernemers interesse tonen in je panden, verschijnen hun aanvragen hier.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => {
            const status = statusLabels[inquiry.status] || { label: inquiry.status, variant: "secondary" as const };
            const timeAgo = getTimeAgo(inquiry.createdAt);

            return (
              <Card key={inquiry.id} className={inquiry.status === "NEW" ? "border-primary/30 bg-primary/5" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{inquiry.name}</span>
                        <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {timeAgo}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" /> {inquiry.email}
                        </span>
                        {inquiry.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" /> {inquiry.phone}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        {inquiry.property.title} · {inquiry.property.city}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {inquiry.message}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
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
