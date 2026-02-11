import type { Metadata } from "next";
import { PricingPage } from "./pricing-page";

export const metadata: Metadata = {
  title: "Prijzen | Horecagrond",
  description: "Transparante abonnementen voor makelaars. Gratis starten, premium features voor groei.",
};

export default function Page() {
  return <PricingPage />;
}
