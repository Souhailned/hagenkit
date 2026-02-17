import type { Metadata } from "next";
import {
  ContentCard,
  ContentCardHeader,
  ContentCardBody,
} from "@/components/dashboard/content-card";
import { AdminDashboard } from "./admin-dashboard";

export const metadata: Metadata = {
  title: "Admin | Horecagrond",
};

export default function AdminPage() {
  return (
    <ContentCard>
      <ContentCardHeader title="Admin Dashboard" />
      <ContentCardBody className="p-4">
        <AdminDashboard />
      </ContentCardBody>
    </ContentCard>
  );
}
