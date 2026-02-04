import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/user";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  // Redirect non-admins to dashboard
  if (currentUser?.role !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
