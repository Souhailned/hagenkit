"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Eye,
  MessageSquare,
  Heart,
  TrendingUp,
  Globe,
  EyeOff,
  Trash2,
  MoreVertical,
  MapPin,
  Building2,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { PropertyAlgemeenTab } from "./tabs/property-algemeen-tab";
import { PropertyFotosTab } from "./tabs/property-fotos-tab";
import { PropertyKenmerkenTab } from "./tabs/property-kenmerken-tab";
import { PropertyStatistiekenTab } from "./tabs/property-statistieken-tab";

import {
  publishProperty,
  unpublishProperty,
  deleteProperty,
} from "@/app/actions/property";
import type { Property } from "@/lib/validations/property";
import {
  propertyStatusLabels,
  propertyTypeLabels,
  priceTypeLabels,
} from "@/lib/validations/property";

interface PropertyDetailContentProps {
  property: Property;
}

// Status badge variants
function getStatusVariant(status: Property["status"]) {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "DRAFT":
      return "secondary";
    case "PENDING_REVIEW":
      return "outline";
    case "UNDER_OFFER":
      return "default";
    case "SOLD":
    case "RENTED":
      return "secondary";
    case "ARCHIVED":
    case "REJECTED":
      return "destructive";
    default:
      return "outline";
  }
}

// Format price in euros
function formatPrice(cents: number | undefined): string {
  if (!cents) return "-";
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function PropertyDetailContent({ property }: PropertyDetailContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("algemeen");

  const isPublished = property.status === "ACTIVE";
  const isDraft = property.status === "DRAFT";

  const handlePublish = () => {
    startTransition(async () => {
      const result = await publishProperty(property.id);
      if (result.success) {
        toast.success("Pand gepubliceerd");
        router.refresh();
      } else {
        toast.error(result.error || "Publiceren mislukt");
      }
    });
  };

  const handleUnpublish = () => {
    startTransition(async () => {
      const result = await unpublishProperty(property.id);
      if (result.success) {
        toast.success("Pand gedepubliceerd");
        router.refresh();
      } else {
        toast.error(result.error || "Depubliceren mislukt");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProperty(property.id);
      if (result.success) {
        toast.success("Pand verwijderd");
        router.push("/dashboard/panden");
      } else {
        toast.error(result.error || "Verwijderen mislukt");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
              {property.title}
            </h1>
            <Badge variant={getStatusVariant(property.status)}>
              {propertyStatusLabels[property.status]}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {property.address}, {property.city}
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              {propertyTypeLabels[property.propertyType]}
            </span>
            <span className="font-medium text-foreground">
              {priceTypeLabels[property.priceType]}:{" "}
              {property.priceType === "SALE"
                ? formatPrice(property.salePrice)
                : formatPrice(property.rentPrice)}
              {property.priceType === "RENT" && "/mnd"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isDraft ? (
            <Button onClick={handlePublish} disabled={isPending}>
              <Globe className="mr-2 h-4 w-4" />
              Publiceren
            </Button>
          ) : isPublished ? (
            <Button
              variant="outline"
              onClick={handleUnpublish}
              disabled={isPending}
            >
              <EyeOff className="mr-2 h-4 w-4" />
              Depubliceren
            </Button>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isPublished && (
                <DropdownMenuItem
                  onClick={() => window.open(`/aanbod/${property.slug}`, "_blank")}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Bekijk publieke pagina
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(property.id)}>
                Kopieer ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Verwijderen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 rounded-lg border bg-card p-4 sm:grid-cols-4">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            Weergaven
          </span>
          <span className="text-2xl font-semibold tabular-nums">
            {property.viewCount.toLocaleString("nl-NL")}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            Aanvragen
          </span>
          <span className="text-2xl font-semibold tabular-nums">
            {property.inquiryCount}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Heart className="h-4 w-4" />
            Opgeslagen
          </span>
          <span className="text-2xl font-semibold tabular-nums">
            {property.savedCount}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Conversie
          </span>
          <span className="text-2xl font-semibold tabular-nums">
            {property.viewCount > 0
              ? `${((property.inquiryCount / property.viewCount) * 100).toFixed(1)}%`
              : "-"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="algemeen" className="flex-1 sm:flex-none">
            Algemeen
          </TabsTrigger>
          <TabsTrigger value="fotos" className="flex-1 sm:flex-none">
            Foto&apos;s
            {property.images && property.images.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {property.images.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="kenmerken" className="flex-1 sm:flex-none">
            Kenmerken
          </TabsTrigger>
          <TabsTrigger value="statistieken" className="flex-1 sm:flex-none">
            Statistieken
          </TabsTrigger>
        </TabsList>

        <TabsContent value="algemeen" className="mt-6">
          <PropertyAlgemeenTab property={property} />
        </TabsContent>

        <TabsContent value="fotos" className="mt-6">
          <PropertyFotosTab property={property} />
        </TabsContent>

        <TabsContent value="kenmerken" className="mt-6">
          <PropertyKenmerkenTab property={property} />
        </TabsContent>

        <TabsContent value="statistieken" className="mt-6">
          <PropertyStatistiekenTab property={property} />
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pand verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je &quot;{property.title}&quot; wilt verwijderen?
              Deze actie kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
