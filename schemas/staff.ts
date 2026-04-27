import { z } from "zod";

export const staffInviteSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  fullName: z.string().trim().min(3).max(120),
  role: z.literal("admin")
});
