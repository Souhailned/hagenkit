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

type NewPropertyMatchData =
  EmailTemplateData[EmailTemplateId.NEW_PROPERTY_MATCH];

const paragraphStyle = {
  margin: 0,
};

const listItemStyle = {
  margin: "4px 0",
  paddingLeft: "8px",
};

const propertyInfoStyle = {
  backgroundColor: "#F6F8FA",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0",
};

const propertyDetailStyle = {
  margin: "4px 0",
  fontSize: "14px",
  color: "#374151",
};

const smallLinkStyle = {
  fontSize: "13px",
  color: "#6B7280",
  textDecoration: "underline",
};

export function NewPropertyMatchEmail({
  alertName,
  userName,
  property,
  matchedCriteria,
  propertyUrl,
  editAlertsUrl,
}: NewPropertyMatchData) {
  const recipient = userName?.trim() || "there";

  return (
    <EmailLayout
      previewText={`Je zoekmelding "${alertName}" heeft een match gevonden`}
      heading="Nieuw pand voor je!"
    >
      <Text style={paragraphStyle}>
        Hi {recipient}, je zoekmelding &ldquo;{alertName}&rdquo; heeft een
        match!
      </Text>

      <Text style={{ ...paragraphStyle, fontWeight: 600, marginTop: "16px" }}>
        Overeenkomende criteria:
      </Text>
      <div>
        {matchedCriteria.map((criterion, index) => (
          <Text key={index} style={listItemStyle}>
            &bull; {criterion}
          </Text>
        ))}
      </div>

      <div style={propertyInfoStyle}>
        <Text
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: 700,
            color: "#020304",
          }}
        >
          {property.title}
        </Text>
        <Text style={propertyDetailStyle}>Stad: {property.city}</Text>
        <Text style={propertyDetailStyle}>Type: {property.propertyType}</Text>
        <Text style={propertyDetailStyle}>Prijs: {property.price}</Text>
      </div>

      <Section style={{ textAlign: "center" }}>
        <PrimaryButton href={propertyUrl}>Bekijk pand</PrimaryButton>
      </Section>

      <Section style={{ textAlign: "center", marginTop: "16px" }}>
        <a href={editAlertsUrl} style={smallLinkStyle}>
          Beheer je meldingen
        </a>
      </Section>
    </EmailLayout>
  );
}

export const newPropertyMatchTemplate = {
  render: (data: NewPropertyMatchData): EmailTemplateRenderResult => ({
    subject: `Nieuw pand gevonden: ${data.property.title}`,
    previewText: `Je zoekmelding "${data.alertName}" heeft een match gevonden`,
    component: <NewPropertyMatchEmail {...data} />,
  }),
};

NewPropertyMatchEmail.PreviewProps = {
  alertName: "Cafe in Amsterdam",
  userName: "Jan",
  property: {
    title: "Gezellig cafe aan de gracht",
    city: "Amsterdam",
    propertyType: "CAFE",
    price: "\u20AC2.500/mnd",
    slug: "gezellig-cafe-aan-de-gracht",
    imageUrl: undefined,
  },
  matchedCriteria: ["Stad: Amsterdam", "Type: CAFE", "Prijs: \u20AC2.500/mnd"],
  propertyUrl: "https://horecagrond.nl/aanbod/gezellig-cafe-aan-de-gracht",
  editAlertsUrl: "https://horecagrond.nl/dashboard/search-alerts",
} satisfies NewPropertyMatchData;

export default NewPropertyMatchEmail;
