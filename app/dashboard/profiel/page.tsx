import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Shield } from "lucide-react";
import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/dashboard/content-card";

export default async function ProfielPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const user = session.user;
  const role = (user as Record<string, unknown>).role as string || "seeker";
  const roleLabel = role === "agent" ? "Makelaar" : "Ondernemer";

  return (
    <ContentCard>
      <ContentCardHeader title="Profiel" />
      <ContentCardBody className="p-4">
        <div className="mx-auto max-w-2xl space-y-6">

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Accountinformatie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Naam</p>
              <p className="font-medium">{user.name || "Niet ingesteld"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">E-mail</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rol</p>
              <Badge variant="secondary">{roleLabel}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lid sinds</p>
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleDateString("nl-NL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

        </div>
      </ContentCardBody>
    </ContentCard>
  );
}
