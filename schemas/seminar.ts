import { z } from "zod";

export const seminarProgressSchema = z.object({
  seminarItemId: z.string().uuid(),
  completed: z.coerce.boolean()
});

export const seminarItemSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  mediaType: z.enum(["text", "image", "video"]),
  mediaUrl: z.string().url().optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().min(0).max(999)
});

export const deleteSeminarItemSchema = z.object({
  seminarItemId: z.string().uuid()
});
