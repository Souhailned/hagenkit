import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Clock } from "lucide-react";

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
          <form className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Naam</label>
                <input
                  type="text"
                  required
                  placeholder="Je naam"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="je@email.nl"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Onderwerp</label>
              <input
                type="text"
                required
                placeholder="Waar gaat je vraag over?"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Bericht</label>
              <textarea
                rows={5}
                required
                placeholder="Beschrijf je vraag..."
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Verstuur bericht
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
