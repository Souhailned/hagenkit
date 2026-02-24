import type { Metadata } from "next";
import { ToolsGrid } from "./tools-grid";

export const metadata: Metadata = {
  title: "Gratis Horeca Tools - Horecagrond",
  description: "AI-tools voor ondernemers: omzet voorspeller, naam generator, startup checklist, pitch generator en meer.",
};

export default function ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Gratis Horeca Tools</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          AI-gedreven inzichten voor je horecadroom — van naamgeving tot financiële planning.
        </p>
      </div>
      <ToolsGrid />
    </div>
  );
}
