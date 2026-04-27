import { z } from "zod";

export const concessionaireSchema = z.object({
  applicationId: z.string().uuid(),
  profileId: z.string().uuid(),
  concessionaireNumber: z.string().min(3),
  connectionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meterNumber: z.string().optional()
});
