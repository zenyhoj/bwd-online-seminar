import { z } from "zod";

export const paymentScheduleSchema = z.object({
  applicationId: z.string().uuid(),
  paymentType: z.enum(["inspection_fee", "connection_fee", "materials", "other"]),
  officePaymentAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
});

export const paymentStatusSchema = z.object({
  paymentId: z.string().uuid(),
  status: z.enum(["scheduled", "paid", "overdue", "cancelled"]),
  amount: z.coerce.number().min(0).optional(),
  officialReceiptNumber: z.string().optional(),
  paidAt: z.string().optional(),
  officePaymentAt: z.string().optional()
});
