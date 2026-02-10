export const siteConfig = {
  name: "Horecagrond",
  title: "Horecagrond – Het platform voor horecapanden in Nederland",
  description:
    "Vind of bied horecapanden aan in heel Nederland. Restaurants, cafés, bars, hotels en meer. Met slimme zoektools en professionele presentatie.",
  url: "https://horecagrond.nl",
  ogImage: "/og.png",
  upgrade: {
    label: "Upgrade naar Pro",
    href: "/dashboard/settings",
  },
  links: {
    twitter: "",
    linkedin: "",
  },
  keywords: [
    "horecapanden",
    "horeca te koop",
    "horeca te huur",
    "restaurant kopen",
    "café overnemen",
    "horeca makelaar",
    "horecagrond",
    "horeca vastgoed",
    "horeca locatie",
  ],
  authors: [
    {
      name: "Horecagrond",
      url: "https://horecagrond.nl",
    },
  ],
  creator: "Horecagrond",
  publisher: "Horecagrond",
  twitterHandle: "",
  locale: "nl_NL",
  category: "Vastgoed",
  email: {
    brandName: "Horecagrond",
    tagline: "Het platform voor horecapanden in Nederland.",
    supportEmail: "info@horecagrond.nl",
    fromEmail: "noreply@horecagrond.nl",
    fromName: "Horecagrond",
  },
};

export type SiteConfig = typeof siteConfig;
