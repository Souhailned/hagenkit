import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAnalyticsOverview } from "@/app/actions/analytics";
import { AnalyticsClient } from "./analytics-client";
import { ChartBar } from "@phosphor-icons/react/dist/ssr";

export const metadata = { title: "Analytics - Horecagrond" };

export default async function AnalyticsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/sign-in");

  const analytics = await getAnalyticsOverview();

  if (!analytics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Analytics</h1>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ChartBar className="h-8 w-8 text-muted-foreground" weight="duotone" />
          </div>
          <h2 className="text-xl font-semibold">Geen data beschikbaar</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Voeg je eerste pand toe om statistieken te zien.
          </p>
        </div>
      </div>
    );
  }

  return <AnalyticsClient analytics={analytics} />;
}
