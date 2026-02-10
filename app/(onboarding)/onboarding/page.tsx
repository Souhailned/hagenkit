import { getCurrentUser } from "@/app/actions/user";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { setUserRole } from "@/app/actions/set-role";
import type { UserRole } from "@/types/user";

export const dynamic = 'force-dynamic';

interface OnboardingPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const roleParam = typeof params.role === "string" ? params.role : undefined;

  if (!user) {
    redirect("/sign-in");
  }

  // If user already completed onboarding, redirect to dashboard
  if (user.onboardingCompleted) {
    redirect("/dashboard");
  }

  // Set role if provided via URL param (from sign-up) and user still has default role
  if (
    (roleParam === "seeker" || roleParam === "agent") &&
    user.role !== roleParam
  ) {
    await setUserRole(roleParam);
  }

  // Determine effective role: URL param > existing DB role > default seeker
  const effectiveRole: UserRole = 
    (roleParam === "seeker" || roleParam === "agent") 
      ? roleParam 
      : (user.role === "agent" ? "agent" : "seeker");

  return (
    <OnboardingFlow
      userName={user.name}
      userEmail={user.email}
      userRole={effectiveRole as "seeker" | "agent"}
    />
  );
}
