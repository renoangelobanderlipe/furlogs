import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { foodStockEndpoints } from "@/lib/api/food-stock";
import type {
  ConsumptionRateFormValues,
  ProductFormValues,
  PurchaseFormValues,
} from "@/lib/validation/food-stock.schema";
import {
  dashboardKeys,
  foodProductKeys,
  foodProjectionKeys,
  foodStockItemKeys,
} from "./queryKeys";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

function extractMessage(error: unknown, fallback: string): string {
  return (
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? fallback
  );
}

// ─── Products ────────────────────────────────────────────────────────────────

export function useFoodProducts() {
  return useQuery({
    queryKey: foodProductKeys.lists(),
    queryFn: () => foodStockEndpoints.listProducts().then((r) => r.data.data),
    staleTime: STALE_TIME,
  });
}

export function useCreateFoodProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductFormValues) =>
      foodStockEndpoints.createProduct(data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodProductKeys.lists() });
      toast.success("Product added!");
    },
    onError: (error: unknown) => {
      toast.error(extractMessage(error, "Failed to add product."));
    },
  });
}

export function useUpdateFoodProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ProductFormValues>;
    }) => foodStockEndpoints.updateProduct(id, data).then((r) => r.data.data),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: foodProductKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: foodProductKeys.detail(product.id),
      });
      toast.success("Product updated!");
    },
    onError: (error: unknown) => {
      toast.error(extractMessage(error, "Failed to update product."));
    },
  });
}

export function useDeleteFoodProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      foodStockEndpoints.deleteProduct(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodProductKeys.lists() });
      queryClient.invalidateQueries({ queryKey: foodProjectionKeys.all });
      toast.success("Product deleted.");
    },
    onError: (error: unknown) => {
      toast.error(extractMessage(error, "Failed to delete product."));
    },
  });
}

export function useUpsertConsumptionRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: ConsumptionRateFormValues;
    }) =>
      foodStockEndpoints
        .upsertConsumptionRate(productId, data)
        .then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodProductKeys.lists() });
      queryClient.invalidateQueries({ queryKey: foodProjectionKeys.all });
      toast.success("Consumption rate saved!");
    },
    onError: (error: unknown) => {
      toast.error(extractMessage(error, "Failed to save consumption rate."));
    },
  });
}

export function useDeleteConsumptionRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, petId }: { productId: string; petId: string }) =>
      foodStockEndpoints
        .deleteConsumptionRate(productId, petId)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodProductKeys.lists() });
      queryClient.invalidateQueries({ queryKey: foodProjectionKeys.all });
      toast.success("Consumption rate removed.");
    },
    onError: (error: unknown) => {
      toast.error(extractMessage(error, "Failed to remove consumption rate."));
    },
  });
}

// ─── Stock Items ─────────────────────────────────────────────────────────────

export function useFoodStockItems() {
  return useQuery({
    queryKey: foodStockItemKeys.lists(),
    queryFn: () => foodStockEndpoints.listItems().then((r) => r.data.data),
    staleTime: STALE_TIME,
  });
}

export function useLogPurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PurchaseFormValues) =>
      foodStockEndpoints.createItem(data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodStockItemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: foodProjectionKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success("Purchase logged!");
    },
    onError: (error: unknown) => {
      toast.error(extractMessage(error, "Failed to log purchase."));
    },
  });
}

export function useOpenStockItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      foodStockEndpoints.openItem(id).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodStockItemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: foodProjectionKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success("Bag opened!");
    },
    onError: (error: unknown) => {
      toast.error(extractMessage(error, "Failed to mark as opened."));
    },
  });
}

export function useMarkFinished() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      foodStockEndpoints.markFinished(id).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodStockItemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: foodProjectionKeys.all });
      toast.success("Bag marked as finished.");
    },
    onError: (error: unknown) => {
      toast.error(extractMessage(error, "Failed to mark as finished."));
    },
  });
}

// ─── Projections ─────────────────────────────────────────────────────────────

export function useFoodProjections() {
  return useQuery({
    queryKey: foodProjectionKeys.all,
    queryFn: () => foodStockEndpoints.getProjections().then((r) => r.data.data),
    staleTime: STALE_TIME,
  });
}
