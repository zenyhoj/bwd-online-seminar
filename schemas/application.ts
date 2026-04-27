import { z } from "zod";

export const applicationSchema = z.object({
  lastName: z.string().min(2),
  firstName: z.string().min(2),
  middleInitial: z.string().trim().max(3).optional(),
  sex: z.enum(["Male", "Female"]),
  age: z.coerce.number().int().min(1).max(120),
  address: z.string().min(10),
  cellphoneNumber: z.string().min(11).max(20),
  numberOfUsers: z.coerce.number().int().min(1).max(100)
});

export const applicationStatusSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum([
    "submitted",
    "under_review",
    "inspection_scheduled",
    "inspection_completed",
    "documents_verified",
    "payment_scheduled",
    "approved",
    "rejected",
    "converted"
  ]),
  rejectionReason: z.string().optional()
});
