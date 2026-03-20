import { z } from "zod";

export const weightSchema = z.object({
  weightKg: z
    .number({ message: "Weight is required" })
    .min(0.1, "Weight must be at least 0.1 kg")
    .max(200, "Weight cannot exceed 200 kg"),
  recordedAt: z.string().min(1, "Date is required"),
});

export type WeightFormValues = z.infer<typeof weightSchema>;
