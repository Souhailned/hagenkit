import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/dashboard/content-card";
import { DashboardProEmptyState } from "@/components/dashboard/empty-state-pro";

export default function HelpCenterPage() {
  return (
    <ContentCard>
      <ContentCardHeader title="Help" />
      <ContentCardBody className="flex items-center justify-center">
        <DashboardProEmptyState />
      </ContentCardBody>
    </ContentCard>
  );
}
