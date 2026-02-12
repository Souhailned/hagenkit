"use client";

import * as React from "react";
import { ChatCircleDots, PaperPlaneTilt, X, MapPin, ArrowSquareOut, Buildings, Envelope, Heart, CalendarBlank, Copy, Check } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatProperty {
  title: string;
  slug: string;
  city: string;
  type: string;
  price: string;
  area?: string;
  imageUrl?: string | null;
  images?: string[];
  lat?: number;
  lng?: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  quickReplies?: string[];
  properties?: ChatProperty[];
}

const PROPERTIES_MARKER = "\n<!--PROPERTIES:";
const PROPERTIES_END = ":PROPERTIES-->";

// Parse properties from streamed content
function parsePropertiesFromContent(content: string): {
  text: string;
  properties: ChatProperty[];
} {
  const markerIdx = content.indexOf(PROPERTIES_MARKER);
  if (markerIdx === -1) return { text: content, properties: [] };

  const endIdx = content.indexOf(PROPERTIES_END);
  if (endIdx === -1) return { text: content.substring(0, markerIdx), properties: [] };

  const jsonStr = content.substring(markerIdx + PROPERTIES_MARKER.length, endIdx);
  try {
    const properties = JSON.parse(jsonStr) as ChatProperty[];
    return { text: content.substring(0, markerIdx).trim(), properties };
  } catch {
    return { text: content.substring(0, markerIdx), properties: [] };
  }
}

// Property type labels
const typeLabels: Record<string, string> = {
  RESTAURANT: "Restaurant",
  CAFE: "Café",
  BAR: "Bar",
  HOTEL: "Hotel",
  LUNCHROOM: "Lunchroom",
  DARK_KITCHEN: "Dark Kitchen",
  BAKERY: "Bakkerij",
  BISTRO: "Bistro",
  GRAND_CAFE: "Grand Café",
  EETCAFE: "Eetcafé",
  PARTY_CENTER: "Partycentrum",
};

// Mini image carousel for chat cards
function ChatImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = React.useState(0);
  const count = images.length;

  if (count === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Buildings className="h-6 w-6 text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full group">
      <Image src={images[idx]} alt={alt} fill className="object-cover" sizes="80px" />
      {count > 1 && (
        <>
          {/* Dots */}
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
            {images.slice(0, 4).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 w-1 rounded-full transition-colors",
                  i === idx ? "bg-white" : "bg-white/50"
                )}
              />
            ))}
          </div>
          {/* Click zones for prev/next */}
          <button
            type="button"
            className="absolute inset-y-0 left-0 w-1/2 opacity-0"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdx((idx - 1 + count) % count); }}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 w-1/2 opacity-0"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdx((idx + 1) % count); }}
          />
        </>
      )}
    </div>
  );
}

// Property card component for chat
function ChatPropertyCard({ property }: { property: ChatProperty }) {
  const [saved, setSaved] = React.useState(false);
  const allImages = property.images?.length
    ? property.images
    : property.imageUrl
      ? [property.imageUrl]
      : [];

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch("/api/favorites", {
        method: saved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: property.slug }),
      });
      if (res.ok) setSaved(!saved);
    } catch {
      // silently fail if not logged in
    }
  };

  return (
    <div className={cn(
      "rounded-xl border bg-background min-w-[260px] max-w-[280px]",
      "hover:border-primary/30 hover:shadow-sm transition-all",
      "shrink-0"
    )}>
      <Link href={`/aanbod/${property.slug}`} className="flex gap-3 p-2.5">
        {/* Image with carousel */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
          <ChatImageCarousel images={allImages} alt={property.title} />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between min-w-0 flex-1">
          <div>
            <p className="text-xs font-semibold leading-tight truncate">{property.title}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-[11px] text-muted-foreground truncate">{property.city}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-bold text-primary">{property.price}</span>
            {property.area && (
              <span className="text-[10px] text-muted-foreground">{property.area}</span>
            )}
          </div>
        </div>
      </Link>
      {/* Action buttons */}
      <div className="flex border-t">
        <button
          onClick={handleSave}
          className={cn(
            "flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] transition-colors",
            "hover:bg-muted/50 rounded-bl-xl",
            saved ? "text-red-500" : "text-muted-foreground"
          )}
        >
          <Heart className="h-3 w-3" weight={saved ? "fill" : "regular"} />
          <span>{saved ? "Bewaard" : "Bewaren"}</span>
        </button>
        <div className="w-px bg-border" />
        <Link
          href={`/aanbod/${property.slug}#contact`}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] text-muted-foreground hover:bg-muted/50 hover:text-primary rounded-br-xl transition-colors"
        >
          <CalendarBlank className="h-3 w-3" />
          <span>Bezichtiging</span>
        </Link>
      </div>
    </div>
  );
}

