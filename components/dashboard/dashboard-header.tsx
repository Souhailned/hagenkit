import { formatDate } from "@/lib/format";

interface DashboardHeaderProps {
  userName?: string | null;
  role?: string;
}

export function DashboardHeader({ userName, role }: DashboardHeaderProps) {
  const now = new Date();
  const hour = now.getHours();
  let greeting = "Goedemorgen";
  if (hour >= 12 && hour < 18) greeting = "Goedemiddag";
  if (hour >= 18) greeting = "Goedenavond";

  const today = formatDate(now);

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold tracking-tight">
        {greeting}{userName ? `, ${userName.split(" ")[0]}` : ""}! 👋
      </h1>
      <p className="text-muted-foreground mt-1">
        {today} · {role === "agent" ? "Makelaar Dashboard" : "Ondernemer Dashboard"}
      </p>
    </div>
  );
}
