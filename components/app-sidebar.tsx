"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MagnifyingGlass,
  Tray,
  CheckSquare,
  Folder,
  Users,
  ChartBar,
  Gear,
  Question,
  CaretRight,
  CaretUpDown,
  Image,
  VideoCamera,
  Heart,
  ChatCircle,
  ShieldCheck,
  Buildings,
  UserCircle,
  FileText,
  GearSix,
  SignOut,
  CircleNotch,
} from "@phosphor-icons/react/dist/ssr"
import { signOut } from "@/lib/auth-client"
import { toast } from "sonner"
import { footerItems, navItems, type NavItemId, type SidebarFooterItemId } from "@/lib/data/sidebar"
import type { SidebarUser } from "@/types/user"

// Admin navigation items
const adminNavItems = [
  { id: "users", label: "Users", href: "/dashboard/admin/users", icon: Users },
  { id: "workspaces", label: "Workspaces", href: "/dashboard/admin/workspaces", icon: Buildings },
  { id: "impersonate", label: "Impersonate", href: "/dashboard/admin/impersonate", icon: UserCircle },
  { id: "audit-logs", label: "Audit Logs", href: "/dashboard/admin/audit-logs", icon: FileText },
  { id: "settings", label: "Settings", href: "/dashboard/admin/settings", icon: GearSix },
] as const

const navItemIcons: Record<NavItemId, React.ComponentType<{ className?: string }>> = {
  inbox: Tray,
  "my-tasks": CheckSquare,
  projects: Folder,
  clients: Users,
  performance: ChartBar,
  images: Image,
  videos: VideoCamera,
  favorieten: Heart,
  panden: Buildings,
  leads: ChatCircle,
}

const footerItemIcons: Record<SidebarFooterItemId, React.ComponentType<{ className?: string }>> = {
  settings: Gear,
  help: Question,
  admin: ShieldCheck,
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: SidebarUser
}) {
  const pathname = usePathname()
  const [adminOpen, setAdminOpen] = useState(() => pathname.startsWith("/dashboard/admin"))
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { isMobile } = useSidebar()
  const isAdmin = user?.role === "admin"

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U"

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Successfully signed out")
            window.location.href = "/"
          },
          onError: () => {
            toast.error("Failed to sign out. Please try again.")
            setIsSigningOut(false)
          },
        },
      })
    } catch (error) {
      console.error("Sign out error:", error)
      toast.error("An unexpected error occurred")
      setIsSigningOut(false)
    }
  }

  // Hybrid navigation: new design labels → existing routes
  const getHrefForNavItem = (id: NavItemId): string => {
    if (id === "inbox") return "/dashboard"                    // Dashboard overview
    if (id === "my-tasks") return "/dashboard/lifecycle"       // Lifecycle page
    if (id === "projects") return "/dashboard/projects"        // Projects page
    if (id === "clients") return "/dashboard/team"             // Team page
    if (id === "performance") return "/dashboard/analytics"    // Analytics page
    if (id === "images") return "/dashboard/images"            // Images page
    if (id === "videos") return "/dashboard/videos"            // Videos page
    if (id === "favorieten") return "/dashboard/favorieten"    // Favorieten page
    if (id === "panden") return "/dashboard/panden"            // Mijn Panden page
    if (id === "leads") return "/dashboard/leads"              // Leads page
    return "#"
  }

  const isItemActive = (id: NavItemId): boolean => {
    if (id === "inbox") return pathname === "/dashboard"
    if (id === "my-tasks") return pathname.startsWith("/dashboard/lifecycle")
    if (id === "projects") return pathname === "/dashboard/projects" || pathname.startsWith("/dashboard/projects/")
    if (id === "clients") return pathname.startsWith("/dashboard/team")
    if (id === "performance") return pathname.startsWith("/dashboard/analytics")
    if (id === "images") return pathname.startsWith("/dashboard/images")
    if (id === "videos") return pathname.startsWith("/dashboard/videos")
    if (id === "favorieten") return pathname.startsWith("/dashboard/favorieten")
    if (id === "panden") return pathname.startsWith("/dashboard/panden")
    if (id === "leads") return pathname.startsWith("/dashboard/leads")
    return false
  }

  const getHrefForFooterItem = (id: SidebarFooterItemId): string => {
    if (id === "settings") return "/dashboard/settings"
    if (id === "help") return "/dashboard/help"
    return "#"
  }

  return (
    <Sidebar className="border-border/40 border-r-0 shadow-none border-none" {...props}>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-800 text-primary-foreground shadow-[inset_0_-5px_6.6px_0_rgba(0,0,0,0.25)]">
              <span className="text-xs font-bold">W</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Workspace</span>
              <span className="text-xs text-muted-foreground">Pro plan</span>
            </div>
          </div>
          <button className="rounded-md p-1 hover:bg-accent">
            <CaretUpDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-0 gap-0">
        <SidebarGroup>
          <div className="relative px-0 py-0">
            <MagnifyingGlass className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="h-9 rounded-lg bg-muted/50 pl-8 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/20 border-border border shadow-none"
            />
            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const href = getHrefForNavItem(item.id)
                const active = isItemActive(item.id)

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className="h-9 rounded-lg px-3 font-normal text-muted-foreground"
                    >
                      <Link href={href}>
                        {(() => {
                          const Icon = navItemIcons[item.id]
                          return Icon ? <Icon className="h-[18px] w-[18px]" /> : null
                        })()}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge className="bg-muted text-muted-foreground rounded-full px-2">
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-2">
        {/* Admin Section - Fixed at bottom, only visible for admins */}
        {isAdmin && (
          <Collapsible open={adminOpen} onOpenChange={setAdminOpen} className="mb-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="h-9 rounded-lg px-3 font-normal text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                    <ShieldCheck className="h-[18px] w-[18px]" />
                    <span className="flex-1 text-left">Admin Console</span>
                    <CaretRight
                      className={`h-4 w-4 transition-transform duration-200 ${adminOpen ? "rotate-90" : ""}`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
            </SidebarMenu>
            <CollapsibleContent>
              <SidebarMenu className="pl-4 pt-1">
                {adminNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="h-8 rounded-lg px-3 font-normal text-muted-foreground"
                      >
                        <Link href={item.href}>
                          <Icon className="h-[16px] w-[16px]" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>
        )}

        <SidebarMenu>
          {footerItems.map((item) => {
            const href = getHrefForFooterItem(item.id)
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild className="h-9 rounded-lg px-3 text-muted-foreground">
                  <Link href={href}>
                    {(() => {
                      const Icon = footerItemIcons[item.id]
                      return Icon ? <Icon className="h-[18px] w-[18px]" /> : null
                    })()}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="mt-2 flex w-full items-center gap-3 rounded-lg p-2 hover:bg-accent cursor-pointer text-left transition-colors data-[state=open]:bg-accent">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image ?? ""} />
                <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col min-w-0">
                <span className="text-sm font-medium truncate">{user?.name ?? "User"}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</span>
              </div>
              <CaretRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "top" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-2 py-2 text-left">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image ?? ""} />
                  <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">{user?.name ?? "User"}</span>
                  <span className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="cursor-pointer">
                <Tray className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer">
                <Gear className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <SignOut className={`mr-2 h-4 w-4 ${isSigningOut ? "animate-pulse" : ""}`} />
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
