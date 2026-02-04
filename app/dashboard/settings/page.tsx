import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/user";
import { getCurrentWorkspace } from "@/app/actions/workspace-settings";
import { SettingsNavigation } from "@/components/settings/settings-navigation";
import { SettingsContent } from "@/components/settings/settings-content";
import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/dashboard/content-card";

export default async function DashboardSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  // Get user's workspace and their role
  const workspaceResult = await getCurrentWorkspace();
  const workspace = workspaceResult.success && workspaceResult.data ? workspaceResult.data : null;

  // Check if user is admin (OWNER or ADMIN) OR platform admin
  const isWorkspaceAdmin =
    workspace !== null && (workspace.memberRole === "OWNER" || workspace.memberRole === "ADMIN");
  const isPlatformAdmin = user.role === "admin";
  const isAdmin = isWorkspaceAdmin || isPlatformAdmin;

  return (
    <ContentCard>
      <ContentCardHeader title="Settings" />
      <ContentCardBody className="p-6">
        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar Navigation */}
          <SettingsNavigation isAdmin={isAdmin} />

          {/* Content Area - Conditional Rendering based on URL */}
          <SettingsContent
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              image: user.image,
            }}
            workspace={workspace}
            isAdmin={isAdmin}
          />
        </div>
      </ContentCardBody>
    </ContentCard>
  );
}
