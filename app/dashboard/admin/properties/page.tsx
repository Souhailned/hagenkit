import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/property/status-badge";
import { PropertyActions } from "@/components/admin/property-actions";
import {
  ContentCard,
  ContentCardHeader,
  ContentCardBody,
} from "@/components/dashboard/content-card";

export default async function AdminPropertiesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin") redirect("/dashboard");

  const properties = await prisma.property.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      city: true,
      status: true,
      propertyType: true,
      viewCount: true,
      inquiryCount: true,
      featured: true,
      createdAt: true,
      createdBy: { select: { name: true, email: true } },
      agency: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <ContentCard>
      <ContentCardHeader title="Panden Beheer" />
      <ContentCardBody className="p-4">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-4 font-medium text-muted-foreground">Pand</th>
                    <th className="p-4 font-medium text-muted-foreground">Stad</th>
                    <th className="p-4 font-medium text-muted-foreground">Status</th>
                    <th className="p-4 font-medium text-muted-foreground">Makelaar</th>
                    <th className="p-4 font-medium text-muted-foreground">Views</th>
                    <th className="p-4 font-medium text-muted-foreground">Aanvragen</th>
                    <th className="p-4 font-medium text-muted-foreground">Datum</th>
                    <th className="p-4 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-4">
                        <p className="font-medium">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{p.propertyType}</p>
                      </td>
                      <td className="p-4 text-muted-foreground">{p.city}</td>
                      <td className="p-4"><StatusBadge status={p.status} /></td>
                      <td className="p-4">
                        <p className="text-sm">{p.agency?.name || "\u2014"}</p>
                        <p className="text-xs text-muted-foreground">{p.createdBy?.name || p.createdBy?.email}</p>
                      </td>
                      <td className="p-4 tabular-nums">{p.viewCount}</td>
                      <td className="p-4 tabular-nums">{p.inquiryCount}</td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString("nl-NL")}
                      </td>
                      <td className="p-4">
                        <PropertyActions
                          propertyId={p.id}
                          slug={p.slug}
                          status={p.status}
                          featured={p.featured}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </ContentCardBody>
    </ContentCard>
  );
}
