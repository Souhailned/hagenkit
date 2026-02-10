import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; color: string }> = {
  NEW: { label: "Nieuw", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  VIEWED: { label: "Bekeken", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  CONTACTED: { label: "Contact opgenomen", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  VIEWING_SCHEDULED: { label: "Bezichtiging", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  NEGOTIATING: { label: "Onderhandeling", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  CLOSED_WON: { label: "Deal gesloten", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  CLOSED_LOST: { label: "Niet doorgegaan", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  SPAM: { label: "Spam", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
};

export function InquiryStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, color: "bg-gray-100 text-gray-700" };

  return (
    <Badge variant="outline" className={cn("border-0 font-medium", config.color)}>
      {config.label}
    </Badge>
  );
}
