"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Sparkle, PaperPlaneTilt, X, Robot, User } from "@phosphor-icons/react/dist/ssr"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

type AskAIDialogProps = {
  context?: string
  trigger?: React.ReactNode
}

const SAMPLE_RESPONSES: Record<string, string> = {
  default: "I'm your AI assistant for this project. I can help you with questions about tasks, timeline, team members, and project scope. What would you like to know?",
  progress: "Based on the current timeline, you're making good progress. The project is 75% complete with 21 days remaining. Key milestones are on track.",
  tasks: "There are 3 tasks in progress and 2 planned. The current focus is on core UI implementation and validation logic.",
  team: "The project has Jason D as the primary owner, with support from Sarah K and Mike T. They're handling different aspects of the implementation.",
  scope: "The in-scope items include discovery workshop, journey mapping, prototyping, design system, and QA support. Backend changes and marketing pages are out of scope.",
}

function getAIResponse(question: string): string {
  const q = question.toLowerCase()
  if (q.includes("progress") || q.includes("status") || q.includes("how are we doing")) {
    return SAMPLE_RESPONSES.progress
  }
  if (q.includes("task") || q.includes("todo") || q.includes("work")) {
    return SAMPLE_RESPONSES.tasks
  }
  if (q.includes("team") || q.includes("who") || q.includes("member")) {
    return SAMPLE_RESPONSES.team
  }
  if (q.includes("scope") || q.includes("include") || q.includes("feature")) {
    return SAMPLE_RESPONSES.scope
  }
  return SAMPLE_RESPONSES.default
}

export function AskAIDialog({ context, trigger }: AskAIDialogProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400))

    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: getAIResponse(trimmed),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, aiMessage])
    setIsTyping(false)
  }, [input])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const handleClear = useCallback(() => {
    setMessages([])
    toast.success("Conversation cleared")
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <div className="relative">
            <div className="relative rounded-xl border border-border bg-card/80 shadow-sm overflow-hidden">
              <Button className="h-8 gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 relative z-10 px-3">
                <Sparkle className="h-4 w-4" weight="fill" />
                Ask AI
              </Button>
            </div>
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkle className="h-4 w-4 text-primary" weight="fill" />
              </div>
              <div>
                <DialogTitle className="text-base">Project Assistant</DialogTitle>
                <p className="text-xs text-muted-foreground">Ask anything about this project</p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs">
                Clear
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="h-[350px] px-4 py-3" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Robot className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Start a conversation</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                Ask about project progress, tasks, team members, or scope details
              </p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {["What's the progress?", "Who's on the team?", "What's in scope?"].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setInput(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                      msg.role === "user" ? "bg-primary" : "bg-muted"
                    )}
                  >
                    {msg.role === "user" ? (
                      <User className="h-4 w-4 text-primary-foreground" weight="bold" />
                    ) : (
                      <Sparkle className="h-4 w-4 text-muted-foreground" weight="fill" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm max-w-[80%]",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Sparkle className="h-4 w-4 text-muted-foreground" weight="fill" />
                  </div>
                  <div className="rounded-xl px-3 py-2 bg-muted">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="px-4 py-3 border-t border-border bg-muted/30">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="flex-1 h-9"
              disabled={isTyping}
            />
            <Button
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
            >
              <PaperPlaneTilt className="h-4 w-4" weight="fill" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
