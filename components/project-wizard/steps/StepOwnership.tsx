"use client"

import { useEffect, useMemo, useState } from "react"
import type { ProjectData, OwnershipEntry, WizardAccount } from "../types"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { getProjectWizardMembers } from "@/app/actions/workspace-members"

interface StepOwnershipProps {
  data: ProjectData
  updateData: (updates: Partial<ProjectData>) => void
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return (parts[0]?.[0] ?? "").toUpperCase()
  return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase()
}

export function StepOwnership({ data, updateData }: StepOwnershipProps) {
  const [accounts, setAccounts] = useState<WizardAccount[]>(data.wizardAccounts ?? [])
  const [loading, setLoading] = useState(accounts.length === 0)
  const [query, setQuery] = useState("")
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)

  // Load real workspace members once
  useEffect(() => {
    if (accounts.length > 0) return // already loaded (e.g. navigating back)

    getProjectWizardMembers().then((result) => {
      if (result.success && result.data) {
        const members = result.data.members
        const currentUserId = result.data.currentUserId

        setAccounts(members)
        // Persist to wizard state so StepReview can read names
        updateData({ wizardAccounts: members })

        // Pre-select current user as owner (only if not already set)
        if (!data.ownerId) {
          updateData({ ownerId: currentUserId })
        }
      }
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const ownerId = data.ownerId ?? ""

  const contributorOwnerships: OwnershipEntry[] =
    data.contributorOwnerships ??
    data.contributorIds.map<OwnershipEntry>((id) => ({ accountId: id, access: "can_edit" }))

  const stakeholderOwnerships: OwnershipEntry[] =
    data.stakeholderOwnerships ??
    data.stakeholderIds.map<OwnershipEntry>((id) => ({ accountId: id, access: "can_view" }))

  const ownerAccount = useMemo(
    () => accounts.find((a) => a.id === ownerId),
    [accounts, ownerId]
  )

  const getAccountById = (id: string): WizardAccount | undefined =>
    accounts.find((a) => a.id === id)

  const syncOwnerships = (target: "contributors" | "stakeholders", list: OwnershipEntry[]) => {
    if (target === "contributors") {
      updateData({ contributorOwnerships: list, contributorIds: list.map((e) => e.accountId) })
    } else {
      updateData({ stakeholderOwnerships: list, stakeholderIds: list.map((e) => e.accountId) })
    }
  }

  const handleAdd = (target: "contributors" | "stakeholders") => {
    const value = query.trim()
    if (!value) return
    setIsAddMenuOpen(false)

    const currentList = target === "contributors" ? contributorOwnerships : stakeholderOwnerships

    // Match against loaded accounts first
    let account = accounts.find(
      (a) =>
        a.email.toLowerCase() === value.toLowerCase() ||
        (a.name ?? "").toLowerCase() === value.toLowerCase()
    )

    // Fallback: create a temp placeholder account
    if (!account) {
      const isEmail = value.includes("@")
      const name = isEmail ? value.split("@")[0].replace(/[._]/g, " ") : value
      account = {
        id: `temp-${Date.now()}`,
        name,
        email: isEmail ? value : "",
        image: null,
      }
      setAccounts((prev) => [...prev, account!])
    }

    if (!account || currentList.some((e) => e.accountId === account!.id)) {
      setQuery("")
      return
    }

    const access: OwnershipEntry["access"] = target === "contributors" ? "can_edit" : "can_view"
    syncOwnerships(target, [...currentList, { accountId: account.id, access }])
    setQuery("")
  }

  const handlePermissionChange = (
    target: "contributors" | "stakeholders",
    accountId: string,
    access: OwnershipEntry["access"]
  ) => {
    const list = target === "contributors" ? contributorOwnerships : stakeholderOwnerships
    syncOwnerships(target, list.map((e) => (e.accountId === accountId ? { ...e, access } : e)))
  }

  const handleRemove = (target: "contributors" | "stakeholders", accountId: string) => {
    const list = target === "contributors" ? contributorOwnerships : stakeholderOwnerships
    syncOwnerships(target, list.filter((e) => e.accountId !== accountId))
  }

  if (loading) {
    return (
      <div className="flex flex-col space-y-3 bg-muted p-2 rounded-lg">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-1.5 bg-muted p-2 rounded-lg">
      <p className="text-sm px-3 py-2 text-muted-foreground">
        Define who owns, contributes to, and follows this project.
      </p>

      <div className="space-y-2">
        {/* Add people input */}
        <div className="space-y-3 bg-background rounded-lg border border-border mx-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Search by name or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 border-none focus-visible:border-none focus-visible:ring-0"
            />
            <Popover open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" className="flex gap-1 text-sm font-medium" disabled={!query.trim()}>
                  Add
                  <Plus className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-44 p-1">
                <div className="flex flex-col">
                  <button
                    type="button"
                    className="flex items-center rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                    onClick={() => handleAdd("contributors")}
                  >
                    <span className="flex-1 text-left">Contributors</span>
                  </button>
                  <button
                    type="button"
                    className="mt-1 flex items-center rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                    onClick={() => handleAdd("stakeholders")}
                  >
                    <span className="flex-1 text-left">Stakeholders</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Owner — Required */}
        <div className="px-3 flex flex-col space-y-3">
          <Label className="text-sm text-muted-foreground">Project Owner</Label>
          <div className="flex items-center justify-between rounded-lg border-border bg-muted/40">
            <Select value={ownerId} onValueChange={(val) => updateData({ ownerId: val })}>
              <SelectTrigger className="h-10 border-none bg-transparent focus:ring-0 shadow-none">
                <div className="flex items-center gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={ownerAccount?.image ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {ownerAccount ? getInitials(ownerAccount.name) : "PO"}
                    </AvatarFallback>
                  </Avatar>
                  <SelectValue placeholder="Select owner">
                    {ownerAccount ? (ownerAccount.name ?? ownerAccount.email) : "Select owner"}
                  </SelectValue>
                </div>
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={a.image ?? undefined} />
                        <AvatarFallback className="text-xs">{getInitials(a.name)}</AvatarFallback>
                      </Avatar>
                      <span>{a.name ?? a.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="pr-3 text-xs text-muted-foreground shrink-0">Full access</span>
          </div>
        </div>

        <Separator />

        {/* Contributors */}
        <div className="space-y-3 px-3">
          <Label className="text-sm font-regular text-muted-foreground">Contributors</Label>
          <div className="space-y-2">
            {contributorOwnerships.length === 0 ? (
              <p className="text-sm text-muted-foreground">Add people who will help execute this project.</p>
            ) : (
              contributorOwnerships.map((entry) => {
                const account = getAccountById(entry.accountId)
                if (!account || account.id === ownerId) return null
                return (
                  <div key={entry.accountId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-6 w-6 text-xs bg-background border border-border">
                        <AvatarImage src={account.image ?? undefined} />
                        <AvatarFallback>{getInitials(account.name)}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium">{account.name ?? account.email}</p>
                    </div>
                    <Select
                      value={entry.access}
                      onValueChange={(val) => {
                        if (val === "__remove") { handleRemove("contributors", entry.accountId); return }
                        handlePermissionChange("contributors", entry.accountId, val as OwnershipEntry["access"])
                      }}
                    >
                      <SelectTrigger className="h-8 inline-flex items-center gap-1.5 rounded-md border-none bg-accent/70 px-3 py-1 text-xs font-medium shadow-none">
                        <span className="text-xs font-medium">
                          {entry.access === "can_edit" ? "Can edit" : "Can view"}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="can_edit">Can edit</SelectItem>
                        <SelectItem value="can_view">Can view</SelectItem>
                        <SelectSeparator />
                        <SelectItem value="__remove"><span className="text-xs text-destructive">Remove</span></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <Separator />

        {/* Stakeholders */}
        <div className="space-y-3 px-3">
          <Label className="text-sm font-regular text-muted-foreground">Stakeholders</Label>
          <div className="space-y-2">
            {stakeholderOwnerships.length === 0 ? (
              <p className="text-sm text-muted-foreground">Add people who should stay informed about this project.</p>
            ) : (
              stakeholderOwnerships.map((entry) => {
                const account = getAccountById(entry.accountId)
                if (!account || account.id === ownerId) return null
                return (
                  <div key={entry.accountId} className="flex items-center justify-between rounded-md hover:bg-accent/40">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-6 w-6 text-xs bg-background border border-border">
                        <AvatarImage src={account.image ?? undefined} />
                        <AvatarFallback>{getInitials(account.name)}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium">{account.name ?? account.email}</p>
                    </div>
                    <Select
                      value={entry.access}
                      onValueChange={(val) => {
                        if (val === "__remove") { handleRemove("stakeholders", entry.accountId); return }
                        handlePermissionChange("stakeholders", entry.accountId, val as OwnershipEntry["access"])
                      }}
                    >
                      <SelectTrigger className="h-8 inline-flex items-center gap-1.5 rounded-md border-none bg-accent/70 px-3 py-1 text-xs font-medium shadow-none">
                        <span className="text-xs font-medium">
                          {entry.access === "can_edit" ? "Can edit" : "Can view"}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="can_edit">Can edit</SelectItem>
                        <SelectItem value="can_view">Can view</SelectItem>
                        <SelectSeparator />
                        <SelectItem value="__remove"><span className="text-xs text-destructive">Remove</span></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
