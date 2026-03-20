"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { Controller, useForm } from "react-hook-form";
import type { Pet } from "@/lib/api/pets";
import type { ReminderType } from "@/lib/api/reminders";
import {
  type ReminderFormValues,
  reminderSchema,
} from "@/lib/validation/reminder.schema";

const REMINDER_TYPE_OPTIONS: { label: string; value: ReminderType }[] = [
  { label: "Vaccination", value: "vaccination" },
  { label: "Medication", value: "medication" },
  { label: "Vet Appointment", value: "vet_appointment" },
  { label: "Food Stock", value: "food_stock" },
  { label: "Custom", value: "custom" },
];

interface ReminderFormProps {
  pets: Pet[];
  initialValues?: Partial<ReminderFormValues>;
  isLoading?: boolean;
  onSuccess: (values: ReminderFormValues) => void;
  onCancel: () => void;
}

export function ReminderForm({
  pets,
  initialValues,
  isLoading = false,
  onSuccess,
  onCancel,
}: ReminderFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      petId: initialValues?.petId ?? null,
      type: initialValues?.type ?? "custom",
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      dueDate: initialValues?.dueDate ?? "",
      isRecurring: initialValues?.isRecurring ?? false,
      recurrenceDays: initialValues?.recurrenceDays ?? null,
    },
  });

  const isRecurring = watch("isRecurring");

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSuccess)}
      display="flex"
      flexDirection="column"
      gap={2.5}
    >
      {/* Pet selector */}
      <Controller
        name="petId"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.petId}>
            <InputLabel id="reminder-pet-label">Pet (optional)</InputLabel>
            <Select
              labelId="reminder-pet-label"
              label="Pet (optional)"
              value={
                field.value !== null && field.value !== undefined
                  ? String(field.value)
                  : ""
              }
              onChange={(e) =>
                field.onChange(
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
            >
              <MenuItem value="">
                <em>Household (no specific pet)</em>
              </MenuItem>
              {pets.map((pet) => (
                <MenuItem key={pet.id} value={String(pet.id)}>
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

      {/* Type selector */}
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.type}>
            <InputLabel id="reminder-type-label">Type</InputLabel>
            <Select
              labelId="reminder-type-label"
              label="Type"
              value={field.value}
              onChange={field.onChange}
            >
              {REMINDER_TYPE_OPTIONS.map((opt) => (
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

      {/* Title */}
      <TextField
        label="Title"
        {...register("title")}
        error={!!errors.title}
        helperText={errors.title?.message}
        fullWidth
        required
      />

      {/* Description */}
      <TextField
        label="Description (optional)"
        {...register("description")}
        error={!!errors.description}
        helperText={errors.description?.message}
        fullWidth
        multiline
        rows={2}
      />

      {/* Due date */}
      <TextField
        label="Due date"
        type="date"
        {...register("dueDate")}
        error={!!errors.dueDate}
        helperText={errors.dueDate?.message ?? "YYYY-MM-DD"}
        fullWidth
        required
        slotProps={{ inputLabel: { shrink: true } }}
      />

      {/* Recurring toggle */}
      <Controller
        name="isRecurring"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Switch
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            }
            label="Recurring reminder"
          />
        )}
      />

      {/* Recurrence days — only shown when isRecurring is true */}
      {isRecurring && (
        <TextField
          label="Repeat every (days)"
          type="number"
          {...register("recurrenceDays", { valueAsNumber: true })}
          error={!!errors.recurrenceDays}
          helperText={errors.recurrenceDays?.message ?? "1–365 days"}
          fullWidth
          required
          inputProps={{ min: 1, max: 365 }}
        />
      )}

      {/* Actions */}
      <Box display="flex" gap={1.5} justifyContent="flex-end" pt={1}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={isLoading}
          sx={{ minHeight: 44 }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          sx={{ minHeight: 44 }}
        >
          {isLoading ? "Saving…" : "Save reminder"}
        </Button>
      </Box>
    </Box>
  );
}
