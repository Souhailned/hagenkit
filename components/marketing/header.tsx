"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import React from "react";
import { List as Menu, X } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { Building2, Search, Map, MapPin, Users } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { name: "Aanbod", href: "/aanbod", icon: Search },
  { name: "Kaart", href: "/aanbod?view=map", icon: Map },
  { name: "Haalbaarheid", href: "/haalbaarheid", icon: Building2 },
  { name: "Voor makelaars", href: "/voor-makelaars", icon: Users },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { data: session, isPending } = useSession();

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-b shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-foreground">
            Horecagrond
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
            >
              {link.name}
            </Link>
          ))}
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
                    <Button size="sm">
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
          className="lg:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t bg-background/95 backdrop-blur-lg">
          <nav className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
            <div className="mt-4 pt-4 border-t flex flex-col gap-2">
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
                    <Button className="w-full">Gratis aanmelden</Button>
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
