import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/dashboard/content-card";
import { DashboardProEmptyState } from "@/components/dashboard/empty-state-pro";

export default function LifecyclePage() {
  return (
    <ContentCard>
      <ContentCardHeader title="My Tasks" />
      <ContentCardBody className="flex items-center justify-center">
        <DashboardProEmptyState />
      </ContentCardBody>
    </ContentCard>
  );
}
