"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import type { FoodProduct } from "@/lib/api/food-stock";
import {
  FOOD_TYPE_OPTIONS,
  type ProductFormValues,
  productSchema,
  UNIT_TYPE_OPTIONS,
} from "@/lib/validation/food-stock.schema";

interface AddProductDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void;
  isLoading: boolean;
  editProduct?: FoodProduct | null;
}

export function AddProductDialog({
  open,
  onClose,
  onSubmit,
  isLoading,
  editProduct,
}: AddProductDialogProps) {
  const isEditing = editProduct != null;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      brand: "",
      type: "dry",
      unitType: "kg",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (editProduct) {
        reset({
          name: editProduct.attributes.name,
          brand: editProduct.attributes.brand ?? "",
          type: editProduct.attributes.type,
          unitWeightGrams: editProduct.attributes.unitWeightGrams ?? undefined,
          unitType: editProduct.attributes.unitType,
          alertThresholdPct:
            editProduct.attributes.alertThresholdPct ?? undefined,
          notes: editProduct.attributes.notes ?? "",
        });
      } else {
        reset({
          name: "",
          brand: "",
          type: "dry",
          unitType: "kg",
          notes: "",
        });
      }
    }
  }, [open, editProduct, reset]);

  const handleClose = () => {
    if (!isLoading) onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? "Edit Product" : "Add Food Product"}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <TextField
            {...register("name")}
            label="Product Name"
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
            required
            size="small"
          />

          <TextField
            {...register("brand")}
            label="Brand"
            error={!!errors.brand}
            helperText={errors.brand?.message}
            fullWidth
            size="small"
          />

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                size="small"
                error={!!errors.type}
                required
              >
                <InputLabel>Food Type</InputLabel>
                <Select {...field} label="Food Type">
                  {FOOD_TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.type && (
                  <FormHelperText>{errors.type.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="unitType"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                size="small"
                error={!!errors.unitType}
                required
              >
                <InputLabel>Unit Type</InputLabel>
                <Select {...field} label="Unit Type">
                  {UNIT_TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.unitType && (
                  <FormHelperText>{errors.unitType.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          <TextField
            {...register("unitWeightGrams", {
              setValueAs: (v) =>
                v === "" || v == null ? undefined : Number(v),
            })}
            label="Unit Weight (grams)"
            type="number"
            error={!!errors.unitWeightGrams}
            helperText={
              errors.unitWeightGrams?.message ??
              "Weight of one unit in grams (for consumption tracking)"
            }
            fullWidth
            size="small"
            inputProps={{ min: 0, step: 1 }}
          />

          <TextField
            {...register("alertThresholdPct", {
              setValueAs: (v) =>
                v === "" || v == null ? undefined : Number(v),
            })}
            label="Alert Threshold (%)"
            type="number"
            error={!!errors.alertThresholdPct}
            helperText={
              errors.alertThresholdPct?.message ??
              "Notify when stock drops below this percentage (1–100)"
            }
            fullWidth
            size="small"
            inputProps={{ min: 1, max: 100, step: 1 }}
          />

          <TextField
            {...register("notes")}
            label="Notes"
            multiline
            rows={3}
            error={!!errors.notes}
            helperText={errors.notes?.message}
            fullWidth
            size="small"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isLoading}
        >
          {isLoading
            ? isEditing
              ? "Saving…"
              : "Adding…"
            : isEditing
              ? "Save Changes"
              : "Add Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
