import { Wrench, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onderhoud - Horecagrond",
};

export default function OnderhoudPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30 mb-6">
        <Wrench className="h-10 w-10 text-amber-600" />
      </div>
      <h1 className="text-3xl font-bold">Even geduld...</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        We zijn bezig met onderhoud aan het platform. Dit duurt meestal niet lang.
      </p>
      <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>We zijn zo terug</span>
      </div>
    </div>
  );
}
