"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePets } from "@/hooks/api/usePets";
import {
  type VaccinationFormInput,
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

  const form = useForm<VaccinationFormInput, unknown, VaccinationFormValues>({
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5"
      >
        <FormField
          control={form.control}
          name="petId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Pet <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(v) => field.onChange(Number(v))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a pet" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={String(pet.id)}>
                      {pet.attributes.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vaccineName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Vaccine name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} aria-label="Vaccine name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="administeredDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Administered date <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} type="date" aria-label="Administered date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nextDueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Next due date</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  aria-label="Next due date"
                  placeholder="Optional"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vetName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Veterinarian name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  aria-label="Veterinarian name"
                  placeholder="Optional"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="batchNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Batch number</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  aria-label="Batch number"
                  placeholder="Optional"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={3}
                  aria-label="Notes"
                  placeholder="Optional"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full min-h-[48px]"
          disabled={isLoading}
        >
          {isLoading ? "Saving\u2026" : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
