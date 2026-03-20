"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

  const form = useForm<ConsumptionRateFormValues>({
    resolver: zodResolver(consumptionRateSchema),
  });

  const existingRates = product?.attributes.consumptionRates ?? [];
  const assignedPetIds = new Set(existingRates.map((r) => r.petId));
  const availablePets = pets.filter((p) => !assignedPetIds.has(p.id));

  const handleAdd = (values: ConsumptionRateFormValues) => {
    if (!product) return;
    onUpsert(product.id, values);
    form.reset();
    setShowAddForm(false);
  };

  const handleClose = () => {
    if (!isUpserting && !isDeleting) {
      setShowAddForm(false);
      form.reset();
      onClose();
    }
  };

  const getPetName = (petId: number): string => {
    const pet = pets.find((p) => p.id === petId);
    return pet?.attributes.name ?? `Pet #${petId}`;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Consumption Rates
            {product && (
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                — {product.attributes.name}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {existingRates.length === 0 && !showAddForm ? (
            <p className="py-4 text-sm text-muted-foreground">
              No consumption rates set. Add one to enable stock projections.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {existingRates.map((rate) => (
                <div
                  key={rate.petId}
                  className="flex items-center gap-3 rounded-md bg-accent/50 px-3 py-2"
                >
                  <Badge variant="secondary">{getPetName(rate.petId)}</Badge>
                  <p className="flex-1 text-sm">
                    {rate.dailyAmountGrams}g / day
                  </p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          if (product) onDelete(product.id, rate.petId);
                        }}
                        disabled={isDeleting}
                        aria-label="Remove rate"
                        className="flex h-8 w-8 items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Remove rate</TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </div>
          )}

          {showAddForm && (
            <>
              <Separator />
              <p className="text-sm font-semibold">Add Consumption Rate</p>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleAdd)}
                  className="flex flex-col gap-4"
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
                          onValueChange={(v) =>
                            field.onChange(v ? Number(v) : null)
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a pet" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availablePets.length === 0 ? (
                              <SelectItem value="" disabled>
                                All pets already assigned
                              </SelectItem>
                            ) : (
                              availablePets.map((pet) => (
                                <SelectItem key={pet.id} value={String(pet.id)}>
                                  {pet.attributes.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dailyAmountGrams"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Daily Amount (grams){" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            step={1}
                            placeholder="Amount in grams"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        form.reset();
                      }}
                      disabled={isUpserting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={isUpserting}>
                      {isUpserting ? "Saving\u2026" : "Save Rate"}
                    </Button>
                  </div>
                </form>
              </Form>
            </>
          )}

          {!showAddForm && availablePets.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="mt-1 self-start gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Rate
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleClose}
            disabled={isUpserting || isDeleting}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
