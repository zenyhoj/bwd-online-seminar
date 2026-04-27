import type { DocumentType } from "@/types/domain";

export const seminarModules = [
  { key: "overview", title: "Water Service Orientation" },
  { key: "requirements", title: "Document Requirements" },
  { key: "inspection", title: "Inspection Guidelines" },
  { key: "payments", title: "Payment Scheduling" }
] as const;

export const documentTypeLabels: Record<DocumentType, string> = {
  tax_declaration_title: "Tax Declaration / Title",
  authorization_letter: "Authorization Letter",
  water_permit: "Water Permit"
};
