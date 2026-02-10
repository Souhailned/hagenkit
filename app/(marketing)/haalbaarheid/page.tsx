import type { Metadata } from "next";
import { HaalbaarheidClient } from "./haalbaarheid-client";

export const metadata: Metadata = {
  title: "Haalbaarheidscheck - Horecagrond",
  description: "Bereken of jouw horecaconcept haalbaar is. Gratis haalbaarheidsrapport met startkosten, maandlasten en terugverdientijd.",
};

export default function HaalbaarheidPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          ⚖️ Haalbaarheidscheck
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Ontdek of jouw horecadroom financieel haalbaar is. 
          Vul je concept, budget en locatie in en krijg direct een rapport.
        </p>
      </div>
      <HaalbaarheidClient />
    </div>
  );
}
