import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getScoredLeads } from "@/app/actions/lead-scoring";
import { LeadsClient } from "./leads-client";
import { MessageSquare } from "lucide-react";

export const metadata = { title: "Leads - Horecagrond" };

export default async function LeadsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/sign-in");

  const leads = await getScoredLeads();

  const hotCount = leads.filter((l) => l.score.temperature === "hot").length;
  const warmCount = leads.filter((l) => l.score.temperature === "warm").length;
  const newCount = leads.filter((l) => l.status === "NEW").length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <p className="mt-2 text-muted-foreground">
          {leads.length} aanvragen · {newCount} nieuw
          {hotCount > 0 && <span className="text-red-500 font-medium"> · 🔥 {hotCount} heet</span>}
          {warmCount > 0 && <span className="text-amber-500 font-medium"> · 🌡️ {warmCount} warm</span>}
        </p>
      </div>

      {leads.length === 0 ? (
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
        <LeadsClient leads={leads} />
      )}
    </div>
  );
}
