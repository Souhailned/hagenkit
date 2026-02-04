import {
  ContentCard,
  ContentCardHeader,
  ContentCardBody,
} from "@/components/dashboard/content-card";
import { FileText } from "@phosphor-icons/react/dist/ssr";

export default function AuditLogsPage() {
  return (
    <ContentCard>
      <ContentCardHeader title="Audit Logs" />
      <ContentCardBody className="flex items-center justify-center p-12">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FileText className="h-6 w-6 text-muted-foreground" weight="bold" />
          </div>
          <h3 className="text-lg font-semibold">Audit Logs Coming Soon</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Review system activity and trace changes. Log timelines will be available shortly.
          </p>
        </div>
      </ContentCardBody>
    </ContentCard>
  );
}
