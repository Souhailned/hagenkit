"use client";

import * as React from "react";
import { DotsThree, UserCircleGear, Prohibit, Trash, Shield } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { adminUpdateUserRole, adminBanUser, adminDeleteUser } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

interface UserActionsProps {
  userId: string;
  currentRole: string;
  isBanned: boolean;
}

export function UserActions({ userId, currentRole, isBanned }: UserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleRoleChange = async (role: string) => {
    setLoading(true);
    await adminUpdateUserRole(userId, role);
    router.refresh();
    setLoading(false);
  };

  const handleBan = async () => {
    setLoading(true);
    await adminBanUser(userId, !isBanned);
    router.refresh();
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Weet je zeker dat je deze gebruiker wilt verwijderen? Dit kan niet ongedaan worden.")) return;
    setLoading(true);
    await adminDeleteUser(userId);
    router.refresh();
    setLoading(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loading}>
          <DotsThree className="h-4 w-4" weight="bold" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <UserCircleGear className="mr-2 h-4 w-4" />
            Rol wijzigen
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {["seeker", "agent", "admin"].map((role) => (
              <DropdownMenuItem
                key={role}
                onClick={() => handleRoleChange(role)}
                className={currentRole === role ? "font-bold" : ""}
              >
                {role === "seeker" && "Ondernemer"}
                {role === "agent" && "Makelaar"}
                {role === "admin" && (
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Admin
                  </span>
                )}
                {currentRole === role && " ✓"}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem onClick={handleBan}>
          <Prohibit className="mr-2 h-4 w-4" />
          {isBanned ? "Deblokkeren" : "Blokkeren"}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          <Trash className="mr-2 h-4 w-4" />
          Verwijderen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
