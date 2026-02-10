import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, BarChart3, MessageCircle, Download, Building2, Heart } from "lucide-react";

const actions = [
  { label: "Nieuw pand", href: "/dashboard/panden/nieuw", icon: Plus, color: "text-green-600" },
  { label: "Mijn panden", href: "/dashboard/panden", icon: Building2, color: "text-blue-600" },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, color: "text-purple-600" },
  { label: "Leads", href: "/dashboard/leads", icon: MessageCircle, color: "text-orange-600" },
  { label: "Favorieten", href: "/dashboard/favorieten", icon: Heart, color: "text-red-500" },
  { label: "Export", href: "/api/properties/export", icon: Download, color: "text-gray-600" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.label} href={action.href}>
            <Card className="transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
              <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                <Icon className={`h-6 w-6 ${action.color}`} />
                <span className="text-xs font-medium">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
