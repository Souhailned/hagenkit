"use client"

import { useState, useTransition } from "react"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createScopeItem, deleteScopeItem } from "@/app/actions/project-scope-items"

type OutcomeData = { id: string; content: string }

type OutcomesListProps = {
  outcomes: OutcomeData[]
  projectId: string
}

export function OutcomesList({ outcomes, projectId }: OutcomesListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [adding, setAdding] = useState(false)
  const [newContent, setNewContent] = useState("")

  const handleAdd = () => {
    if (!newContent.trim()) return
    startTransition(async () => {
      const result = await createScopeItem({
        projectId,
        type: "EXPECTED_OUTCOME",
        content: newContent.trim(),
        order: outcomes.length,
      })
      if (result.success) {
        setNewContent("")
        setAdding(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to add outcome")
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteScopeItem({ id })
      if (result.success) {
        router.refresh()
      } else {
        toast.error(result.error || "Failed to delete outcome")
      }
    })
  }

  const cancel = () => {
    setAdding(false)
    setNewContent("")
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-foreground">Expected Outcomes</h2>
      <ul className="mt-3 space-y-1.5">
        {outcomes.map((item) => (
          <li
            key={item.id}
            className="group flex items-start gap-2 text-sm text-muted-foreground"
          >
            <span className="mt-0.5 shrink-0 text-muted-foreground/40">•</span>
            <span className="flex-1">{item.content}</span>
            <button
              onClick={() => handleDelete(item.id)}
              disabled={isPending || item.id.startsWith("legacy-")}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40 hover:text-destructive disabled:pointer-events-none shrink-0 mt-0.5"
              aria-label="Delete outcome"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </li>
        ))}

        {adding && (
          <li className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 shrink-0 text-muted-foreground/40">•</span>
            <input
              autoFocus
              placeholder="Type and press Enter…"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd()
                if (e.key === "Escape") cancel()
              }}
              onBlur={() => { if (!newContent.trim()) cancel() }}
              disabled={isPending}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/40 text-sm"
            />
            {newContent.trim() && (
              <button
                onClick={handleAdd}
                disabled={isPending}
                className="shrink-0 text-xs font-medium text-primary hover:text-primary/70 transition-colors mt-0.5"
              >
                Save
              </button>
            )}
          </li>
        )}
      </ul>

      {!adding && (
        <button
          className="mt-2 flex items-center gap-1 text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors"
          onClick={() => setAdding(true)}
        >
          <Plus className="h-3 w-3" />
          Add outcome
        </button>
      )}
    </section>
  )
}
