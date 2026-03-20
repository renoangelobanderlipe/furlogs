"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import type { FoodProduct } from "@/lib/api/food-stock";
import type { Pet } from "@/lib/api/pets";
import {
  type ConsumptionRateFormValues,
  consumptionRateSchema,
} from "@/lib/validation/food-stock.schema";

interface EditConsumptionRatesDialogProps {
  open: boolean;
  onClose: () => void;
  product: FoodProduct | null;
  pets: Pet[];
  onUpsert: (productId: number, data: ConsumptionRateFormValues) => void;
  onDelete: (productId: number, petId: number) => void;
  isUpserting: boolean;
  isDeleting: boolean;
}

export function EditConsumptionRatesDialog({
  open,
  onClose,
  product,
  pets,
  onUpsert,
  onDelete,
  isUpserting,
  isDeleting,
}: EditConsumptionRatesDialogProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ConsumptionRateFormValues>({
    resolver: zodResolver(consumptionRateSchema),
  });

  const existingRates = product?.attributes.consumptionRates ?? [];

  const assignedPetIds = new Set(existingRates.map((r) => r.petId));
  const availablePets = pets.filter((p) => !assignedPetIds.has(p.id));

  const handleAdd = (values: ConsumptionRateFormValues) => {
    if (!product) return;
    onUpsert(product.id, values);
    reset();
    setShowAddForm(false);
  };

  const handleClose = () => {
    if (!isUpserting && !isDeleting) {
      setShowAddForm(false);
      reset();
      onClose();
    }
  };

  const getPetName = (petId: number): string => {
    const pet = pets.find((p) => p.id === petId);
    return pet?.attributes.name ?? `Pet #${petId}`;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Consumption Rates
        {product && (
          <Typography
            variant="body2"
            color="text.secondary"
            component="span"
            sx={{ ml: 1 }}
          >
            — {product.attributes.name}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {existingRates.length === 0 && !showAddForm ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No consumption rates set. Add one to enable stock projections.
          </Typography>
        ) : (
          <Stack spacing={1} sx={{ mb: 2 }}>
            {existingRates.map((rate) => (
              <Box
                key={rate.petId}
                display="flex"
                alignItems="center"
                gap={1.5}
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: "action.hover",
                }}
              >
                <Chip label={getPetName(rate.petId)} size="small" />
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {rate.dailyAmountGrams}g / day
                </Typography>
                <Tooltip title="Remove rate">
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (product) onDelete(product.id, rate.petId);
                    }}
                    disabled={isDeleting}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
          </Stack>
        )}

        {showAddForm && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Add Consumption Rate
            </Typography>
            <Stack spacing={2}>
              <Controller
                name="petId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={availablePets}
                    getOptionLabel={(opt) => opt.attributes.name}
                    value={
                      availablePets.find((p) => p.id === field.value) ?? null
                    }
                    onChange={(_, newValue) => {
                      field.onChange(newValue?.id ?? null);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Pet"
                        error={!!errors.petId}
                        helperText={errors.petId?.message}
                        required
                        size="small"
                      />
                    )}
                    size="small"
                    isOptionEqualToValue={(opt, val) => opt.id === val.id}
                    noOptionsText="All pets already assigned"
                  />
                )}
              />

              <TextField
                {...register("dailyAmountGrams", {
                  setValueAs: (v) =>
                    v === "" || v == null ? undefined : Number(v),
                })}
                label="Daily Amount (grams)"
                type="number"
                error={!!errors.dailyAmountGrams}
                helperText={errors.dailyAmountGrams?.message}
                required
                size="small"
                inputProps={{ min: 1, step: 1 }}
              />

              <Box display="flex" gap={1} justifyContent="flex-end">
                <Button
                  size="small"
                  onClick={() => {
                    setShowAddForm(false);
                    reset();
                  }}
                  disabled={isUpserting}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleSubmit(handleAdd)}
                  disabled={isUpserting}
                >
                  {isUpserting ? "Saving…" : "Save Rate"}
                </Button>
              </Box>
            </Stack>
          </>
        )}

        {!showAddForm && availablePets.length > 0 && (
          <Button
            startIcon={<AddIcon />}
            size="small"
            onClick={() => setShowAddForm(true)}
            sx={{ mt: 1 }}
          >
            Add Rate
          </Button>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isUpserting || isDeleting}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
