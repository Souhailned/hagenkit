import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; variant: string }> = {
  DRAFT: { label: "Concept", variant: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  ACTIVE: { label: "Actief", variant: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  UNDER_OFFER: { label: "Onder bod", variant: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  RENTED: { label: "Verhuurd", variant: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  SOLD: { label: "Verkocht", variant: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  ARCHIVED: { label: "Gearchiveerd", variant: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, variant: "bg-gray-100 text-gray-700" };

  return (
    <Badge variant="outline" className={cn("border-0 font-medium", config.variant)}>
      {config.label}
    </Badge>
  );
}
