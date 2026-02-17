"use client";

import * as React from "react";
import {
  ChatCircleDots,
  PaperPlaneTilt,
  X,
  MapPin,
  ArrowSquareOut,
  Buildings,
  Envelope,
  Heart,
  CalendarBlank,
  Copy,
  Check,
  Scales,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// Constants
// ============================================================================

const typeLabels: Record<string, string> = {
  RESTAURANT: "Restaurant",
  CAFE: "Cafe",
  BAR: "Bar",
  HOTEL: "Hotel",
  LUNCHROOM: "Lunchroom",
  DARK_KITCHEN: "Dark Kitchen",
  BAKERY: "Bakkerij",
  BISTRO: "Bistro",
  GRAND_CAFE: "Grand Cafe",
  EETCAFE: "Eetcafe",
  PARTY_CENTER: "Partycentrum",
};

const WIZARD_TYPES = [
  { label: "Restaurant", value: "RESTAURANT" },
  { label: "Cafe", value: "CAFE" },
  { label: "Bar", value: "BAR" },
  { label: "Hotel", value: "HOTEL" },
  { label: "Lunchroom", value: "LUNCHROOM" },
  { label: "Alle types", value: "" },
];

const WIZARD_CITIES = [
  "Amsterdam",
  "Rotterdam",
  "Utrecht",
  "Den Haag",
  "Eindhoven",
  "Groningen",
  "Alle steden",
];

const WIZARD_BUDGETS = [
  { label: "Tot 2.000/mnd", value: "2000" },
  { label: "2.000 - 5.000", value: "5000" },
  { label: "5.000+", value: "99999" },
  { label: "Te koop", value: "koop" },
  { label: "Maakt niet uit", value: "" },
];

// ============================================================================
// Helper: Extract text from UIMessage parts
// ============================================================================

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

// ============================================================================
// Helper: Extract tool results (property search) from UIMessage parts
// ============================================================================

function getToolProperties(message: UIMessage): ChatProperty[] {
  for (const part of message.parts) {
    if (
      part.type === "tool-invocation" &&
      "toolName" in part &&
      (part as any).toolName === "searchProperties" &&
      "state" in part &&
      (part as any).state === "result" &&
      "result" in part &&
      Array.isArray((part as any).result)
    ) {
      return (part as any).result as ChatProperty[];
    }
  }
  return [];
}

// ============================================================================
// Sub-components
// ============================================================================

function ChatImageCarousel({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
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
      <Image
        src={images[idx]}
        alt={alt}
        fill
        className="object-cover"
        sizes="80px"
      />
      {count > 1 && (
        <>
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
          <button
            type="button"
            className="absolute inset-y-0 left-0 w-1/2 opacity-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIdx((idx - 1 + count) % count);
            }}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 w-1/2 opacity-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIdx((idx + 1) % count);
            }}
          />
        </>
      )}
    </div>
  );
}

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
    <div
      className={cn(
        "rounded-xl border bg-background min-w-[260px] max-w-[280px]",
        "hover:border-primary/30 hover:shadow-sm transition-all",
        "shrink-0"
      )}
    >
      <Link href={`/aanbod/${property.slug}`} className="flex gap-3 p-2.5">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
          <ChatImageCarousel images={allImages} alt={property.title} />
        </div>
        <div className="flex flex-col justify-between min-w-0 flex-1">
          <div>
            <p className="text-xs font-semibold leading-tight truncate">
              {property.title}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-[11px] text-muted-foreground truncate">
                {property.city}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-bold text-primary">
              {property.price}
            </span>
            {property.area && (
              <span className="text-[10px] text-muted-foreground">
                {property.area}
              </span>
            )}
          </div>
        </div>
      </Link>
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

