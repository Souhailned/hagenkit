import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/dashboard/content-card";
import { DashboardProEmptyState } from "@/components/dashboard/empty-state-pro";

export default async function DashboardPage() {
  return (
    <ContentCard>
      <ContentCardHeader title="Dashboard" />
      <ContentCardBody className="flex items-center justify-center">
        <DashboardProEmptyState />
      </ContentCardBody>
    </ContentCard>
  );
}
