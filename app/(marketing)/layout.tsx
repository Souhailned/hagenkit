import { FooterSection } from "@/components/marketing/footer";
import { Header } from "@/components/marketing/header";
import { CookieBanner } from "@/components/cookie-banner";
import { ScrollToTop } from "@/components/scroll-to-top";
import { CompareBar } from "@/components/property/compare-bar";
import { ChatWidget } from "@/components/chat/chat-widget";

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
      <CompareBar />
      <ScrollToTop />
      <ChatWidget />
    </>
  );
}