function ChatMiniMap({ properties }: { properties: ChatProperty[] }) {
  const withCoords = properties.filter((p) => p.lat && p.lng);
  if (withCoords.length === 0) return null;

  const lats = withCoords.map((p) => p.lat!);
  const lngs = withCoords.map((p) => p.lng!);
  const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
  const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

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

function ChatCompareTable({
  properties,
  onClose,
}: {
  properties: ChatProperty[];
  onClose: () => void;
}) {
  if (properties.length < 2) return null;
  const items = properties.slice(0, 3);
  const rows = [
    { label: "Prijs", key: "price" as const },
    { label: "Stad", key: "city" as const },
    { label: "Type", key: "type" as const },
    { label: "Oppervlakte", key: "area" as const },
  ];

  return (
    <div className="mt-2 rounded-lg border overflow-hidden">
      <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5">
        <span className="text-[11px] font-medium flex items-center gap-1">
          <Scales className="h-3 w-3" /> Vergelijking
        </span>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left text-muted-foreground font-normal w-20" />
              {items.map((p) => (
                <th
                  key={p.slug}
                  className="p-2 text-left font-semibold max-w-[100px]"
                >
                  <Link
                    href={`/aanbod/${p.slug}`}
                    className="hover:text-primary truncate block"
                  >
                    {p.title.length > 20
                      ? p.title.substring(0, 20) + "..."
                      : p.title}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b last:border-0">
                <td className="p-2 text-muted-foreground">{row.label}</td>
                {items.map((p) => (
                  <td key={p.slug} className="p-2">
                    {row.key === "type"
                      ? typeLabels[p[row.key]] || p[row.key]
                      : p[row.key] || "--"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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

// ============================================================================
// Markdown renderer
// ============================================================================

function ChatMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <br key={i} />;

        const bulletMatch = trimmed.match(/^[-*]\s+(.+)/);
        if (bulletMatch) {
          return (
            <div key={i} className="flex gap-1.5 ml-1">
              <span className="text-muted-foreground shrink-0">-</span>
              <span>{renderInline(bulletMatch[1])}</span>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+)[.)]\s+(.+)/);
        if (numMatch) {
          return (
            <div key={i} className="flex gap-1.5 ml-1">
              <span className="text-muted-foreground shrink-0">
                {numMatch[1]}.
              </span>
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
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const linkMatch = remaining.match(/\[(.+?)\]\((.+?)\)/);

    const boldIdx = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity;
    const linkIdx = linkMatch ? remaining.indexOf(linkMatch[0]) : Infinity;

    if (boldIdx === Infinity && linkIdx === Infinity) {
      parts.push(remaining);
      break;
    }

    if (boldIdx <= linkIdx && boldMatch) {
      if (boldIdx > 0) parts.push(remaining.slice(0, boldIdx));
      parts.push(
        <strong key={key++} className="font-semibold">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldIdx + boldMatch[0].length);
    } else if (linkMatch) {
      if (linkIdx > 0) parts.push(remaining.slice(0, linkIdx));
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          className="text-primary underline hover:no-underline"
          target="_blank"
          rel="noopener"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkIdx + linkMatch[0].length);
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

// ============================================================================
// Quick reply generation
// ============================================================================

function getQuickReplies(content: string, hasProperties: boolean): string[] {
  const lower = content.toLowerCase();

  if (hasProperties) {
    return ["Vergelijk", "Andere stad", "Goedkoper", "Nieuwe zoekopdracht"];
  }

  if (lower.includes("welke stad") || lower.includes("in welke")) {
    return ["Amsterdam", "Rotterdam", "Utrecht", "Den Haag", "Andere stad"];
  }

  if (
    lower.includes("budget") ||
    lower.includes("prijs") ||
    lower.includes("kosten")
  ) {
    return ["Tot 2.000/mnd", "2.000-5.000", "5.000+", "Te koop"];
  }

  if (
    lower.includes("gevonden") ||
    lower.includes("beschikbaar") ||
    lower.includes("panden")
  ) {
    return ["Meer details", "Goedkoper", "Andere stad", "Nieuwe zoekopdracht"];
  }

  return [];
}

// ============================================================================
// Main Component
// ============================================================================

export function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [userName, setUserName] = React.useState<string | null>(null);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [compareItems, setCompareItems] = React.useState<ChatProperty[]>([]);
  const [showCompare, setShowCompare] = React.useState(false);
  const [wizard, setWizard] = React.useState<WizardState>({
    active: false,
    step: "type",
    filters: {},
  });

  // Local messages for wizard flow and quick replies (non-AI messages)
  const [localMessages, setLocalMessages] = React.useState<
    Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
      quickReplies?: string[];
      properties?: ChatProperty[];
    }>
  >([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hoi! Ik ben de Horecagrond Assistent. Ik help je bij het vinden van het perfecte horecapand.\n\nWat wil je doen?",
      quickReplies: ["Pand zoeken", "Stel een vraag", "Alle steden"],
    },
  ]);

  // AI SDK useChat hook
  const { messages: aiMessages, sendMessage, status } = useChat({
    id: "horecagrond-chat",
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Fetch auth session on mount
  React.useEffect(() => {
    fetch("/api/auth/get-session")
      .then((r) => r.json())
      .then((data) => {
        if (data?.session?.user) {
          const user = data.session.user;
          setUserName(user.name || user.email?.split("@")[0] || null);
          setUserRole(user.role || null);

          const isAgent = user.role === "agent";
          setLocalMessages([
            {
              id: "welcome",
              role: "assistant",
              content: isAgent
                ? `Welkom terug, ${user.name || "makelaar"}!\n\nWat kan ik voor je doen?`
                : `Welkom terug, ${user.name || "daar"}!\n\nWaarmee kan ik je helpen?`,
              quickReplies: isAgent
                ? [
                    "Mijn statistieken",
                    "Mijn panden",
                    "Beschrijving maken",
                    "Stel een vraag",
                  ]
                : [
                    "Pand zoeken",
                    "Mijn favorieten",
                    "Mijn alerts",
                    "Stel een vraag",
                  ],
            },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-scroll
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages, aiMessages, isLoading]);

  // Focus input when chat opens
  React.useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Combine local + AI messages for rendering
  const allMessages = React.useMemo(() => {
    const combined: Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
      quickReplies?: string[];
      properties?: ChatProperty[];
    }> = [];

    // Local messages first
    for (const m of localMessages) {
      combined.push(m);
    }

    // Then AI messages
    for (const m of aiMessages) {
      const text = getMessageText(m);
      const properties = getToolProperties(m);
      const quickReplies =
        m.role === "assistant" && text
          ? getQuickReplies(text, properties.length > 0)
          : [];

      combined.push({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: text,
        properties: properties.length > 0 ? properties : undefined,
        quickReplies: quickReplies.length > 0 ? quickReplies : undefined,
      });
    }

    return combined;
  }, [localMessages, aiMessages]);

  // Add a local message pair (user + bot)
  const addLocalExchange = (
    userText: string,
    botContent: string,
    options?: {
      quickReplies?: string[];
      properties?: ChatProperty[];
    }
  ) => {
    const msgs: typeof localMessages = [];
    if (userText) {
      msgs.push({
        id: Date.now().toString(),
        role: "user",
        content: userText,
      });
    }
    msgs.push({
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: botContent,
      ...options,
    });

    setLocalMessages((prev) => [
      ...prev.map((m) => ({ ...m, quickReplies: undefined })),
      ...msgs,
    ]);
  };

  // Send message to AI
  const sendToAi = async (text: string) => {
    // Clear quick replies from local messages
    setLocalMessages((prev) =>
      prev.map((m) => ({ ...m, quickReplies: undefined }))
    );
    await sendMessage({ text });
  };

  // ========== Wizard Flow ==========
  const handleWizardStep = async (choice: string) => {
    if (wizard.step === "type") {
      const selected = WIZARD_TYPES.find((t) => t.label === choice);
      setWizard({
        active: true,
        step: "city",
        filters: {
          type: selected?.value || "",
          typeLabel: selected?.label || choice,
        },
      });
      addLocalExchange(
        choice,
        `${selected?.label || "Top"} -- goeie keuze!\n\nIn welke stad zoek je?`,
        { quickReplies: WIZARD_CITIES }
      );
    } else if (wizard.step === "city") {
      const city = choice;
      setWizard((prev) => ({
        active: true,
        step: "budget",
        filters: {
          ...prev.filters,
          city: city === "Alle steden" ? "" : city,
        },
      }));
      addLocalExchange(
        choice,
        `${city === "Alle steden" ? "In heel Nederland" : city} -- mooi!\n\nWat is je budget?`,
        { quickReplies: WIZARD_BUDGETS.map((b) => b.label) }
      );
    } else if (wizard.step === "budget") {
      const selected = WIZARD_BUDGETS.find((b) => b.label === choice);
      const filters = { ...wizard.filters, budget: selected?.value || "" };

      // Clear quick replies and add user choice
      setLocalMessages((prev) => [
        ...prev.map((m) => ({ ...m, quickReplies: undefined })),
        { id: Date.now().toString(), role: "user" as const, content: choice },
      ]);

      // Build search query and send to AI with tools
      const parts: string[] = [];
      if (filters.typeLabel && filters.typeLabel !== "Alle types") {
        parts.push(filters.typeLabel);
      }
      if (filters.city) {
        parts.push(`in ${filters.city}`);
      }
      if (
        filters.budget &&
        filters.budget !== "koop" &&
        filters.budget !== "99999"
      ) {
        parts.push(`tot ${filters.budget} euro per maand`);
      }

      setWizard({ active: false, step: "type", filters: {} });

      // Send the constructed search query to the AI with tools
      await sendMessage({
        text: `Zoek ${parts.join(" ") || "horecapanden"}`,
      });
    }
  };

  // ========== Quick Reply Handler ==========
  const handleQuickReply = async (text: string) => {
    // Dashboard redirects
    if (text === "Mijn favorieten") {
      window.location.href = "/dashboard/favorieten";
      return;
    }
    if (text === "Mijn alerts") {
      window.location.href = "/dashboard/alerts";
      return;
    }
    if (text === "Mijn panden") {
      window.location.href = "/dashboard/panden";
      return;
    }
    if (text === "Alle steden") {
      window.location.href = "/steden";
      return;
    }
    if (text === "Meer analytics") {
      window.location.href = "/dashboard/analytics";
      return;
    }

    // Stats (inline)
    if (text === "Mijn statistieken") {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const stats = await res.json();
          addLocalExchange(
            text,
            `**Jouw dashboard overzicht:**\n\n- **${stats.properties || 0}** actieve panden\n- **${stats.views || 0}** views deze maand\n- **${stats.inquiries || 0}** aanvragen\n- **${stats.favorites || 0}** keer als favoriet bewaard`,
            {
              quickReplies: ["Mijn panden", "Meer analytics", "Pand zoeken"],
            }
          );
          return;
        }
      } catch {
        // fallback
      }
      addLocalExchange(
        text,
        "Ga naar je dashboard voor uitgebreide statistieken!",
        { quickReplies: ["Meer analytics"] }
      );
      return;
    }

    // Auth redirects
    if (text === "Inloggen") {
      addLocalExchange(
        text,
        "Je kunt inloggen via onze inlogpagina. Na het inloggen kom je automatisch terug!",
        {
          quickReplies: [
            "Naar inlogpagina",
            "Account aanmaken",
            "Verder zoeken",
          ],
        }
      );
      return;
    }
    if (text === "Naar inlogpagina") {
      window.location.href = "/sign-in";
      return;
    }
    if (text === "Account aanmaken") {
      addLocalExchange(
        text,
        "Super! Met een account kun je:\n\n- Panden **bewaren** als favoriet\n- **Alerts** instellen voor nieuwe matches\n- **Statistieken** bekijken (makelaars)\n\nBen je een ondernemer of makelaar?",
        { quickReplies: ["Ik zoek een pand", "Ik ben makelaar"] }
      );
      return;
    }
    if (text === "Ik zoek een pand") {
      window.location.href = "/sign-up?role=seeker";
      return;
    }
    if (text === "Ik ben makelaar") {
      window.location.href = "/sign-up?role=agent";
      return;
    }
    if (text === "Verder zoeken") return;

    // Compare mode
    if (text === "Vergelijk") {
      const lastWithProps = [...allMessages]
        .reverse()
        .find((m) => m.properties && m.properties.length >= 2);
      if (lastWithProps?.properties) {
        setCompareItems(lastWithProps.properties.slice(0, 3));
        setShowCompare(true);
        addLocalExchange(
          text,
          `Hier is een vergelijking van ${Math.min(lastWithProps.properties.length, 3)} panden:`,
          { quickReplies: ["Nieuwe zoekopdracht", "Stel een vraag"] }
        );
      }
      return;
    }

    // AI description generator for makelaars
    if (text === "Beschrijving maken") {
      addLocalExchange(
        text,
        'Ik help je een professionele pandbeschrijving te maken!\n\nGeef me de details van je pand:\n- **Type** (restaurant, cafe, bar, etc.)\n- **Locatie** (stad, buurt)\n- **Oppervlakte** en **zitplaatsen**\n- **Bijzonderheden** (terras, keuken, vergunningen)\n\nBijvoorbeeld: *"Restaurant in Amsterdam Zuid, 180m2, 60 zitplaatsen, groot terras, professionele keuken"*',
        {
          quickReplies: [
            "Restaurant voorbeeld",
            "Cafe voorbeeld",
            "Bar voorbeeld",
          ],
        }
      );
      return;
    }
    if (
      text === "Restaurant voorbeeld" ||
      text === "Cafe voorbeeld" ||
      text === "Bar voorbeeld"
    ) {
      const examples: Record<string, string> = {
        "Restaurant voorbeeld":
          "Maak een beschrijving voor een restaurant in Amsterdam, 200m2, 80 zitplaatsen, met terras aan de gracht, volledig ingerichte professionele keuken, bestaande horecavergunning",
        "Cafe voorbeeld":
          "Maak een beschrijving voor een cafe in Utrecht centrum, 120m2, 40 zitplaatsen binnen, klein terras, espressomachine, verse gebakjes",
        "Bar voorbeeld":
          "Maak een beschrijving voor een cocktailbar in Rotterdam, 150m2, industrieel interieur, twee bars, geluidsinstallatie, rookruimte",
      };
      await sendToAi(examples[text] || text);
      return;
    }

    // Context-aware follow-ups via AI
    if (text === "Andere stad") {
      await sendToAi(
        "Laat dezelfde soort panden zien maar dan in een andere stad"
      );
      return;
    }
    if (text === "Goedkoper") {
      await sendToAi("Heb je ook goedkopere opties?");
      return;
    }
    if (text === "Andere types") {
      await sendToAi("Wat voor andere types panden zijn er beschikbaar?");
      return;
    }
    if (text === "Meer details") {
      await sendToAi("Kun je meer details geven over deze panden?");
      return;
    }
    if (text === "Budget opties") {
      await sendToAi("Wat zijn de goedkoopste opties?");
      return;
    }

    // Free-form chat
    if (text === "Stel een vraag") {
      addLocalExchange(
        text,
        "Stel je vraag! Ik weet alles over horecapanden, locaties, vergunningen en meer."
      );
      return;
    }

    // Start wizard
    if (
      text === "Pand zoeken" ||
      text === "Opnieuw zoeken" ||
      text === "Nieuwe zoekopdracht"
    ) {
      setWizard({ active: true, step: "type", filters: {} });
      addLocalExchange(
        text,
        "Laten we je droomlocatie vinden!\n\nWat voor type pand zoek je?",
        { quickReplies: WIZARD_TYPES.map((t) => t.label) }
      );
      return;
    }

    // Wizard flow
    if (wizard.active) {
      await handleWizardStep(text);
      return;
    }

    // Default: send to AI
    await sendToAi(text);
  };

  // Check if message needs auth
  const needsAuth = (text: string): boolean => {
    const authKeywords = [
      "bewaar",
      "favoriet",
      "opslaan",
      "alert",
      "melding",
      "mijn panden",
      "profiel",
    ];
    return authKeywords.some((k) => text.toLowerCase().includes(k));
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isLoading) return;

    setInputValue("");

    // Check if auth needed
    if (!userName && needsAuth(text)) {
      addLocalExchange(
        text,
        "Om panden te bewaren en alerts in te stellen, heb je een account nodig. Het is gratis en duurt maar 30 seconden!",
        { quickReplies: ["Inloggen", "Account aanmaken", "Verder zoeken"] }
      );
      return;
    }

    // Wizard flow
    if (wizard.active) {
      await handleWizardStep(text);
      return;
    }

    // Send to AI
    await sendToAi(text);
  };

  // ========== Render ==========
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
              "sm:bottom-6 sm:right-6 sm:w-[400px] sm:max-h-[600px] sm:rounded-2xl",
              "max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:rounded-none"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <ChatCircleDots
                    className="h-4 w-4 text-primary"
                    weight="fill"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Horecagrond Assistent
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isLoading ? "Aan het typen..." : "Online"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 min-h-0" ref={scrollRef}>
              <div className="space-y-3">
                {allMessages.map((message) => (
                  <div key={message.id}>
                    <div
                      className={cn(
                        "flex",
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      )}
                    >
                      {message.content && (
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
                            <p className="whitespace-pre-wrap">
                              {message.content}
                            </p>
                          )}
                          {message.role === "assistant" &&
                            message.content.length > 100 && (
                              <CopyButton text={message.content} />
                            )}
                        </div>
                      )}
                    </div>

                    {/* Property cards */}
                    {message.role === "assistant" &&
                      message.properties &&
                      message.properties.length > 0 && (
                        <PropertyCards properties={message.properties} />
                      )}

                    {/* Quick replies */}
                    {message.role === "assistant" &&
                      message.quickReplies &&
                      message.quickReplies.length > 0 && (
                        <QuickReplies
                          replies={message.quickReplies}
                          onSelect={handleQuickReply}
                          disabled={isLoading}
                        />
                      )}
                  </div>
                ))}

                {/* Compare table */}
                {showCompare && compareItems.length >= 2 && (
                  <ChatCompareTable
                    properties={compareItems}
                    onClose={() => setShowCompare(false)}
                  />
                )}

                {/* Typing indicator */}
                {isLoading && <TypingIndicator />}
              </div>
            </ScrollArea>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t p-3"
            >
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Typ je vraag..."
                className="flex-1 rounded-xl border-0 bg-muted text-sm focus-visible:ring-0"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-xl"
                disabled={isLoading || !inputValue.trim()}
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
