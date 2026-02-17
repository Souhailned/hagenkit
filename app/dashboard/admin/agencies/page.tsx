import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ContentCard,
  ContentCardHeader,
  ContentCardBody,
} from "@/components/dashboard/content-card";

export default async function AdminAgenciesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin") redirect("/dashboard");

  const agencies = await prisma.agency.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      email: true,
      phone: true,
      city: true,
      _count: { select: { properties: true, members: true } },
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <ContentCard>
      <ContentCardHeader title="Kantoren" />
      <ContentCardBody className="p-4">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-4 font-medium text-muted-foreground">Kantoor</th>
                    <th className="p-4 font-medium text-muted-foreground">Stad</th>
                    <th className="p-4 font-medium text-muted-foreground">Contact</th>
                    <th className="p-4 font-medium text-muted-foreground">Panden</th>
                    <th className="p-4 font-medium text-muted-foreground">Leden</th>
                    <th className="p-4 font-medium text-muted-foreground">Aangemaakt</th>
                  </tr>
                </thead>
                <tbody>
                  {agencies.map((a) => (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-4">
                        <p className="font-medium">{a.name}</p>
                        <p className="text-xs text-muted-foreground">{a.slug}</p>
                      </td>
                      <td className="p-4 text-muted-foreground">{a.city || "\u2014"}</td>
                      <td className="p-4">
                        <p className="text-sm">{a.email || "\u2014"}</p>
                        <p className="text-xs text-muted-foreground">{a.phone || ""}</p>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{a._count.properties}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{a._count.members}</Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(a.createdAt).toLocaleDateString("nl-NL")}
                      </td>
                    </tr>
                  ))}
                  {agencies.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        Nog geen makelaarskantoren geregistreerd
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </ContentCardBody>
    </ContentCard>
  );
}
