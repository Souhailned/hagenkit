import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Algemene Voorwaarden - Horecagrond",
  description: "Algemene voorwaarden van Horecagrond.",
};

export default function VoorwaardenPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-24">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Algemene Voorwaarden</h1>
      <p className="text-muted-foreground mb-8">Laatst bijgewerkt: februari 2026</p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">1. Definities</h2>
          <p className="text-muted-foreground leading-relaxed">
            In deze voorwaarden wordt verstaan onder: Platform: de website en applicatie van Horecagrond;
            Gebruiker: iedere bezoeker of geregistreerde gebruiker; Aanbieder: een makelaar of eigenaar die
            panden aanbiedt; Zoeker: een ondernemer die panden zoekt.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">2. Toepasselijkheid</h2>
          <p className="text-muted-foreground leading-relaxed">
            Deze voorwaarden zijn van toepassing op elk gebruik van het platform. Door gebruik te maken van
            Horecagrond ga je akkoord met deze voorwaarden.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">3. Gebruik van het platform</h2>
          <p className="text-muted-foreground leading-relaxed">
            Het platform is bedoeld voor het zoeken en aanbieden van horecapanden in Nederland. Gebruikers
            dienen correcte en actuele informatie te verstrekken. Misbruik van het platform is niet toegestaan.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">4. Aansprakelijkheid</h2>
          <p className="text-muted-foreground leading-relaxed">
            Horecagrond is een bemiddelingsplatform en is niet verantwoordelijk voor de inhoud van listings,
            de kwaliteit van panden of de betrouwbaarheid van gebruikers. Transacties verlopen rechtstreeks
            tussen partijen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">5. Intellectueel eigendom</h2>
          <p className="text-muted-foreground leading-relaxed">
            Alle content op het platform (teksten, afbeeldingen, software) is eigendom van Horecagrond of
            haar licentiegevers. Gebruik zonder toestemming is niet toegestaan.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">6. Wijzigingen</h2>
          <p className="text-muted-foreground leading-relaxed">
            Horecagrond behoudt het recht deze voorwaarden te wijzigen. Wijzigingen worden gecommuniceerd
            via het platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">7. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            Voor vragen over deze voorwaarden:{" "}
            <a href="mailto:info@horecagrond.nl" className="text-primary hover:underline">
              info@horecagrond.nl
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