// Static mini map for chat (OSM tile)
function ChatMiniMap({ properties }: { properties: ChatProperty[] }) {
  const withCoords = properties.filter((p) => p.lat && p.lng);
  if (withCoords.length === 0) return null;

  // Calculate center and zoom from properties
  const lats = withCoords.map((p) => p.lat!);
  const lngs = withCoords.map((p) => p.lng!);
  const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
  const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
  const zoom = withCoords.length === 1 ? 14 : 12;

  // Use OSM static map via openstreetmap embed
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${centerLng - 0.02},${centerLat - 0.01},${centerLng + 0.02},${centerLat + 0.01}&layer=mapnik&marker=${centerLat},${centerLng}`;

  return (
    <div className="mt-2 rounded-lg overflow-hidden border">
      <iframe
        src={mapUrl}
        width="100%"
        height="120"
        className="border-0"
        loading="lazy"
        title="Locatie"
      />
      <Link
        href={`/aanbod?view=map&lat=${centerLat}&lng=${centerLng}`}
        className="flex items-center justify-center gap-1 py-1.5 text-[11px] text-primary hover:bg-muted/50 transition-colors"
      >
        <MapPin className="h-3 w-3" />
        <span>Bekijk op grote kaart</span>
      </Link>
    </div>
  );
}

// Property cards row
function PropertyCards({ properties }: { properties: ChatProperty[] }) {
  return (
    <div className="mt-2 -mx-1">
      <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
        {properties.map((p) => (
          <ChatPropertyCard key={p.slug} property={p} />
        ))}
      </div>
      <ChatMiniMap properties={properties} />
      <div className="flex items-center gap-3 mt-1.5 ml-1">
        <Link
          href="/aanbod"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <span>Bekijk alle panden</span>
          <ArrowSquareOut className="h-3 w-3" />
        </Link>
        <span className="text-muted-foreground/30">|</span>
        <Link
          href="/contact"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          <Envelope className="h-3 w-3" />
          <span>Contact</span>
        </Link>
      </div>
    </div>
  );
}

// Copy button for messages
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-background/80 hover:bg-background border shadow-sm"
      title="Kopieer tekst"
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3 text-muted-foreground" />
      )}
    </button>
  );
}

// Simple markdown-ish rendering: bold, italic, bullet lists, links
function ChatMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <br key={i} />;

        // Bullet list items (- or * or •)
        const bulletMatch = trimmed.match(/^[-*•]\s+(.+)/);
        if (bulletMatch) {
          return (
            <div key={i} className="flex gap-1.5 ml-1">
              <span className="text-muted-foreground shrink-0">•</span>
              <span>{renderInline(bulletMatch[1])}</span>
            </div>
          );
        }

        // Numbered list items
        const numMatch = trimmed.match(/^(\d+)[.)]\s+(.+)/);
        if (numMatch) {
          return (
            <div key={i} className="flex gap-1.5 ml-1">
              <span className="text-muted-foreground shrink-0">{numMatch[1]}.</span>
              <span>{renderInline(numMatch[2])}</span>
            </div>
          );
        }

        return <p key={i}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // Process bold, italic, and links
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Link: [text](url)
    const linkMatch = remaining.match(/\[(.+?)\]\((.+?)\)/);

    // Find earliest match
    const boldIdx = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity;
    const linkIdx = linkMatch ? remaining.indexOf(linkMatch[0]) : Infinity;

    if (boldIdx === Infinity && linkIdx === Infinity) {
      parts.push(remaining);
      break;
    }

    if (boldIdx <= linkIdx && boldMatch) {
      if (boldIdx > 0) parts.push(remaining.slice(0, boldIdx));
      parts.push(<strong key={key++} className="font-semibold">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldIdx + boldMatch[0].length);
    } else if (linkMatch) {
      if (linkIdx > 0) parts.push(remaining.slice(0, linkIdx));
      parts.push(
        <a key={key++} href={linkMatch[2]} className="text-primary underline hover:no-underline" target="_blank" rel="noopener">
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkIdx + linkMatch[0].length);
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

// Typing indicator with bouncing dots
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3 rounded-bl-md">
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

// Quick reply buttons
function QuickReplies({
  replies,
  onSelect,
  disabled,
}: {
  replies: string[];
  onSelect: (text: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
      {replies.map((reply) => (
        <button
          key={reply}
          type="button"
          disabled={disabled}
          className={cn(
            "rounded-full border border-primary/30 bg-background px-3 py-1.5 text-xs font-medium",
            "text-primary hover:bg-primary/5 hover:border-primary/50",
            "active:scale-95 transition-all",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          onClick={() => onSelect(reply)}
        >
          {reply}
        </button>
      ))}
    </div>
  );
}

// Generate contextual quick replies based on the conversation
function getQuickReplies(content: string, messageIndex: number, totalMessages: number, hasProperties?: boolean): string[] {
  const lower = content.toLowerCase();

  // Welcome message
  if (messageIndex === 0) {
    return ["🍽️ Restaurants", "☕ Cafés", "🍺 Bars", "🏨 Hotels", "📍 Alle steden"];
  }

  // If bot showed property results
  if (hasProperties) {
    return ["📍 Andere stad", "💰 Goedkoper", "🔍 Andere types", "🔍 Nieuwe zoekopdracht"];
  }

  // If bot mentioned specific cities or is asking about location
  if (lower.includes("welke stad") || lower.includes("in welke")) {
    return ["📍 Amsterdam", "📍 Rotterdam", "📍 Utrecht", "📍 Den Haag", "📍 Andere stad"];
  }

  // If bot mentioned budget or pricing
  if (lower.includes("budget") || lower.includes("prijs") || lower.includes("kosten")) {
    return ["💰 Tot €2.000/mnd", "💰 €2.000-5.000", "💰 €5.000+", "🏷️ Te koop"];
  }

  // If bot showed results or mentioned panden
  if (lower.includes("gevonden") || lower.includes("beschikbaar") || lower.includes("panden")) {
    return ["📋 Meer details", "💰 Goedkoper", "📍 Andere stad", "🔍 Nieuwe zoekopdracht"];
  }

  // If bot mentioned a city
  const cities = ["amsterdam", "rotterdam", "utrecht", "den haag", "eindhoven", "groningen"];
  if (cities.some((c) => lower.includes(c))) {
    return ["🍽️ Restaurants", "☕ Cafés", "🍺 Bars", "📍 Andere stad"];
  }

  // If bot mentioned restaurants
  if (lower.includes("restaurant")) {
    return ["📍 In Amsterdam", "📍 In Rotterdam", "💰 Budget opties", "🔍 Andere types"];
  }

  // Default follow-up options
  if (totalMessages > 2) {
    return ["🔍 Nieuwe zoekopdracht", "📍 Alle steden", "❓ Meer info"];
  }

  return [];
}

// === WIZARD FLOW ===
interface WizardState {
  active: boolean;
  step: "type" | "city" | "budget" | "results";
  filters: {
    type?: string;
    typeLabel?: string;
    city?: string;
    budget?: string;
  };
}

const WIZARD_TYPES = [
  { label: "🍽️ Restaurant", value: "RESTAURANT" },
  { label: "☕ Café", value: "CAFE" },
  { label: "🍺 Bar", value: "BAR" },
  { label: "🏨 Hotel", value: "HOTEL" },
  { label: "🥪 Lunchroom", value: "LUNCHROOM" },
  { label: "🍕 Alle types", value: "" },
];

const WIZARD_CITIES = [
  "Amsterdam", "Rotterdam", "Utrecht", "Den Haag",
  "Eindhoven", "Groningen", "Alle steden",
];

const WIZARD_BUDGETS = [
  { label: "💰 Tot €2.000/mnd", value: "2000" },
  { label: "💰 €2.000 - €5.000", value: "5000" },
  { label: "💰 €5.000+", value: "99999" },
  { label: "🏷️ Te koop", value: "koop" },
  { label: "🤷 Maakt niet uit", value: "" },
];

export function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [userName, setUserName] = React.useState<string | null>(null);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [wizard, setWizard] = React.useState<WizardState>({
    active: false,
    step: "type",
    filters: {},
  });
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hoi! 👋 Ik ben de Horecagrond Assistent. Ik help je bij het vinden van het perfecte horecapand.\n\nWat wil je doen?",
      quickReplies: ["🔍 Pand zoeken", "💬 Stel een vraag", "📍 Alle steden"],
    },
  ]);

  // Fetch auth session on mount
  React.useEffect(() => {
    fetch("/api/auth/get-session")
      .then((r) => r.json())
      .then((data) => {
        if (data?.session?.user) {
          const user = data.session.user;
          setUserName(user.name || user.email?.split("@")[0] || null);
          setUserRole(user.role || null);

          // Update welcome message for logged-in users
          const isAgent = user.role === "agent";
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content: isAgent
                ? `Welkom terug, ${user.name || "makelaar"}! 🏢\n\nWat kan ik voor je doen?`
                : `Welkom terug, ${user.name || "daar"}! 👋\n\nWaarmee kan ik je helpen?`,
              quickReplies: isAgent
                ? ["📊 Mijn statistieken", "🏠 Mijn panden", "✍️ Beschrijving maken", "💬 Stel een vraag"]
                : ["🔍 Pand zoeken", "❤️ Mijn favorieten", "🔔 Mijn alerts", "💬 Stel een vraag"],
            },
          ]);
        }
      })
      .catch(() => {
        // Not logged in, keep default welcome
      });
  }, []);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input when chat opens
  React.useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Wizard step handler
  const handleWizardStep = async (choice: string) => {
    // Add user choice as message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: choice,
    };
    setMessages((prev) => prev.map((m): Message => ({ ...m, quickReplies: undefined })).concat(userMsg));

    if (wizard.step === "type") {
      const selected = WIZARD_TYPES.find((t) => t.label === choice);
      const newFilters = {
        ...wizard.filters,
        type: selected?.value || "",
        typeLabel: selected?.label || choice,
      };
      setWizard({ active: true, step: "city", filters: newFilters });

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `${selected?.label || "Top"} — goeie keuze! 👌\n\nIn welke stad zoek je?`,
        quickReplies: WIZARD_CITIES.map((c) => `📍 ${c}`),
      };
      setMessages((prev) => [...prev, botMsg]);
    } else if (wizard.step === "city") {
      const city = choice.replace("📍 ", "");
      const newFilters = {
        ...wizard.filters,
        city: city === "Alle steden" ? "" : city,
      };
      setWizard({ active: true, step: "budget", filters: newFilters });

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `${city === "Alle steden" ? "In heel Nederland" : city} — mooi! 🏙️\n\nWat is je budget?`,
        quickReplies: WIZARD_BUDGETS.map((b) => b.label),
      };
      setMessages((prev) => [...prev, botMsg]);
    } else if (wizard.step === "budget") {
      const selected = WIZARD_BUDGETS.find((b) => b.label === choice);
      const newFilters = { ...wizard.filters, budget: selected?.value || "" };
      setWizard({ active: true, step: "results", filters: newFilters });

      // Fetch results
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (newFilters.type) params.set("type", newFilters.type);
        if (newFilters.city) params.set("city", newFilters.city);
        if (newFilters.budget && newFilters.budget !== "koop" && newFilters.budget !== "99999") {
          params.set("maxPrice", newFilters.budget);
        }

        const res = await fetch(`/api/chat/wizard?${params.toString()}`);
        const data = await res.json();

        const summary = [
          newFilters.typeLabel || "Alle types",
          newFilters.city || "heel Nederland",
          selected?.label || "",
        ]
          .filter(Boolean)
          .join(" • ");

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.properties?.length > 0
              ? `🎉 **${data.count} panden gevonden!**\n\n${summary}\n\nHier zijn de beste matches:`
              : `Helaas, geen panden gevonden voor ${summary}.\n\nProbeer andere filters!`,
            properties: data.properties || [],
            quickReplies: [
              "🔍 Opnieuw zoeken",
              "💬 Stel een vraag",
              ...(newFilters.city ? ["📍 Andere stad"] : []),
            ],
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Sorry, er ging iets mis bij het zoeken. Probeer het opnieuw!",
            quickReplies: ["🔍 Opnieuw zoeken"],
          },
        ]);
      } finally {
        setIsLoading(false);
        setWizard({ active: false, step: "type", filters: {} });
      }
    }
  };

  // Check if message needs auth
  const needsAuth = (text: string): boolean => {
    const authKeywords = ["bewaar", "favoriet", "opslaan", "alert", "melding", "mijn panden", "profiel"];
    return authKeywords.some((k) => text.toLowerCase().includes(k));
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Check if auth needed (only for logged-out users)
    if (!userName && needsAuth(text)) {
      const userMsg: Message = { id: Date.now().toString(), role: "user", content: text.trim() };
      const authMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Om panden te bewaren en alerts in te stellen, heb je een account nodig. Het is gratis en duurt maar 30 seconden! 🚀",
        quickReplies: ["🔑 Inloggen", "📝 Account aanmaken", "🔍 Verder zoeken"],
      };
      setMessages((prev) => prev.map((m): Message => ({ ...m, quickReplies: undefined })).concat(userMsg, authMsg));
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };

    // Remove quick replies from previous messages
    setMessages((prev) =>
      prev.map((m): Message => ({ ...m, quickReplies: undefined })).concat(userMessage)
    );
    setInput("");
    setIsLoading(true);

    try {
      const allMessages = [...messages, userMessage];
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Chat niet beschikbaar");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      const assistantId = (Date.now() + 1).toString();

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantContent += decoder.decode(value, { stream: true });
          // Parse out properties marker during streaming (show only text part)
          const { text: visibleText } = parsePropertiesFromContent(assistantContent);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: visibleText } : m
            )
          );
        }
      }

      // Parse properties from final content
      const { text: finalText, properties } = parsePropertiesFromContent(assistantContent);

      // Add quick replies and properties after streaming completes
      const msgIndex = allMessages.length;
      const quickReplies = getQuickReplies(finalText, msgIndex, allMessages.length + 1, properties.length > 0);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: finalText,
                ...(quickReplies.length > 0 ? { quickReplies } : {}),
                ...(properties.length > 0 ? { properties } : {}),
              }
            : m
        )
      );
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, er ging iets mis. Probeer het later opnieuw.",
          quickReplies: ["🔄 Opnieuw proberen"],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const handleQuickReply = async (text: string) => {
    // Dashboard redirects (logged in users)
    if (text === "❤️ Mijn favorieten") {
      window.location.href = "/dashboard/favorieten";
      return;
    }
    if (text === "🔔 Mijn alerts") {
      window.location.href = "/dashboard/alerts";
      return;
    }
    if (text === "🏠 Mijn panden") {
      window.location.href = "/dashboard/panden";
      return;
    }
    if (text === "📊 Mijn statistieken") {
      window.location.href = "/dashboard/analytics";
      return;
    }

    // Auth redirects
    if (text === "🔑 Inloggen") {
      window.location.href = "/sign-in";
      return;
    }
    if (text === "📝 Account aanmaken") {
      window.location.href = "/sign-up";
      return;
    }
    if (text === "🔍 Verder zoeken") {
      // Just continue normal chat
      return;
    }

    // Browse all cities (only redirect for "Alle steden", "Andere stad" goes to chat)
    if (text === "📍 Alle steden") {
      window.location.href = "/steden";
      return;
    }

    // AI description generator for makelaars
    if (text === "✍️ Beschrijving maken") {
      const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Ik help je een professionele pandbeschrijving te maken! ✍️\n\nGeef me de details van je pand:\n- **Type** (restaurant, café, bar, etc.)\n- **Locatie** (stad, buurt)\n- **Oppervlakte** en **zitplaatsen**\n- **Bijzonderheden** (terras, keuken, vergunningen)\n\nBijvoorbeeld: *\"Restaurant in Amsterdam Zuid, 180m², 60 zitplaatsen, groot terras, professionele keuken\"*",
        quickReplies: ["🍽️ Restaurant voorbeeld", "☕ Café voorbeeld", "🍺 Bar voorbeeld"],
      };
      setMessages((prev) => prev.map((m): Message => ({ ...m, quickReplies: undefined })).concat(userMsg, botMsg));
      return;
    }
    if (text === "🍽️ Restaurant voorbeeld" || text === "☕ Café voorbeeld" || text === "🍺 Bar voorbeeld") {
      const examples: Record<string, string> = {
        "🍽️ Restaurant voorbeeld": "Maak een beschrijving voor een restaurant in Amsterdam, 200m², 80 zitplaatsen, met terras aan de gracht, volledig ingerichte professionele keuken, bestaande horecavergunning",
        "☕ Café voorbeeld": "Maak een beschrijving voor een café in Utrecht centrum, 120m², 40 zitplaatsen binnen, klein terras, espressomachine, verse gebakjes",
        "🍺 Bar voorbeeld": "Maak een beschrijving voor een cocktailbar in Rotterdam, 150m², industrieel interieur, twee bars, geluidsinstallatie, rookruimte",
      };
      await sendMessage(examples[text] || text);
      return;
    }

    // Context-aware follow-ups — send as natural language to LLM
    if (text === "📍 Andere stad") {
      await sendMessage("Laat dezelfde soort panden zien maar dan in een andere stad");
      return;
    }
    if (text === "💰 Goedkoper") {
      await sendMessage("Heb je ook goedkopere opties?");
      return;
    }
    if (text === "🔍 Andere types") {
      await sendMessage("Wat voor andere types panden zijn er beschikbaar?");
      return;
    }
    if (text === "📋 Meer details") {
      await sendMessage("Kun je meer details geven over deze panden?");
      return;
    }
    if (text === "💰 Budget opties") {
      await sendMessage("Wat zijn de goedkoopste opties?");
      return;
    }

    // Free-form chat mode
    if (text === "💬 Stel een vraag") {
      const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Stel je vraag! Ik weet alles over horecapanden, locaties, vergunningen en meer. 💡",
      };
      setMessages((prev) => prev.map((m): Message => ({ ...m, quickReplies: undefined })).concat(userMsg, botMsg));
      return;
    }

    // Start wizard
    if (text === "🔍 Pand zoeken" || text === "🔍 Opnieuw zoeken" || text === "🔍 Nieuwe zoekopdracht") {
      setWizard({ active: true, step: "type", filters: {} });
      const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Laten we je droomlocatie vinden! 🏢\n\nWat voor type pand zoek je?",
        quickReplies: WIZARD_TYPES.map((t) => t.label),
      };
      setMessages((prev) => prev.map((m): Message => ({ ...m, quickReplies: undefined })).concat(userMsg, botMsg));
      return;
    }

    // Wizard flow
    if (wizard.active) {
      await handleWizardStep(text);
      return;
    }

    // Normal chat
    await sendMessage(text);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center",
            "rounded-full bg-primary text-primary-foreground shadow-lg",
            "hover:scale-105 active:scale-95 transition-transform"
          )}
        >
          <ChatCircleDots className="h-6 w-6" weight="fill" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <>
        {/* Mobile backdrop */}
        <div className="fixed inset-0 z-40 bg-background sm:hidden" />
        <div
          className={cn(
            "fixed z-50 flex flex-col border bg-background shadow-2xl",
            "animate-in slide-in-from-bottom-5 fade-in duration-200",
            // Desktop: floating card
            "sm:bottom-6 sm:right-6 sm:w-[400px] sm:max-h-[600px] sm:rounded-2xl",
            // Mobile: fullscreen
            "max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:rounded-none"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <ChatCircleDots className="h-4 w-4 text-primary" weight="fill" />
              </div>
              <div>
                <p className="text-sm font-semibold">Horecagrond Assistent</p>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "Aan het typen..." : "Online"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 min-h-0" ref={scrollRef}>
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed relative group",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      )}
                    >
                      {message.role === "assistant" ? (
                        <ChatMarkdown content={message.content} />
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                      {/* Copy button for long assistant messages */}
                      {message.role === "assistant" && message.content.length > 100 && (
                        <CopyButton text={message.content} />
                      )}
                    </div>
                  </div>

                  {/* Property cards */}
                  {message.role === "assistant" && message.properties && message.properties.length > 0 && (
                    <PropertyCards properties={message.properties} />
                  )}

                  {/* Quick replies under this message */}
                  {message.role === "assistant" && message.quickReplies && message.quickReplies.length > 0 && (
                    <QuickReplies
                      replies={message.quickReplies}
                      onSelect={handleQuickReply}
                      disabled={isLoading}
                    />
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <TypingIndicator />
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t p-3">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Typ je vraag..."
              className="flex-1 rounded-xl border-0 bg-muted text-sm focus-visible:ring-0"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-xl"
              disabled={isLoading || !input.trim()}
            >
              <PaperPlaneTilt className="h-4 w-4" weight="fill" />
            </Button>
          </form>
        </div>
        </>
      )}
    </>
  );
}
