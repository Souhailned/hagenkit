import { PropertyWizard } from "@/components/property-wizard/property-wizard";

export const metadata = {
  title: "Nieuw Pand Toevoegen - Horecagrond",
};

export default function NieuwPandPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <PropertyWizard />
    </div>
  );
}
