import {
  EmailTemplateId,
  type EmailTemplateData,
  type EmailTemplateRenderResult,
} from "@/lib/notifications/types";
import { welcomeEmailTemplate } from "./templates/welcome-email";
import { workspaceInvitationTemplate } from "./templates/workspace-invitation";
import { emailVerificationTemplate } from "./templates/email-verification";
import { passwordResetTemplate } from "./templates/password-reset";
import { newPropertyMatchTemplate } from "./templates/new-property-match";
import { newInquiryAgentTemplate } from "./templates/new-inquiry-agent";

/**
 * Type-safe email template registry
 * Maps each EmailTemplateId to its corresponding render function
 */
export type EmailTemplateRegistry = {
  [K in EmailTemplateId]: {
    render: (data: EmailTemplateData[K]) => EmailTemplateRenderResult;
  };
};

/**
 * Central registry of all email templates
 * Use this to render emails in a type-safe manner
 */
export const emailTemplates: EmailTemplateRegistry = {
  [EmailTemplateId.WORKSPACE_WELCOME]: welcomeEmailTemplate,
  [EmailTemplateId.WORKSPACE_INVITATION]: workspaceInvitationTemplate,
  [EmailTemplateId.EMAIL_VERIFICATION]: emailVerificationTemplate,
  [EmailTemplateId.PASSWORD_RESET]: passwordResetTemplate,
  [EmailTemplateId.NEW_PROPERTY_MATCH]: newPropertyMatchTemplate,
  [EmailTemplateId.NEW_INQUIRY_AGENT]: newInquiryAgentTemplate,
};

/**
 * Get an email template by ID (type-safe)
 */
export function getEmailTemplate<T extends EmailTemplateId>(
  templateId: T
): EmailTemplateRegistry[T] {
  return emailTemplates[templateId];
}
