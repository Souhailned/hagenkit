"use client"

import { cn } from "@/lib/utils"

interface ProgressCircleProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  className?: string
  color?: string
}

export function ProgressCircle({
  progress,
  size = 28,
  strokeWidth = 3,
  className,
  color = "text-primary",
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("shrink-0 -rotate-90", className)}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className="stroke-muted"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={cn("transition-[stroke-dashoffset] duration-300", color)}
        style={{ stroke: "currentColor" }}
      />
    </svg>
  )
}
