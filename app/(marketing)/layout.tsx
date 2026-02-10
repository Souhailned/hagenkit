import { FooterSection } from "@/components/marketing/footer";
import { Header } from "@/components/marketing/header";
import { CookieBanner } from "@/components/cookie-banner";
import { ScrollToTop } from "@/components/scroll-to-top";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main role="main" className="bg-background">
        {children}
      </main>
      <FooterSection />
      <CookieBanner />
      <ScrollToTop />
    </>
  );
}
