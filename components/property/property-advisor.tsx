"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Send,
  ChevronDown,
  Bot,
  User,
  MessageSquare,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PropertyAdvisorProps {
  propertySlug: string;
  propertyTitle: string;
  propertyType: string;
  city: string;
}

// ---------------------------------------------------------------------------
// Quick question presets
// ---------------------------------------------------------------------------

const QUICK_QUESTIONS = [
  "Welk concept past hier het beste?",
  "Wat zijn de risico's van dit pand?",
  "Is de huurprijs marktconform?",
  "Hoe zit het met de concurrentie?",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

// Simple inline markdown renderer (bold, bullets, links)
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
        </strong>,
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
          rel="noopener noreferrer"
        >
          {linkMatch[1]}
        </a>,
      );
      remaining = remaining.slice(linkIdx + linkMatch[0].length);
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PropertyAdvisor({
  propertySlug,
  propertyTitle,
  propertyType,
  city,
}: PropertyAdvisorProps) {
  const [expanded, setExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // AI SDK 6: use transport to configure custom API + body
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat/property",
        body: { propertySlug },
      }),
    [propertySlug],
  );

  const { messages, sendMessage, status } = useChat({
    id: `property-advisor-${propertySlug}`,
    transport,
    onError: () => {
      setSendError("Er ging iets mis met het antwoord. Probeer opnieuw.");
    },
  });

  const isLoading = status === "streaming" || status === "submitted";
  const advisorPanelId = `property-advisor-panel-${propertySlug}`;
  const lastMessage = messages[messages.length - 1];
  const hasVisibleAssistantReply =
    lastMessage?.role === "assistant" &&
    getMessageText(lastMessage).trim().length > 0;

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input when expanded
  useEffect(() => {
    if (expanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [expanded]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setSendError(null);
    setInputValue("");

    try {
      await sendMessage({ text });
    } catch {
      setSendError("Er ging iets mis met het antwoord. Probeer opnieuw.");
    }
  };

  const handleQuickQuestion = async (question: string) => {
    if (isLoading) return;
    setSendError(null);

    try {
      await sendMessage({ text: question });
    } catch {
      setSendError("Er ging iets mis met het antwoord. Probeer opnieuw.");
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Header — always visible, clickable to toggle */}
      <CardHeader className="p-0">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls={advisorPanelId}
          className="w-full cursor-pointer select-none p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="size-4 text-primary" />
              </div>
              <div>
                <span>AI Pand Adviseur</span>
                <Badge
                  variant="secondary"
                  className="ml-2 px-1.5 py-0 text-[10px] font-normal"
                >
                  Nieuw
                </Badge>
              </div>
            </CardTitle>
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                expanded && "rotate-180",
              )}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Stel vragen over {propertyTitle}
          </p>
        </button>
      </CardHeader>

      {/* Expanded content */}
      {expanded && (
        <CardContent id={advisorPanelId} className="border-t p-0">
          {/* Messages area */}
          <ScrollArea className="h-[320px] px-3 py-3" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="space-y-3">
                {/* Welcome message */}
                <div className="flex gap-2">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="size-3 text-primary" />
                  </div>
                  <div className="rounded-xl rounded-tl-sm bg-muted px-3 py-2 text-sm">
                    <p>
                      Hoi! Ik ben je AI adviseur voor dit{" "}
                      <strong>{propertyType.toLowerCase()}</strong> in{" "}
                      <strong>{city}</strong>. Stel me een vraag!
                    </p>
                  </div>
                </div>

                {/* Quick question chips */}
                <div className="flex flex-wrap gap-1.5 pl-8">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      disabled={isLoading}
                      className={cn(
                        "rounded-full border border-primary/30 bg-background px-2.5 py-1 text-xs",
                        "text-primary hover:bg-primary/5 hover:border-primary/50",
                        "active:scale-95 transition-all",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                      )}
                      onClick={() => handleQuickQuestion(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => {
                  const text = getMessageText(message);
                  if (!text) return null;

                  const isUser = message.role === "user";

                  return (
                    <div
                      key={message.id}
                      className={cn("flex gap-2", isUser && "flex-row-reverse")}
                    >
                      {!isUser && (
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Bot className="size-3 text-primary" />
                        </div>
                      )}
                      {isUser && (
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
                          <User className="size-3 text-muted-foreground" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                          isUser
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted rounded-tl-sm",
                        )}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{text}</p>
                        ) : (
                          <ChatMarkdown content={text} />
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {isLoading && !hasVisibleAssistantReply && (
                    <div className="flex gap-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="size-3 text-primary" />
                      </div>
                      <div className="flex items-center gap-1 rounded-xl rounded-tl-sm bg-muted px-3 py-2">
                        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
                      </div>
                    </div>
                  )}
              </div>
            )}
          </ScrollArea>

          {/* Input area */}
          <div className="flex items-center gap-2 border-t p-2.5">
            <Input
              ref={inputRef}
              id={`${advisorPanelId}-input`}
              name="property_advisor_message"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Stel een vraag over dit pand..."
              className="flex-1 border-0 bg-muted text-sm focus-visible:ring-0"
              disabled={isLoading}
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              className="size-8 shrink-0"
              aria-label="Verstuur vraag"
              disabled={isLoading || !inputValue.trim()}
              onClick={handleSend}
            >
              <Send className="size-3.5" />
            </Button>
          </div>

          {sendError && (
            <p
              id={`${advisorPanelId}-error`}
              className="px-3 pb-2 text-xs text-destructive"
              role="status"
              aria-live="polite"
            >
              {sendError}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-1.5 border-t px-3 py-1.5">
            <MessageSquare className="size-3 text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground/50">
              AI-gegenereerd advies — niet als vervanging voor professioneel advies
            </span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
