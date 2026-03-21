"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Heart, Loader2, User } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
    watch,
    setValue,
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

  const isNeuteredValue = watch("isNeutered");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5 py-4"
    >
      {/* Name hero */}
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 to-muted/20 p-5">
        <Label
          htmlFor="name"
          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
        >
          Pet Name <span className="text-destructive">*</span>
        </Label>
        <Input
          {...register("name")}
          id="name"
          placeholder="e.g., Biscuit"
          aria-label="Pet name"
          className="mt-1.5 bg-background/60 text-base font-medium"
        />
        {errors.name && (
          <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Basic Info */}
      <div>
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
          <User className="h-3 w-3" />
          Basic Info
        </p>
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-4">
          {/* Species + Sex */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="species"
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Species <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="species"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="species" className="mt-1.5 bg-muted/50">
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
                <p className="text-xs text-destructive mt-1">
                  {errors.species.message}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="sex"
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Sex <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="sex"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="sex" className="mt-1.5 bg-muted/50">
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
                <p className="text-xs text-destructive mt-1">
                  {errors.sex.message}
                </p>
              )}
            </div>
          </div>

          {/* Breed */}
          <div>
            <Label
              htmlFor="breed"
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Breed
            </Label>
            <Input
              {...register("breed")}
              id="breed"
              placeholder="e.g., Golden Retriever"
              aria-label="Breed"
              className="mt-1.5 bg-muted/50"
            />
            {errors.breed && (
              <p className="text-xs text-destructive mt-1">
                {errors.breed.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Health & Vitals */}
      <div>
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
          <Heart className="h-3 w-3" />
          Health &amp; Vitals
        </p>
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-4">
          {/* Birthday */}
          <div>
            <Label
              htmlFor="birthday"
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Birthday
            </Label>
            <Input
              {...register("birthday")}
              id="birthday"
              type="date"
              aria-label="Birthday"
              className="mt-1.5 bg-muted/50"
            />
            {errors.birthday && (
              <p className="text-xs text-destructive mt-1">
                {errors.birthday.message}
              </p>
            )}
          </div>

          {/* Size */}
          <div>
            <Label
              htmlFor="size"
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Size
            </Label>
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
                  <SelectTrigger id="size" className="mt-1.5 bg-muted/50">
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
              <p className="text-xs text-destructive mt-1">
                {errors.size.message}
              </p>
            )}
          </div>

          {/* Neutered */}
          <div className="flex items-center gap-3 rounded-lg border border-border/50 px-4 py-3">
            <Switch
              id="isNeutered"
              checked={isNeuteredValue}
              onCheckedChange={(v) => setValue("isNeutered", v)}
            />
            <Label
              htmlFor="isNeutered"
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground cursor-pointer"
            >
              Neutered / Spayed
            </Label>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
          <FileText className="h-3 w-3" />
          Notes
        </p>
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
          <Textarea
            {...register("notes")}
            id="notes"
            rows={3}
            placeholder="Any additional notes about your pet…"
            aria-label="Notes"
            className="bg-muted/50 resize-none"
          />
          {errors.notes && (
            <p className="text-xs text-destructive mt-1">
              {errors.notes.message}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground mt-1.5">
            Allergies, special diet, behavioral notes…
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border pt-5 mt-1">
        <DialogClose asChild>
          <Button type="button" variant="ghost" size="sm">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
