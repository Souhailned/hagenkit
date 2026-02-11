"use client";

import * as React from "react";
import { DotsThree, Lightning, Trash, Eye, EyeSlash, ArrowSquareOut } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminUpdatePropertyStatus, adminDeleteProperty, adminFeatureProperty } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PropertyActionsProps {
  propertyId: string;
  slug: string;
  status: string;
  featured: boolean;
}

export function PropertyActions({ propertyId, slug, status, featured }: PropertyActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleStatus = async (newStatus: string) => {
    setLoading(true);
    await adminUpdatePropertyStatus(propertyId, newStatus);
    router.refresh();
    setLoading(false);
  };

  const handleFeature = async () => {
    setLoading(true);
    await adminFeatureProperty(propertyId, !featured);
    router.refresh();
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Weet je zeker dat je dit pand wilt verwijderen? Dit kan niet ongedaan worden.")) return;
    setLoading(true);
    await adminDeleteProperty(propertyId);
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
        <DropdownMenuItem asChild>
          <Link href={`/aanbod/${slug}`} target="_blank">
            <ArrowSquareOut className="mr-2 h-4 w-4" />
            Bekijk pand
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {status !== "ACTIVE" && (
          <DropdownMenuItem onClick={() => handleStatus("ACTIVE")}>
            <Eye className="mr-2 h-4 w-4" />
            Activeren
          </DropdownMenuItem>
        )}
        {status === "ACTIVE" && (
          <DropdownMenuItem onClick={() => handleStatus("DRAFT")}>
            <EyeSlash className="mr-2 h-4 w-4" />
            Deactiveren
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={handleFeature}>
          <Lightning className="mr-2 h-4 w-4" />
          {featured ? "Uitlichten stoppen" : "Uitlichten"}
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
