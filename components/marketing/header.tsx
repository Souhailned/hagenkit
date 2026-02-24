"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import React from "react";
import { List as Menu, X } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { Search, Map, Users, Wrench } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { name: "Aanbod", href: "/aanbod", icon: Search },
  { name: "Kaart", href: "/aanbod?view=map", icon: Map },
  { name: "Tools", href: "/tools", icon: Wrench },
  { name: "Voor makelaars", href: "/voor-makelaars", icon: Users },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHomepage = pathname === "/";
  const viewParam = searchParams.get("view");

  const isLinkActive = (href: string) => {
    if (href === "/aanbod") {
      return pathname === "/aanbod" && viewParam !== "map";
    }
    if (href === "/aanbod?view=map") {
      return pathname === "/aanbod" && viewParam === "map";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        isHomepage && !isScrolled
          ? "bg-transparent"
          : "bg-background/80 backdrop-blur-xl"
      )}
    >
      {/* Main header content */}
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <span className="text-xs font-bold text-primary-foreground">H</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Horecagrond
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = isLinkActive(link.href);

            return (
              <Link
                key={link.name}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isActive
                    ? "bg-primary/8 text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  /* Reserve space for the dot indicator */
                  "pb-3"
                )}
              >
                {link.name}
                {/* Active dot indicator */}
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Auth buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {!isPending && (
            <>
              {session ? (
                <Link href="/dashboard">
                  <Button variant="default" size="sm">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <ThemeToggle />
                  <Link href="/sign-in">
                    <Button variant="ghost" size="sm">
                      Inloggen
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button
                      size="sm"
                      className="shadow-[0_0_12px_-3px] shadow-primary/30"
                    >
                      Gratis aanmelden
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden rounded-md p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-main-nav"
          aria-label={isMobileMenuOpen ? "Sluit menu" : "Open menu"}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Gradient glow bottom border */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-px transition-opacity duration-500",
          "bg-gradient-to-r from-transparent via-primary/40 to-transparent",
          isHomepage && !isScrolled ? "opacity-0" : "opacity-100"
        )}
      />

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border/50 bg-background/80 backdrop-blur-xl">
          <nav id="mobile-main-nav" className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = isLinkActive(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/8 text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
            <div className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-2">
              {session ? (
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Inloggen</Button>
                  </Link>
                  <Link href="/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full shadow-[0_0_12px_-3px] shadow-primary/30">
                      Gratis aanmelden
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
