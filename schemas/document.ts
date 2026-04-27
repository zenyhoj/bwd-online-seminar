import { z } from "zod";

export const documentUploadSchema = z.object({
  applicationId: z.string().uuid(),
  documentType: z.enum(["tax_declaration_title", "authorization_letter", "water_permit"])
});

export const documentReviewSchema = z.object({
  documentId: z.string().uuid(),
  status: z.enum(["verified", "rejected"]),
  reviewNotes: z.string().min(3)
});
