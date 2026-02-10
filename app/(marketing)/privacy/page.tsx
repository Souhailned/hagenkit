import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacybeleid - Horecagrond",
  description: "Privacybeleid van Horecagrond. Lees hoe wij omgaan met je persoonsgegevens.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-24">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Privacybeleid</h1>
      <p className="text-muted-foreground mb-8">Laatst bijgewerkt: februari 2026</p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">1. Wie zijn wij</h2>
          <p className="text-muted-foreground leading-relaxed">
            Horecagrond is een online platform voor het zoeken en aanbieden van horecapanden in Nederland.
            Wij zijn verantwoordelijk voor de verwerking van persoonsgegevens zoals beschreven in dit privacybeleid.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">2. Welke gegevens verzamelen wij</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Accountgegevens: naam, e-mailadres, wachtwoord (versleuteld)</li>
            <li>Profielgegevens: rol (ondernemer/makelaar), voorkeuren, kantoorgegevens</li>
            <li>Gebruiksgegevens: pagina bezoeken, zoekopdrachten, favorieten</li>
            <li>Contactgegevens: berichten via het contactformulier of pand aanvragen</li>
            <li>Technische gegevens: IP-adres (geanonimiseerd), browser, apparaat</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">3. Waarvoor gebruiken wij je gegevens</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Het aanbieden en verbeteren van onze diensten</li>
            <li>Het verwerken van pand aanvragen en berichten</li>
            <li>Het versturen van meldingen en zoek alerts (indien ingeschakeld)</li>
            <li>Het analyseren van platformgebruik (geanonimiseerd)</li>
            <li>Het voldoen aan wettelijke verplichtingen</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">4. Delen met derden</h2>
          <p className="text-muted-foreground leading-relaxed">
            Wij delen je gegevens niet met derden, tenzij dit noodzakelijk is voor onze dienstverlening
            (bijv. hosting providers) of wij wettelijk verplicht zijn. We verkopen nooit je gegevens.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">5. Bewaartermijn</h2>
          <p className="text-muted-foreground leading-relaxed">
            We bewaren je gegevens zolang je account actief is. Na verwijdering van je account worden je
            gegevens binnen 30 dagen verwijderd, tenzij wettelijk anders vereist.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">6. Je rechten</h2>
          <p className="text-muted-foreground leading-relaxed">
            Je hebt recht op inzage, correctie, verwijdering en overdraagbaarheid van je gegevens.
            Ook kun je bezwaar maken tegen verwerking. Neem contact op via info@horecagrond.nl.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">7. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            Wij gebruiken functionele cookies voor het functioneren van het platform en analytische cookies
            (geanonimiseerd) om het gebruik te analyseren. Je kunt cookies beheren via de cookie banner.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">8. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            Voor vragen over dit privacybeleid kun je contact opnemen via{" "}
            <a href="mailto:info@horecagrond.nl" className="text-primary hover:underline">
              info@horecagrond.nl
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
