"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5"
    >
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">
          Pet name <span className="text-destructive">*</span>
        </Label>
        <Input
          {...register("name")}
          id="name"
          placeholder="Buddy"
          aria-label="Pet name"
          className="bg-card"
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Species */}
      <div className="space-y-1.5">
        <Label htmlFor="species">
          Species <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="species"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="species" className="bg-card">
                <SelectValue placeholder="Select species" />
              </SelectTrigger>
              <SelectContent>
                {SPECIES_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.species && (
          <p className="text-xs text-destructive">{errors.species.message}</p>
        )}
      </div>

      {/* Breed */}
      <div className="space-y-1.5">
        <Label htmlFor="breed">Breed</Label>
        <Input
          {...register("breed")}
          id="breed"
          placeholder="Optional"
          aria-label="Breed"
          className="bg-card"
        />
        {errors.breed && (
          <p className="text-xs text-destructive">{errors.breed.message}</p>
        )}
      </div>

      {/* Sex */}
      <div className="space-y-1.5">
        <Label htmlFor="sex">
          Sex <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="sex"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="sex" className="bg-card">
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent>
                {SEX_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.sex && (
          <p className="text-xs text-destructive">{errors.sex.message}</p>
        )}
      </div>

      {/* Birthday */}
      <div className="space-y-1.5">
        <Label htmlFor="birthday">Birthday</Label>
        <Input
          {...register("birthday")}
          id="birthday"
          type="date"
          aria-label="Birthday"
          className="bg-card"
        />
        {errors.birthday && (
          <p className="text-xs text-destructive">{errors.birthday.message}</p>
        )}
      </div>

      {/* Neutered */}
      <Controller
        name="isNeutered"
        control={control}
        render={({ field }) => (
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="isNeutered"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(!!checked)}
              aria-label="Neutered / spayed"
            />
            <Label htmlFor="isNeutered" className="cursor-pointer font-normal">
              Neutered / Spayed
            </Label>
          </div>
        )}
      />

      {/* Size */}
      <div className="space-y-1.5">
        <Label htmlFor="size">Size</Label>
        <Controller
          name="size"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value ?? "none"}
              onValueChange={(v) =>
                field.onChange(v === "none" ? undefined : v)
              }
            >
              <SelectTrigger id="size" className="bg-card">
                <SelectValue placeholder="Not specified" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not specified</SelectItem>
                {SIZE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.size && (
          <p className="text-xs text-destructive">{errors.size.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          {...register("notes")}
          id="notes"
          rows={3}
          placeholder="Any additional notes about your pet…"
          aria-label="Notes"
          className="bg-card resize-none"
        />
        {errors.notes && (
          <p className="text-xs text-destructive">{errors.notes.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
