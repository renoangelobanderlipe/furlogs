import { z } from "zod";

export const FOOD_TYPES = ["dry", "wet", "treat", "supplement"] as const;
export const UNIT_TYPES = ["kg", "can", "pack", "piece"] as const;

export const FOOD_TYPE_OPTIONS = [
  { value: "dry", label: "Dry Food" },
  { value: "wet", label: "Wet Food" },
  { value: "treat", label: "Treat" },
  { value: "supplement", label: "Supplement" },
] as const;

export const UNIT_TYPE_OPTIONS = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "can", label: "Can" },
  { value: "pack", label: "Pack" },
  { value: "piece", label: "Piece" },
] as const;

export const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  brand: z.string().max(100, "Brand is too long").optional().or(z.literal("")),
  type: z.enum(FOOD_TYPES, { message: "Food type is required" }),
  unitWeightGrams: z.number({ error: "Must be a number" }).positive("Must be positive").optional(),
  unitType: z.enum(UNIT_TYPES, { message: "Unit type is required" }),
  alertThresholdPct: z
    .number({ error: "Must be a number" })
    .min(1, "Must be at least 1")
    .max(100, "Must be at most 100")
    .optional(),
  notes: z
    .string()
    .max(1000, "Notes are too long")
    .optional()
    .or(z.literal("")),
});

export const purchaseSchema = z.object({
  foodProductId: z
    .number({ error: "Product is required" })
    .int()
    .positive("Product is required"),
  purchasedAt: z
    .string()
    .min(1, "Purchase date is required")
    .date("Must be a valid date"),
  purchaseCost: z
    .number({ error: "Must be a number" })
    .nonnegative("Must be 0 or more")
    .optional(),
  purchaseSource: z
    .string()
    .max(200, "Source is too long")
    .optional()
    .or(z.literal("")),
  quantity: z
    .number({ error: "Must be a number" })
    .int("Must be a whole number")
    .min(1, "Quantity must be at least 1")
    .optional(),
});

export const consumptionRateSchema = z.object({
  petId: z.number({ error: "Pet is required" }).int().positive("Pet is required"),
  dailyAmountGrams: z
    .number({ error: "Daily amount is required" })
    .min(1, "Must be at least 1 gram"),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type PurchaseFormValues = z.infer<typeof purchaseSchema>;
export type ConsumptionRateFormValues = z.infer<typeof consumptionRateSchema>;
