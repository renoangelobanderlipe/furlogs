import { z } from "zod";

export const vaccinationSchema = z.object({
  petId: z.number({ error: "Pet is required" }).positive(),
  clinicId: z.number().positive().optional(),
  vaccineName: z
    .string()
    .min(1, "Vaccine name is required")
    .max(255, "Vaccine name is too long"),
  administeredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a valid date (YYYY-MM-DD)"),
  nextDueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a valid date (YYYY-MM-DD)")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  vetName: z
    .string()
    .max(255, "Vet name is too long")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  batchNumber: z
    .string()
    .max(100, "Batch number is too long")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  notes: z
    .string()
    .max(5000, "Notes are too long")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
});

export const vaccinationUpdateSchema = vaccinationSchema.partial();

/** Output type — what you receive in handleSubmit (transforms applied) */
export type VaccinationFormValues = z.output<typeof vaccinationSchema>;
/** Input type — what the form fields hold (raw strings incl. empty string) */
export type VaccinationFormInput = z.input<typeof vaccinationSchema>;
export type VaccinationUpdateFormValues = z.output<
  typeof vaccinationUpdateSchema
>;
