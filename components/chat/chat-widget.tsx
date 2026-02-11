"use client";

import * as React from "react";
import { ChatCircleDots, PaperPlaneTilt, X } from "@phosphor-icons/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hoi! 👋 Ik ben de Horecagrond Assistent. Ik help je bij het vinden van het perfecte horecapand. Wat zoek je?",
    },
  ]);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
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
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: assistantContent } : m
            )
          );
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, er ging iets mis. De chatbot is momenteel niet beschikbaar. Probeer het later opnieuw.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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

      {open && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 w-[380px] max-h-[600px]",
            "flex flex-col rounded-2xl border bg-background shadow-2xl",
            "max-sm:bottom-0 max-sm:right-0 max-sm:left-0 max-sm:w-full max-sm:max-h-full max-sm:rounded-none"
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
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 min-h-[300px]" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-sm rounded-bl-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground">Bezig met zoeken...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t p-3">
            <Input
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

          {/* Quick suggestions */}
          {messages.length <= 1 && (
            <div className="border-t px-3 py-2">
              <p className="text-xs text-muted-foreground mb-2">Snel starten:</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Wat is er in Amsterdam?",
                  "Restaurants met terras",
                  "Hoeveel panden zijn er?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                    onClick={() => setInput(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
