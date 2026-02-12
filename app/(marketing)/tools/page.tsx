import type { Metadata } from "next";
import { ToolsGrid } from "./tools-grid";

export const metadata: Metadata = {
  title: "Gratis Horeca Tools - Horecagrond",
  description: "AI-tools voor ondernemers: omzet voorspeller, naam generator, startup checklist, pitch generator en meer.",
};

export default function ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Gratis Horeca Tools</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Alles wat je nodig hebt om je horecadroom te realiseren — van naamgeving tot financiële planning.
        </p>
      </div>
      <ToolsGrid />
    </div>
  );
}
