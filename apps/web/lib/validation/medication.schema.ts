import { z } from "zod";
import { FREQUENCY_OPTIONS } from "@/lib/api/medications";

const frequencyValues = FREQUENCY_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
];

export const medicationSchema = z.object({
  petId: z.number({ error: "Pet is required" }).positive(),
  name: z
    .string()
    .min(1, "Medication name is required")
    .max(255, "Medication name is too long"),
  dosage: z
    .string()
    .min(1, "Dosage is required")
    .max(255, "Dosage is too long"),
  frequency: z
    .enum(frequencyValues, { message: "Select a frequency" })
    .nullable()
    .optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a valid date (YYYY-MM-DD)"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a valid date (YYYY-MM-DD)")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(5000, "Notes are too long")
    .optional()
    .or(z.literal("")),
});

export type MedicationFormValues = z.infer<typeof medicationSchema>;
