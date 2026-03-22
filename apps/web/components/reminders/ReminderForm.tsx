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

export const ReminderForm = ({
  pets,
  initialValues,
  isLoading = false,
  onSuccess,
  onCancel,
}: ReminderFormProps) => {
  const form = useForm<ReminderFormValues>({
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

  const isRecurring = form.watch("isRecurring");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSuccess)}
        className="flex flex-col gap-5"
      >
        {/* Pet selector */}
        <FormField
          control={form.control}
          name="petId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pet (optional)</FormLabel>
              <Select
                value={
                  field.value !== null && field.value !== undefined
                    ? String(field.value)
                    : "none"
                }
                onValueChange={(v) => field.onChange(v === "none" ? null : v)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Household (no specific pet)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">
                    <em>Household (no specific pet)</em>
                  </SelectItem>
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

        {/* Type selector */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {REMINDER_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Title <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="Reminder title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea {...field} rows={2} placeholder="Optional details" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Due date */}
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Due date <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} type="date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Recurring toggle */}
        <FormField
          control={form.control}
          name="isRecurring"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <Label
                  className="cursor-pointer"
                  onClick={() => field.onChange(!field.value)}
                >
                  Recurring reminder
                </Label>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Recurrence days — only shown when isRecurring is true */}
        {isRecurring && (
          <FormField
            control={form.control}
            name="recurrenceDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Repeat every (days){" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    placeholder="1–365 days"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="min-h-[44px]"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="min-h-[44px]">
            {isLoading ? "Saving\u2026" : "Save reminder"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
