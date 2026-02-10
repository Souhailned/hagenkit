import type { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Veelgestelde vragen - Horecagrond",
  description: "Antwoorden op veelgestelde vragen over Horecagrond, het platform voor horecapanden in Nederland.",
};

const faqs = [
  {
    q: "Wat is Horecagrond?",
    a: "Horecagrond is het platform voor horecapanden in Nederland. Ondernemers kunnen hier zoeken naar restaurants, cafés, bars, hotels en andere horecalocaties. Makelaars kunnen hun aanbod presenteren aan duizenden ondernemers.",
  },
  {
    q: "Is zoeken gratis?",
    a: "Ja, zoeken en browsen is volledig gratis. Je kunt panden bekijken, filteren, opslaan als favoriet en contact opnemen met makelaars zonder kosten.",
  },
  {
    q: "Hoe kan ik als makelaar panden aanbieden?",
    a: "Maak een gratis account aan als 'Makelaar' via de registratiepagina. Na het doorlopen van de onboarding kun je direct panden toevoegen via het dashboard. Je eerste listing is gratis!",
  },
  {
    q: "Wat kost een listing?",
    a: "De eerste listings zijn gratis tijdens onze lanceringsperiode. Neem contact met ons op voor meer informatie over prijzen.",
  },
  {
    q: "Hoe werkt de AI beschrijving generator?",
    a: "Onze slimme tool genereert automatisch professionele pandbeschrijvingen op basis van de kenmerken die je invoert. Kies een schrijfstijl (professioneel, wervend of zakelijk) en pas de tekst aan naar wens.",
  },
  {
    q: "Kan ik een zoekopdracht opslaan?",
    a: "Ja! Klik op 'Bewaar zoekopdracht' op de aanbod pagina. Je kunt kiezen hoe vaak je meldingen wilt ontvangen: direct, dagelijks of wekelijks.",
  },
  {
    q: "Hoe kan ik panden vergelijken?",
    a: "Gebruik de vergelijk functie om tot 4 panden naast elkaar te zetten. Zo zie je in één oogopslag de verschillen in prijs, oppervlakte en voorzieningen.",
  },
  {
    q: "Wat voor soort panden staan er op Horecagrond?",
    a: "Van restaurants en cafés tot dark kitchens en strandpaviljoens — we bieden alle soorten horecapanden aan. Bekijk de Types pagina voor een volledig overzicht.",
  },
  {
    q: "Is mijn data veilig?",
    a: "Ja, we nemen privacy serieus. Je gegevens worden versleuteld opgeslagen en nooit gedeeld met derden zonder jouw toestemming.",
  },
  {
    q: "Hoe neem ik contact op?",
    a: "Via onze contactpagina of mail naar info@horecagrond.nl. We reageren doorgaans binnen 24 uur.",
  },
];

export default function FaqPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-24">
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <HelpCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Veelgestelde vragen</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Alles wat je wilt weten over Horecagrond
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border px-6">
            <AccordionTrigger className="text-left font-semibold hover:no-underline">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-4">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
