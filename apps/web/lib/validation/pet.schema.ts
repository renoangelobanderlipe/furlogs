import { z } from "zod";

export const SPECIES = ["dog", "cat"] as const;
export const SEX = ["male", "female"] as const;
export const PET_SIZE = ["small", "medium", "large"] as const;

export const SPECIES_OPTIONS = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
] as const;

export const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
] as const;

export const SIZE_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
] as const;

export const petSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  species: z.enum(SPECIES, { message: "Species is required" }),
  breed: z.string().max(100, "Breed is too long").optional().or(z.literal("")),
  sex: z.enum(SEX, { message: "Sex is required" }),
  birthday: z.string().optional(),
  isNeutered: z.boolean().default(false),
  size: z.enum(PET_SIZE).optional(),
  notes: z
    .string()
    .max(1000, "Notes are too long")
    .optional()
    .or(z.literal("")),
});

export const petUpdateSchema = petSchema.partial();

export type PetFormValues = z.infer<typeof petSchema>;
export type PetUpdateFormValues = z.infer<typeof petUpdateSchema>;
