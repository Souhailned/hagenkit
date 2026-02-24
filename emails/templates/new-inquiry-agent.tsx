import * as React from "react";
import { Section, Text } from "@react-email/components";
import type {
  EmailTemplateRenderResult,
  EmailTemplateData,
} from "@/lib/notifications/types";
import { EmailTemplateId } from "@/lib/notifications/types";
import {
  EmailLayout,
  PrimaryButton,
} from "./components/email-layout";

type NewInquiryAgentData =
  EmailTemplateData[EmailTemplateId.NEW_INQUIRY_AGENT];

const paragraphStyle = {
  margin: 0,
};

const detailBlockStyle = {
  backgroundColor: "#F6F8FA",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0",
};

const detailLabelStyle = {
  margin: "4px 0",
  fontSize: "13px",
  color: "#6B7280",
  fontWeight: 600 as const,
};

const detailValueStyle = {
  margin: "0 0 12px 0",
  fontSize: "15px",
  color: "#020304",
};

export function NewInquiryAgentEmail({
  agentName,
  propertyTitle,
  inquiryName,
  inquiryEmail,
  inquiryPhone,
  source,
  dashboardUrl,
}: NewInquiryAgentData) {
  const recipient = agentName?.trim() || "there";
  const sourceLabel =
    source === "DREAM_SLIDER" ? `${source} (\uD83E\uDD16 AI Droom Slider)` : source;

  return (
    <EmailLayout
      previewText="Bekijk de nieuwe aanvraag in je dashboard"
      heading="Nieuwe aanvraag ontvangen"
    >
      <Text style={paragraphStyle}>
        Hi {recipient}, er is een nieuwe aanvraag voor
        &ldquo;{propertyTitle}&rdquo;.
      </Text>

      <div style={detailBlockStyle}>
        <Text style={detailLabelStyle}>Naam</Text>
        <Text style={detailValueStyle}>{inquiryName}</Text>

        <Text style={detailLabelStyle}>E-mail</Text>
        <Text style={detailValueStyle}>{inquiryEmail}</Text>

        {inquiryPhone ? (
          <>
            <Text style={detailLabelStyle}>Telefoon</Text>
            <Text style={detailValueStyle}>{inquiryPhone}</Text>
          </>
        ) : null}

        <Text style={detailLabelStyle}>Bron</Text>
        <Text style={{ ...detailValueStyle, marginBottom: 0 }}>
          {sourceLabel}
        </Text>
      </div>

      <Section style={{ textAlign: "center" }}>
        <PrimaryButton href={dashboardUrl}>Bekijk aanvraag</PrimaryButton>
      </Section>
    </EmailLayout>
  );
}

export const newInquiryAgentTemplate = {
  render: (data: NewInquiryAgentData): EmailTemplateRenderResult => ({
    subject: `Nieuwe aanvraag: ${data.inquiryName} voor ${data.propertyTitle}`,
    previewText: "Bekijk de nieuwe aanvraag in je dashboard",
    component: <NewInquiryAgentEmail {...data} />,
  }),
};

NewInquiryAgentEmail.PreviewProps = {
  agentName: "Pieter",
  propertyTitle: "Restaurant De Gouden Leeuw",
  inquiryName: "Maria Janssen",
  inquiryEmail: "maria@example.com",
  inquiryPhone: "+31 6 12345678",
  source: "WEBSITE",
  dashboardUrl: "https://horecagrond.nl/dashboard",
} satisfies NewInquiryAgentData;

export default NewInquiryAgentEmail;
