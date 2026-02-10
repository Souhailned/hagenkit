import Link from "next/link";
import { Newsletter } from "./newsletter";

const links = [
  {
    group: "Platform",
    items: [
      { title: "Aanbod bekijken", href: "/aanbod" },
      { title: "Kaart", href: "/aanbod?view=map" },
      { title: "Voor makelaars", href: "/voor-makelaars" },
      { title: "Haalbaarheidscheck", href: "/haalbaarheid" },
    ],
  },
  {
    group: "Pand types",
    items: [
      { title: "Restaurants", href: "/aanbod?types=RESTAURANT" },
      { title: "Cafés", href: "/aanbod?types=CAFE" },
      { title: "Hotels", href: "/aanbod?types=HOTEL" },
      { title: "Lunchrooms", href: "/aanbod?types=LUNCHROOM" },
    ],
  },
  {
    group: "Over ons",
    items: [
      { title: "Over Horecagrond", href: "/over-ons" },
      { title: "Contact", href: "/contact" },
      { title: "Veelgestelde vragen", href: "/faq" },
      { title: "Privacy", href: "/privacy" },
    ],
  },
];

const cities = [
  "Amsterdam", "Rotterdam", "Utrecht", "Den Haag",
  "Eindhoven", "Groningen", "Maastricht", "Arnhem",
];

export function FooterSection() {
  return (
    <footer role="contentinfo" className="border-t bg-muted/30 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-12">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="block">
              <span className="text-xl font-bold text-foreground">
                Horecagrond
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Het platform voor horecapanden in Nederland.
              Vind of bied restaurants, cafés, bars en meer aan.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {cities.map((city) => (
                <Link
                  key={city}
                  href={`/aanbod?city=${encodeURIComponent(city)}`}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>

          <div className="col-span-3 grid gap-8 sm:grid-cols-3">
            {links.map((link) => (
              <div key={link.group} className="space-y-3">
                <span className="block text-sm font-semibold">{link.group}</span>
                <div className="flex flex-col gap-2">
                  {link.items.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 border-t pt-8">
          <Newsletter />
        </div>

        <div className="mt-8 border-t pt-6 flex flex-wrap justify-between gap-4">
          <span className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Horecagrond. Alle rechten voorbehouden.
          </span>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/voorwaarden" className="hover:text-primary transition-colors">Voorwaarden</Link>
            <Link href="#" className="hover:text-primary transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
