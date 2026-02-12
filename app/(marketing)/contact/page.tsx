import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Clock } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact - Horecagrond",
  description: "Neem contact op met Horecagrond. We helpen je graag met vragen over ons platform.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-24">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Contact</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Heb je een vraag? We helpen je graag.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-3 mb-12">
        <Card>
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">E-mail</h3>
            <a href="mailto:info@horecagrond.nl" className="mt-1 text-sm text-primary hover:underline">
              info@horecagrond.nl
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Locatie</h3>
            <p className="mt-1 text-sm text-muted-foreground">Nederland</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Reactietijd</h3>
            <p className="mt-1 text-sm text-muted-foreground">Binnen 24 uur</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-8">
          <h2 className="text-xl font-semibold mb-6">Stuur ons een bericht</h2>
          <ContactForm />
        </CardContent>
      </Card>
    </div>
  );
}
