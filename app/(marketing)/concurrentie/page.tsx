import type { Metadata } from "next";
import { ConcurrentieClient } from "./concurrentie-client";

export const metadata: Metadata = {
  title: "Concurrentieradar - Horecagrond",
  description: "Bekijk alle horecazaken rondom een locatie. Ontdek concurrentie, kansen en trends in jouw buurt.",
};

export default function ConcurrentiePage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          👀 Concurrentieradar
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Vul een adres of stad in en zie direct alle horecazaken in de buurt. 
          Ontdek waar de kansen liggen.
        </p>
      </div>
      <ConcurrentieClient />
    </div>
  );
}
