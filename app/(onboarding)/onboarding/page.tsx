import { getCurrentUser } from "@/app/actions/user";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { setUserRole } from "@/app/actions/set-role";

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

  // Set role if provided via URL param (from sign-up)
  if (roleParam === "seeker" || roleParam === "agent") {
    await setUserRole(roleParam);
  }

  // If user already completed onboarding, redirect to dashboard
  if (user.onboardingCompleted) {
    redirect("/dashboard");
  }

  const userRole = roleParam === "agent" ? "agent" : (user.role || "seeker");

  return (
    <OnboardingFlow
      userName={user.name}
      userEmail={user.email}
      userRole={userRole as "seeker" | "agent"}
    />
  );
}
