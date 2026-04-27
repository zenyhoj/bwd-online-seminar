import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8)
});

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z
    .string()
    .min(12)
    .max(72)
    .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
    .regex(/[a-z]/, "Password must include at least one lowercase letter.")
    .regex(/[0-9]/, "Password must include at least one number.")
    .regex(/[^A-Za-z0-9]/, "Password must include at least one special character."),
  fullName: z.string().trim().min(3).max(120),
  customerType: z.enum(["residential", "commercial", "government", "industrial", "others"]),
  acceptPrivacyNotice: z.literal(true, {
    errorMap: () => ({
      message: "You must confirm the identity and data privacy notice before creating an account."
    })
  })
});
