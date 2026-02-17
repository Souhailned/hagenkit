import { PropertyWizard } from "@/components/property-wizard/property-wizard";
import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/dashboard/content-card";

export const metadata = {
  title: "Nieuw Pand Toevoegen - Horecagrond",
};

export default function NieuwPandPage() {
  return (
    <ContentCard>
      <ContentCardHeader title="Nieuw Pand" />
      <ContentCardBody className="p-4">
        <div className="mx-auto max-w-3xl">
          <PropertyWizard />
        </div>
      </ContentCardBody>
    </ContentCard>
  );
}
