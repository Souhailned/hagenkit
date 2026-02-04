"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

interface PasswordInputProps extends React.ComponentProps<"input"> {
  showPasswordToggle?: boolean
}

function PasswordInput({ 
  className, 
  showPasswordToggle = true,
  type = "password",
  ...props 
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const togglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && props.onKeyDown) {
      props.onKeyDown(e)
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type={showPassword ? "text" : type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          showPasswordToggle && "pr-9",
          className
        )}
        {...props}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={togglePassword}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          <Eye 
            className={cn(
              "h-4 w-4 transition-all duration-200",
              showPassword ? "opacity-0 scale-0" : "opacity-100 scale-100"
            )}
          />
          <EyeOff 
            className={cn(
              "absolute h-4 w-4 transition-all duration-200",
              showPassword ? "opacity-100 scale-100" : "opacity-0 scale-0"
            )}
          />
        </button>
      )}
    </div>
  )
}

export { PasswordInput }
