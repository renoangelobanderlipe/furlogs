import { z } from "zod";

const reminderBaseSchema = z.object({
  petId: z.string().uuid().nullable().optional(),
  type: z.enum([
    "vaccination",
    "medication",
    "vet_appointment",
    "food_stock",
    "custom",
  ]),
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z
    .string()
    .max(5000, "Description is too long")
    .optional()
    .or(z.literal("")),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a valid date (YYYY-MM-DD)"),
  isRecurring: z.boolean(),
  recurrenceDays: z
    .number()
    .int()
    .min(1, "Must be at least 1 day")
    .max(365, "Must be at most 365 days")
    .nullable()
    .optional(),
});

export const reminderSchema = reminderBaseSchema.refine(
  (data) => {
    if (data.isRecurring && !data.recurrenceDays) {
      return false;
    }
    return true;
  },
  {
    message: "Recurrence interval is required when recurring is enabled",
    path: ["recurrenceDays"],
  },
);

export const reminderUpdateSchema = reminderBaseSchema.partial().refine(
  (data) => {
    if (data.isRecurring && !data.recurrenceDays) {
      return false;
    }
    return true;
  },
  {
    message: "Recurrence interval is required when recurring is enabled",
    path: ["recurrenceDays"],
  },
);

export type ReminderFormValues = z.infer<typeof reminderSchema>;
export type ReminderUpdateFormValues = z.infer<typeof reminderUpdateSchema>;
