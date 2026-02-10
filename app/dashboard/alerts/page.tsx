import { getSearchAlerts } from "@/app/actions/search-alerts";
import { AlertsList } from "./alerts-list";
import { Bell } from "lucide-react";

export const metadata = {
  title: "Mijn Zoekopdrachten - Horecagrond",
};

export default async function AlertsPage() {
  const alerts = await getSearchAlerts();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Mijn Zoekopdrachten</h1>
        <p className="mt-2 text-muted-foreground">
          Ontvang meldingen wanneer er nieuwe panden worden aangeboden
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Geen zoekopdrachten</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Sla een zoekopdracht op via de &quot;Bewaar zoekopdracht&quot; knop op de aanbod pagina.
          </p>
          <a
            href="/aanbod"
            className="mt-6 inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Bekijk aanbod
          </a>
        </div>
      ) : (
        <AlertsList alerts={alerts} />
      )}
    </div>
  );
}
