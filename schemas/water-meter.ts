import { z } from "zod";

export const waterMeterScheduleSchema = z.object({
  applicationId: z.string().uuid(),
  scheduledAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Invalid date format"),
  minDate: z.string().optional()
});
