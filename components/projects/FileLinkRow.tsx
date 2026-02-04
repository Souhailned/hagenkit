"use client"

import { DownloadSimple, FilePdf, FileZip, FigmaLogo, File } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type QuickLink = {
  id: string
  name: string
  type: "pdf" | "zip" | "fig" | "doc" | "file"
  sizeMB: number
  url: string
}

type FileLinkRowProps = {
  file: QuickLink
  className?: string
}

function FileIcon({ type }: { type: QuickLink["type"] }) {
  switch (type) {
    case "pdf":
      return <FilePdf className="h-8 w-8 text-red-500" weight="duotone" />
    case "zip":
      return <FileZip className="h-8 w-8 text-amber-500" weight="duotone" />
    case "fig":
      return <FigmaLogo className="h-8 w-8 text-purple-500" weight="duotone" />
    default:
      return <File className="h-8 w-8 text-muted-foreground" weight="duotone" />
  }
}

export function FileLinkRow({ file, className }: FileLinkRowProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0 rounded-lg bg-muted/40 p-1 flex items-center justify-center">
          <FileIcon type={file.type} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground truncate">{file.name}</div>
          <div className="text-sm text-muted-foreground">{file.sizeMB.toFixed(1)} MB</div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-xl"
        aria-label={`Download ${file.name}`}
        asChild
      >
        <a href={file.url} target="_blank" rel="noreferrer">
          <DownloadSimple className="h-4 w-4" />
        </a>
      </Button>
    </div>
  )
}
