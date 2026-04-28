import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8)
});

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
  fullName: z.string().trim().min(3).max(120),
  acceptPrivacyNotice: z.literal(true, {
    errorMap: () => ({
      message: "You must confirm the identity and data privacy notice before creating an account."
    })
  })
});
