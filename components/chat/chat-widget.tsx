"use client";

import * as React from "react";
import {
  ChatCircleDots,
  CircleNotch,
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

const CHAT_FALLBACK_ERROR_MESSAGE =
  "Ik krijg nu geen antwoord van de server. Probeer het opnieuw over een paar seconden.";
const CHAT_RETRY_QUICK_REPLY = "Opnieuw proberen";
const CHAT_WIDGET_PANEL_ID = "horecagrond-chat-widget-panel";

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
    <div className="flex justify-start" aria-live="polite" aria-label="Assistent typt">
      <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-border/60 bg-muted/55 px-3.5 py-2.5 shadow-sm">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/12 text-primary">
          <ChatCircleDots className="h-3.5 w-3.5" weight="fill" />
        </span>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-primary/75 animate-bounce [animation-delay:-200ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary/75 animate-bounce [animation-delay:-100ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary/75 animate-bounce" />
        </div>
        <span className="text-xs text-muted-foreground">Assistent typt…</span>
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
    <div className="mt-2 ml-1 flex flex-wrap gap-2 pb-1">
      {replies.map((reply) => (
        <button
          key={reply}
          type="button"
          disabled={disabled}
          className={cn(
            "inline-flex min-h-11 items-center justify-center rounded-full border px-3.5 py-1.5 text-xs font-semibold leading-none sm:min-h-9",
            "border-primary/25 bg-primary/[0.06] text-primary",
            "shadow-[0_1px_0_0_rgba(255,255,255,0.65)_inset]",
            "hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/[0.12]",
            "active:translate-y-0 active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
            "touch-manipulation transition-all duration-200",
            "disabled:pointer-events-none disabled:opacity-50"
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

  const [isAssistantThinking, setIsAssistantThinking] = React.useState(false);
  const [pendingAssistantBaseline, setPendingAssistantBaseline] =
    React.useState<number | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const triggerButtonRef = React.useRef<HTMLButtonElement>(null);
  const lastSentPromptRef = React.useRef<string | null>(null);
  const sawTransportActivityRef = React.useRef(false);
  const responseTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const closeChat = React.useCallback(() => {
    setOpen(false);
    setTimeout(() => triggerButtonRef.current?.focus(), 0);
  }, []);

  const appendAssistantError = React.useCallback(() => {
    setLocalMessages((prev) => {
      const lastMessage = prev[prev.length - 1];
      if (
        lastMessage?.role === "assistant" &&
        lastMessage.content === CHAT_FALLBACK_ERROR_MESSAGE
      ) {
        return prev;
      }

      return [
        ...prev,
        {
          id: `${Date.now()}-chat-error`,
          role: "assistant",
          content: CHAT_FALLBACK_ERROR_MESSAGE,
          quickReplies: [CHAT_RETRY_QUICK_REPLY, "Nieuwe zoekopdracht"],
        },
      ];
    });
  }, []);

  // AI SDK useChat hook
  const { messages: aiMessages, sendMessage, status } = useChat({
    id: "horecagrond-chat",
    onError: () => {
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
        responseTimeoutRef.current = null;
      }
      sawTransportActivityRef.current = false;
      setPendingAssistantBaseline(null);
      setIsAssistantThinking(false);
      appendAssistantError();
    },
  });

  const isLoading = status === "streaming" || status === "submitted";
  const assistantMessageCount = React.useMemo(
    () => aiMessages.filter((message) => message.role === "assistant").length,
    [aiMessages]
  );
  const isBusy = isLoading || isAssistantThinking;

  React.useEffect(() => {
    return () => {
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (!open) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeChat();
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [open, closeChat]);

  React.useEffect(() => {
    if (status === "submitted" || status === "streaming") {
      sawTransportActivityRef.current = true;
      return;
    }

    if (!isAssistantThinking || pendingAssistantBaseline === null) {
      return;
    }

    // Avoid premature fallback before transport starts updating status.
    if (!sawTransportActivityRef.current) {
      return;
    }

    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
      responseTimeoutRef.current = null;
    }

    if (assistantMessageCount <= pendingAssistantBaseline) {
      appendAssistantError();
    }

    sawTransportActivityRef.current = false;
    setPendingAssistantBaseline(null);
    setIsAssistantThinking(false);
  }, [
    status,
    assistantMessageCount,
    appendAssistantError,
    isAssistantThinking,
    pendingAssistantBaseline,
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

  // Auto-scroll
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages, aiMessages, isBusy]);

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
    lastSentPromptRef.current = text;

    // Clear quick replies from local messages
    setLocalMessages((prev) =>
      prev.map((m) => ({ ...m, quickReplies: undefined }))
    );
    sawTransportActivityRef.current = false;
    setPendingAssistantBaseline(assistantMessageCount);
    setIsAssistantThinking(true);

    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
    }

    responseTimeoutRef.current = setTimeout(() => {
      sawTransportActivityRef.current = false;
      setPendingAssistantBaseline(null);
      setIsAssistantThinking(false);
      appendAssistantError();
      responseTimeoutRef.current = null;
    }, 20000);

    try {
      await sendMessage({ text });
    } catch {
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
        responseTimeoutRef.current = null;
      }
      sawTransportActivityRef.current = false;
      setPendingAssistantBaseline(null);
      setIsAssistantThinking(false);
      appendAssistantError();
    }
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
      await sendToAi(`Zoek ${parts.join(" ") || "horecapanden"}`);
    }
  };

  // ========== Quick Reply Handler ==========
  const handleQuickReply = async (text: string) => {
    if (text === CHAT_RETRY_QUICK_REPLY) {
      if (!lastSentPromptRef.current || isBusy) return;
      await sendToAi(lastSentPromptRef.current);
      return;
    }

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
    if (!text || isBusy) return;

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
          ref={triggerButtonRef}
          onClick={() => setOpen(true)}
          aria-label="Open chatassistent"
          aria-haspopup="dialog"
          aria-controls={CHAT_WIDGET_PANEL_ID}
          aria-expanded={open}
          className={cn(
            "fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full",
            "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
            "shadow-[0_18px_40px_-22px_hsl(var(--primary)/0.95)] ring-1 ring-white/60",
            "transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.03]",
            "active:translate-y-0 active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
            "touch-manipulation"
          )}
        >
          <ChatCircleDots className="h-6 w-6" weight="fill" />
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 inline-flex h-3 w-3 rounded-full border border-background bg-emerald-500"
          />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <>
          {/* Mobile backdrop */}
          <div className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm sm:hidden" />
          <div
            id={CHAT_WIDGET_PANEL_ID}
            role="dialog"
            aria-modal="false"
            aria-label="Horecagrond chatassistent"
            className={cn(
              "fixed z-50 flex flex-col overflow-hidden border border-border/70",
              "bg-background/95 shadow-[0_28px_70px_-38px_rgba(15,23,42,0.55)]",
              "supports-[backdrop-filter]:bg-background/88 supports-[backdrop-filter]:backdrop-blur-xl",
              "animate-in slide-in-from-bottom-6 fade-in zoom-in-95 duration-300",
              "sm:bottom-4 sm:right-4 sm:w-[min(430px,calc(100vw-1.5rem))]",
              "sm:h-[min(680px,calc(100vh-2rem))] sm:rounded-[1.5rem]",
              "max-sm:inset-x-0 max-sm:bottom-0 max-sm:h-[88dvh] max-sm:rounded-t-[1.5rem]"
            )}
          >
            {/* Header */}
            <div className="border-b border-border/70 bg-gradient-to-r from-primary/[0.08] via-background to-background px-4 py-3.5 sm:px-5">
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/20">
                  <ChatCircleDots
                      className="h-5 w-5 text-primary"
                    weight="fill"
                  />
                </div>
                <div>
                    <p className="text-[15px] font-semibold tracking-tight">
                    Horecagrond Assistent
                  </p>
                    <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "inline-flex h-2 w-2 rounded-full",
                          isBusy ? "animate-pulse bg-primary" : "bg-emerald-500"
                        )}
                      />
                      {isBusy ? "Aan het typen…" : "Online"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                  aria-label="Chat sluiten"
                  className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-background/80 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/35"
                onClick={closeChat}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            </div>

            {/* Messages */}
            <ScrollArea className="min-h-0 flex-1 px-4 py-4 sm:px-5" ref={scrollRef}>
              <div className="space-y-3.5 pb-2">
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
                            "relative max-w-[86%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm",
                            message.role === "user"
                              ? "rounded-br-md bg-primary text-primary-foreground shadow-primary/25"
                              : "rounded-bl-md border border-border/60 bg-muted/55 text-foreground"
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
                          disabled={isBusy}
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
                {isBusy && <TypingIndicator />}
              </div>
            </ScrollArea>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-border/70 bg-background/90 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] supports-[backdrop-filter]:backdrop-blur-xl sm:p-3.5"
            >
              <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/35 p-1.5 shadow-sm">
                <Input
                  ref={inputRef}
                  id="chat-widget-input"
                  name="chat_message"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Typ je vraag…"
                  className="h-10 flex-1 rounded-xl border-0 bg-transparent px-3 text-base shadow-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:text-sm"
                  disabled={isBusy}
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  size="icon"
                  aria-label={isBusy ? "Bericht wordt verzonden" : "Verstuur bericht"}
                  className={cn(
                    "h-10 w-10 shrink-0 rounded-xl",
                    "shadow-[0_10px_20px_-16px_hsl(var(--primary)/0.95)]",
                    "focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
                  )}
                  disabled={isBusy || !inputValue.trim()}
                >
                  {isBusy ? (
                    <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
                  ) : (
                    <PaperPlaneTilt className="h-4 w-4" weight="fill" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
