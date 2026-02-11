"use client";

import * as React from "react";
import { ChatCircleDots, PaperPlaneTilt, X, MapPin, ArrowSquareOut, Buildings } from "@phosphor-icons/react";
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

// Property card component for chat
function ChatPropertyCard({ property }: { property: ChatProperty }) {
  return (
    <Link
      href={`/aanbod/${property.slug}`}
      className={cn(
        "flex gap-3 rounded-xl border bg-background p-2.5 min-w-[260px] max-w-[280px]",
        "hover:border-primary/30 hover:shadow-sm transition-all",
        "shrink-0"
      )}
    >
      {/* Image */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {property.imageUrl ? (
          <Image
            src={property.imageUrl}
            alt={property.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Buildings className="h-6 w-6 text-muted-foreground/50" />
          </div>
        )}
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
      <Link
        href="/aanbod"
        className="flex items-center gap-1 text-xs text-primary hover:underline mt-1 ml-1"
      >
        <span>Bekijk alle panden</span>
        <ArrowSquareOut className="h-3 w-3" />
      </Link>
    </div>
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
function getQuickReplies(content: string, messageIndex: number, totalMessages: number): string[] {
  const lower = content.toLowerCase();

  // Welcome message
  if (messageIndex === 0) {
    return ["🍽️ Restaurants", "☕ Cafés", "🍺 Bars", "🏨 Hotels", "📍 Alle steden"];
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

  // If bot mentioned Amsterdam
  if (lower.includes("amsterdam")) {
    return ["🍽️ Restaurants", "☕ Cafés", "🍺 Bars", "📍 Andere stad"];
  }

  // If bot mentioned restaurants
  if (lower.includes("restaurant")) {
    return ["🪑 Met terras", "📍 In Amsterdam", "💰 Budget opties", "🔍 Andere types"];
  }

  // Default follow-up options
  if (totalMessages > 2) {
    return ["🔍 Nieuwe zoekopdracht", "📍 Alle steden", "❓ Meer info"];
  }

  return [];
}

export function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hoi! 👋 Ik ben de Horecagrond Assistent. Ik help je bij het vinden van het perfecte horecapand.\n\nWat voor type pand zoek je?",
      quickReplies: ["🍽️ Restaurants", "☕ Cafés", "🍺 Bars", "🏨 Hotels", "📍 Alle steden"],
    },
  ]);
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

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };

    // Remove quick replies from previous messages
    setMessages((prev) =>
      prev.map((m) => ({ ...m, quickReplies: undefined })).concat(userMessage)
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
      const quickReplies = getQuickReplies(finalText, msgIndex, allMessages.length + 1);
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
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
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
