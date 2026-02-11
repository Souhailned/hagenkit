import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Search as SearchIcon, Shield } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { UserActions } from "@/components/admin/user-actions";

export default async function AdminUsersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin") redirect("/dashboard");

  const [users, stats] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        emailVerified: true,
        banned: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "agent" } }),
      prisma.user.count({ where: { role: "seeker" } }),
      prisma.user.count({ where: { role: "admin" } }),
    ]),
  ]);

  const [total, agents, seekers, admins] = stats;

  const roleBadge = (r: string) => {
    const config: Record<string, { label: string; color: string }> = {
      admin: { label: "Admin", color: "bg-red-100 text-red-700" },
      agent: { label: "Makelaar", color: "bg-blue-100 text-blue-700" },
      seeker: { label: "Ondernemer", color: "bg-green-100 text-green-700" },
    };
    const c = config[r] || { label: r, color: "bg-gray-100 text-gray-700" };
    return <Badge variant="outline" className={`border-0 ${c.color}`}>{c.label}</Badge>;
  };

  return (
    <div className="container py-8">
      <Breadcrumbs items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Admin", href: "/dashboard/admin" },
        { label: "Gebruikers" },
      ]} />

      <h1 className="text-2xl font-bold tracking-tight mb-6">Gebruikersbeheer</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Totaal</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Building2 className="mx-auto h-5 w-5 text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{agents}</p>
            <p className="text-xs text-muted-foreground">Makelaars</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <SearchIcon className="mx-auto h-5 w-5 text-green-500 mb-1" />
            <p className="text-2xl font-bold">{seekers}</p>
            <p className="text-xs text-muted-foreground">Ondernemers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="mx-auto h-5 w-5 text-red-500 mb-1" />
            <p className="text-2xl font-bold">{admins}</p>
            <p className="text-xs text-muted-foreground">Admins</p>
          </CardContent>
        </Card>
      </div>

      {/* User table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alle gebruikers ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Naam</th>
                  <th className="pb-3 font-medium text-muted-foreground">Email</th>
                  <th className="pb-3 font-medium text-muted-foreground">Rol</th>
                  <th className="pb-3 font-medium text-muted-foreground">Geverifieerd</th>
                  <th className="pb-3 font-medium text-muted-foreground">Lid sinds</th>
                  <th className="pb-3 font-medium text-muted-foreground">Acties</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{user.name || "—"}</td>
                    <td className="py-3 text-muted-foreground">{user.email}</td>
                    <td className="py-3">{roleBadge(user.role || "seeker")}</td>
                    <td className="py-3">
                      {user.emailVerified ? (
                        <Badge variant="outline" className="border-0 bg-green-100 text-green-700">Ja</Badge>
                      ) : (
                        <Badge variant="outline" className="border-0 bg-gray-100 text-gray-700">Nee</Badge>
                      )}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("nl-NL")}
                    </td>
                    <td className="py-3">
                      <UserActions
                        userId={user.id}
                        currentRole={user.role || "seeker"}
                        isBanned={user.banned || false}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
