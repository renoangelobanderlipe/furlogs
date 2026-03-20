import { z } from "zod";

export const VISIT_TYPES = [
  "checkup",
  "treatment",
  "vaccine",
  "emergency",
] as const;

export const VISIT_TYPE_OPTIONS = [
  { value: "checkup", label: "Checkup" },
  { value: "treatment", label: "Treatment" },
  { value: "vaccine", label: "Vaccine" },
  { value: "emergency", label: "Emergency" },
] as const;

export const vetVisitSchema = z.object({
  petId: z.number({ error: "Pet is required" }).positive(),
  clinicId: z.number().positive().optional(),
  vetName: z
    .string()
    .max(255, "Vet name is too long")
    .optional()
    .or(z.literal("")),
  visitType: z.enum(VISIT_TYPES, { message: "Visit type is required" }),
  visitDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a valid date (YYYY-MM-DD)"),
  reason: z
    .string()
    .min(1, "Reason is required")
    .max(1000, "Reason is too long"),
  diagnosis: z
    .string()
    .max(5000, "Diagnosis is too long")
    .optional()
    .or(z.literal("")),
  treatment: z
    .string()
    .max(5000, "Treatment is too long")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(5000, "Notes are too long")
    .optional()
    .or(z.literal("")),
  cost: z.number().min(0, "Cost cannot be negative").optional(),
  weightAtVisit: z.number().min(0, "Weight cannot be negative").optional(),
  followUpDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a valid date (YYYY-MM-DD)")
    .optional()
    .or(z.literal("")),
});

export const vetVisitUpdateSchema = vetVisitSchema.partial();

export type VetVisitFormValues = z.infer<typeof vetVisitSchema>;
export type VetVisitCreateFormValues = VetVisitFormValues;
export type VetVisitUpdateFormValues = z.infer<typeof vetVisitUpdateSchema>;
