"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { Controller, useForm } from "react-hook-form";
import {
  type PetFormValues,
  petSchema,
  SEX_OPTIONS,
  SIZE_OPTIONS,
  SPECIES_OPTIONS,
} from "@/lib/validation/pet.schema";

interface PetFormProps {
  defaultValues?: Partial<PetFormValues>;
  onSubmit: (data: PetFormValues) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function PetForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Save pet",
}: PetFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PetFormValues>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: "",
      species: "dog",
      breed: "",
      sex: "male",
      birthday: "",
      isNeutered: false,
      size: undefined,
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
      <TextField
        {...register("name")}
        label="Pet name"
        fullWidth
        required
        error={!!errors.name}
        helperText={errors.name?.message}
        inputProps={{ "aria-label": "Pet name" }}
      />

      <Controller
        name="species"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.species} required>
            <InputLabel id="species-label">Species</InputLabel>
            <Select {...field} labelId="species-label" label="Species">
              {SPECIES_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
            {errors.species && (
              <FormHelperText>{errors.species.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />

      <TextField
        {...register("breed")}
        label="Breed"
        fullWidth
        placeholder="Optional"
        error={!!errors.breed}
        helperText={errors.breed?.message}
        inputProps={{ "aria-label": "Breed" }}
      />

      <Controller
        name="sex"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.sex} required>
            <InputLabel id="sex-label">Sex</InputLabel>
            <Select {...field} labelId="sex-label" label="Sex">
              {SEX_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
            {errors.sex && (
              <FormHelperText>{errors.sex.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />

      <TextField
        {...register("birthday")}
        label="Birthday"
        type="date"
        fullWidth
        InputLabelProps={{ shrink: true }}
        error={!!errors.birthday}
        helperText={errors.birthday?.message}
        inputProps={{ "aria-label": "Birthday" }}
      />

      <Controller
        name="isNeutered"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={field.value}
                onChange={field.onChange}
                inputProps={{ "aria-label": "Neutered / spayed" }}
              />
            }
            label="Neutered / Spayed"
          />
        )}
      />

      <Controller
        name="size"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.size}>
            <InputLabel id="size-label">Size</InputLabel>
            <Select
              {...field}
              value={field.value ?? ""}
              labelId="size-label"
              label="Size"
              displayEmpty
            >
              <MenuItem value="">
                <em>Not specified</em>
              </MenuItem>
              {SIZE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
            {errors.size && (
              <FormHelperText>{errors.size.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />

      <TextField
        {...register("notes")}
        label="Notes"
        fullWidth
        multiline
        rows={3}
        placeholder="Any additional notes about your pet…"
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
      >
        {isLoading ? "Saving…" : submitLabel}
      </Button>
    </Box>
  );
}
