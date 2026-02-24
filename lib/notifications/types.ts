import type { ReactElement } from "react";

/**
 * Enum of all available email templates
 * These are generic templates suitable for any application
 */
export enum EmailTemplateId {
  // User onboarding
  WORKSPACE_WELCOME = "workspace-welcome",
  EMAIL_VERIFICATION = "email-verification",

  // Workspace management
  WORKSPACE_INVITATION = "workspace-invitation",

  // Authentication
  PASSWORD_RESET = "password-reset",

  // AI Conversion Machine
  NEW_PROPERTY_MATCH = "new-property-match",
  NEW_INQUIRY_AGENT = "new-inquiry-agent",
}

/**
 * Data required for each email template
 */
export type EmailTemplateData = {
  [EmailTemplateId.WORKSPACE_WELCOME]: {
    firstName: string;
    dashboardUrl: string;
  };

  [EmailTemplateId.WORKSPACE_INVITATION]: {
    inviterName: string;
    workspaceName: string;
    inviteeEmail: string;
    acceptUrl: string;
    declineUrl?: string;
  };

  [EmailTemplateId.EMAIL_VERIFICATION]: {
    firstName: string;
    verificationUrl: string;
  };

  [EmailTemplateId.PASSWORD_RESET]: {
    firstName: string;
    resetUrl: string;
    expiresInMinutes: number;
  };

  [EmailTemplateId.NEW_PROPERTY_MATCH]: {
    alertName: string;
    userName: string;
    property: {
      title: string;
      city: string;
      propertyType: string;
      price: string;
      slug: string;
      imageUrl?: string;
    };
    matchedCriteria: string[];
    propertyUrl: string;
    editAlertsUrl: string;
  };

  [EmailTemplateId.NEW_INQUIRY_AGENT]: {
    agentName: string;
    propertyTitle: string;
    inquiryName: string;
    inquiryEmail: string;
    inquiryPhone: string | null;
    source: string;
    dashboardUrl: string;
  };
};

/**
 * Result returned by email template render functions
 */
export interface EmailTemplateRenderResult {
  subject: string;
  previewText: string;
  component: ReactElement;
}

/**
 * Standard email template interface
 */
export interface EmailTemplate<T extends EmailTemplateId> {
  render: (data: EmailTemplateData[T]) => EmailTemplateRenderResult;
}

/**
 * Email send options
 */
export interface SendEmailOptions {
  to: string | string[];
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  tags?: Array<{ name: string; value: string }>;
}

/**
 * Email send result
 */
export interface SendEmailResult {
  id: string;
  success: boolean;
  error?: string;
}
