import {
  ContentCard,
  ContentCardHeader,
  ContentCardBody,
} from "@/components/dashboard/content-card";
import { Gear } from "@phosphor-icons/react/dist/ssr";

export default function AdminSettingsPage() {
  return (
    <ContentCard>
      <ContentCardHeader title="System Settings" />
      <ContentCardBody className="flex items-center justify-center p-12">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Gear className="h-6 w-6 text-muted-foreground" weight="bold" />
          </div>
          <h3 className="text-lg font-semibold">Settings Coming Soon</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Fine-tune platform configuration. Detailed controls are coming soon.
          </p>
        </div>
      </ContentCardBody>
    </ContentCard>
  );
}
