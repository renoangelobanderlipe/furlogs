"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { Controller, useForm } from "react-hook-form";
import { usePets } from "@/hooks/api/usePets";
import {
  type VaccinationFormValues,
  vaccinationSchema,
} from "@/lib/validation/vaccination.schema";

interface VaccinationFormProps {
  defaultValues?: Partial<VaccinationFormValues>;
  onSubmit: (data: VaccinationFormValues) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function VaccinationForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Save vaccination",
}: VaccinationFormProps) {
  const { data: petsData } = usePets();
  const pets = petsData?.data ?? [];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<VaccinationFormValues>({
    resolver: zodResolver(vaccinationSchema),
    defaultValues: {
      vaccineName: "",
      administeredDate: new Date().toISOString().slice(0, 10),
      nextDueDate: "",
      vetName: "",
      batchNumber: "",
      notes: "",
      ...defaultValues,
    },
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      display="flex"
      flexDirection="column"
      gap={2.5}
    >
      <Controller
        name="petId"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.petId} required>
            <InputLabel id="vax-pet-label">Pet</InputLabel>
            <Select
              {...field}
              value={field.value ?? ""}
              labelId="vax-pet-label"
              label="Pet"
              onChange={(e) => field.onChange(Number(e.target.value))}
            >
              {pets.map((pet) => (
                <MenuItem key={pet.id} value={pet.id}>
                  {pet.attributes.name}
                </MenuItem>
              ))}
            </Select>
            {errors.petId && (
              <FormHelperText>{errors.petId.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />

      <TextField
        {...register("vaccineName")}
        label="Vaccine name"
        fullWidth
        required
        error={!!errors.vaccineName}
        helperText={errors.vaccineName?.message}
        inputProps={{ "aria-label": "Vaccine name" }}
      />

      <TextField
        {...register("administeredDate")}
        label="Administered date"
        type="date"
        fullWidth
        required
        InputLabelProps={{ shrink: true }}
        error={!!errors.administeredDate}
        helperText={errors.administeredDate?.message}
        inputProps={{ "aria-label": "Administered date" }}
      />

      <TextField
        {...register("nextDueDate")}
        label="Next due date"
        type="date"
        fullWidth
        InputLabelProps={{ shrink: true }}
        error={!!errors.nextDueDate}
        helperText={errors.nextDueDate?.message ?? "Optional"}
        inputProps={{ "aria-label": "Next due date" }}
      />

      <TextField
        {...register("vetName")}
        label="Veterinarian name"
        fullWidth
        placeholder="Optional"
        error={!!errors.vetName}
        helperText={errors.vetName?.message}
        inputProps={{ "aria-label": "Veterinarian name" }}
      />

      <TextField
        {...register("batchNumber")}
        label="Batch number"
        fullWidth
        placeholder="Optional"
        error={!!errors.batchNumber}
        helperText={errors.batchNumber?.message}
        inputProps={{ "aria-label": "Batch number" }}
      />

      <TextField
        {...register("notes")}
        label="Notes"
        fullWidth
        multiline
        rows={3}
        placeholder="Optional"
        error={!!errors.notes}
        helperText={errors.notes?.message}
        inputProps={{ "aria-label": "Notes" }}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={isLoading}
        sx={{ minHeight: 48 }}
      >
        {isLoading ? "Saving…" : submitLabel}
      </Button>
    </Box>
  );
}
