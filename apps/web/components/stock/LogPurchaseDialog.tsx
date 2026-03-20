"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import type { FoodProduct } from "@/lib/api/food-stock";
import {
  type PurchaseFormValues,
  purchaseSchema,
} from "@/lib/validation/food-stock.schema";

interface LogPurchaseDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PurchaseFormValues) => void;
  isLoading: boolean;
  products: FoodProduct[];
  preselectedProductId?: number | null;
}

export function LogPurchaseDialog({
  open,
  onClose,
  onSubmit,
  isLoading,
  products,
  preselectedProductId,
}: LogPurchaseDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      purchasedAt: new Date().toISOString().slice(0, 10),
      quantity: 1,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        foodProductId: preselectedProductId ?? undefined,
        purchasedAt: new Date().toISOString().slice(0, 10),
        quantity: 1,
        purchaseCost: undefined,
        purchaseSource: "",
      });
    }
  }, [open, preselectedProductId, reset]);

  const handleClose = () => {
    if (!isLoading) onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Log Purchase</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Controller
            name="foodProductId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={products}
                getOptionLabel={(opt) => {
                  const brand = opt.attributes.brand;
                  return brand
                    ? `${opt.attributes.name} (${brand})`
                    : opt.attributes.name;
                }}
                value={products.find((p) => p.id === field.value) ?? null}
                onChange={(_, newValue) => {
                  field.onChange(newValue?.id ?? null);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Food Product"
                    error={!!errors.foodProductId}
                    helperText={errors.foodProductId?.message}
                    required
                    size="small"
                  />
                )}
                size="small"
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
              />
            )}
          />

          <TextField
            {...register("purchasedAt")}
            label="Purchase Date"
            type="date"
            error={!!errors.purchasedAt}
            helperText={errors.purchasedAt?.message}
            fullWidth
            required
            size="small"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            {...register("quantity", {
              setValueAs: (v) =>
                v === "" || v == null ? undefined : Number(v),
            })}
            label="Quantity"
            type="number"
            error={!!errors.quantity}
            helperText={errors.quantity?.message ?? "Number of units purchased"}
            fullWidth
            size="small"
            inputProps={{ min: 1, step: 1 }}
          />

          <TextField
            {...register("purchaseCost", {
              setValueAs: (v) =>
                v === "" || v == null ? undefined : Number(v),
            })}
            label="Total Cost"
            type="number"
            error={!!errors.purchaseCost}
            helperText={errors.purchaseCost?.message}
            fullWidth
            size="small"
            inputProps={{ min: 0, step: 0.01 }}
          />

          <TextField
            {...register("purchaseSource")}
            label="Purchase Source"
            error={!!errors.purchaseSource}
            helperText={
              errors.purchaseSource?.message ??
              "e.g. Petco, Amazon, Local store"
            }
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
          {isLoading ? "Logging…" : "Log Purchase"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
