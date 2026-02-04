"use client"

import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/dashboard/content-card";
import { DashboardProEmptyState } from "@/components/dashboard/empty-state-pro";
import { Button } from "@/components/ui/button";
import { UserPlus } from "@phosphor-icons/react/dist/ssr"

export default function TeamPage() {
  return (
    <ContentCard>
      <ContentCardHeader
        title="Clients"
        actions={
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        }
      />
      <ContentCardBody className="flex items-center justify-center">
        <DashboardProEmptyState />
      </ContentCardBody>
    </ContentCard>
  );
}
