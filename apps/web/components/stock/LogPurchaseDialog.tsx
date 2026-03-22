"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
  preselectedProductId?: string | null;
}

export const LogPurchaseDialog = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  products,
  preselectedProductId,
}: LogPurchaseDialogProps) => {
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      purchasedAt: new Date().toISOString().slice(0, 10),
      quantity: 1,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        foodProductId: preselectedProductId ?? undefined,
        purchasedAt: new Date().toISOString().slice(0, 10),
        quantity: 1,
        purchaseCost: undefined,
        purchaseSource: "",
      });
    }
  }, [open, preselectedProductId, form]);

  const handleClose = () => {
    if (!isLoading) onClose();
  };

  const getProductLabel = (product: FoodProduct): string => {
    const brand = product.attributes.brand;
    return brand
      ? `${product.attributes.name} (${brand})`
      : product.attributes.name;
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
          <DialogTitle>Log Purchase</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="foodProductId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Food Product <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(v) => field.onChange(v ? v : null)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={String(product.id)}>
                          {getProductLabel(product)}
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
              name="purchasedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Purchase Date <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      placeholder="Number of units purchased"
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

            <FormField
              control={form.control}
              name="purchaseCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Cost</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        ₱
                      </span>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="Optional"
                        className="pl-7"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchaseSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Source</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Petco, Amazon, Local store"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Logging\u2026" : "Log Purchase"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
