import type {
  ConsumptionRateFormValues,
  ProductFormValues,
  PurchaseFormValues,
} from "@/lib/validation/food-stock.schema";
import { apiClient } from "./client";

export type FoodType = "dry" | "wet" | "treat" | "supplement";
export type UnitType = "kg" | "can" | "pack" | "piece";
export type StockStatus = "sealed" | "open" | "finished";
export type ProjectionStatus = "good" | "low" | "critical";

export interface FoodConsumptionRate {
  petId: number;
  dailyAmountGrams: number;
}

export interface FoodProductAttributes {
  name: string;
  brand: string | null;
  type: FoodType;
  unitWeightGrams: number | null;
  unitType: UnitType;
  alertThresholdPct: number | null;
  notes: string | null;
  consumptionRates?: FoodConsumptionRate[];
  createdAt: string;
  updatedAt: string;
}

export interface FoodProduct {
  id: number;
  type: "food-products";
  attributes: FoodProductAttributes;
}

export interface FoodStockItemAttributes {
  foodProductId: number;
  status: StockStatus;
  purchasedAt: string;
  openedAt: string | null;
  finishedAt: string | null;
  purchaseCost: number | null;
  purchaseSource: string | null;
  quantity: number;
  notes: string | null;
  daysSinceOpened: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface FoodStockItem {
  id: number;
  type: "food-stock-items";
  attributes: FoodStockItemAttributes;
  relationships?: {
    foodProduct?: FoodProduct;
  };
}

export interface FoodProjection {
  remainingGrams: number;
  daysRemaining: number;
  runsOutDate: string;
  status: ProjectionStatus;
  totalDailyRate: number;
  percentageRemaining: number;
}

export interface FoodProjectionItem {
  item: FoodStockItem;
  projection: FoodProjection | null;
}

export interface FoodProductListResponse {
  data: FoodProduct[];
}

export interface FoodProductResponse {
  data: FoodProduct;
}

export interface FoodStockItemListResponse {
  data: FoodStockItem[];
}

export interface FoodStockItemResponse {
  data: FoodStockItem;
}

export interface FoodProjectionsResponse {
  data: FoodProjectionItem[];
}

function toProductPayload(
  data: ProductFormValues | Partial<ProductFormValues>,
) {
  return {
    name: data.name,
    brand: data.brand || null,
    type: data.type,
    unit_weight_grams: data.unitWeightGrams ?? null,
    unit_type: data.unitType,
    alert_threshold_pct: data.alertThresholdPct ?? null,
    notes: data.notes || null,
  };
}

function toPurchasePayload(data: PurchaseFormValues) {
  return {
    food_product_id: data.foodProductId,
    purchased_at: data.purchasedAt,
    purchase_cost: data.purchaseCost ?? null,
    purchase_source: data.purchaseSource || null,
    quantity: data.quantity ?? 1,
  };
}

function toConsumptionRatePayload(data: ConsumptionRateFormValues) {
  return {
    pet_id: data.petId,
    daily_amount_grams: data.dailyAmountGrams,
  };
}

export const foodStockEndpoints = {
  // Food Products
  listProducts: () =>
    apiClient.get<FoodProductListResponse>("/api/food-products"),

  getProduct: (id: number) =>
    apiClient.get<FoodProductResponse>(`/api/food-products/${id}`),

  createProduct: (data: ProductFormValues) =>
    apiClient.post<FoodProductResponse>(
      "/api/food-products",
      toProductPayload(data),
    ),

  updateProduct: (id: number, data: Partial<ProductFormValues>) =>
    apiClient.patch<FoodProductResponse>(
      `/api/food-products/${id}`,
      toProductPayload(data),
    ),

  deleteProduct: (id: number) => apiClient.delete(`/api/food-products/${id}`),

  upsertConsumptionRate: (productId: number, data: ConsumptionRateFormValues) =>
    apiClient.post<FoodProductResponse>(
      `/api/food-products/${productId}/consumption-rates`,
      toConsumptionRatePayload(data),
    ),

  deleteConsumptionRate: (productId: number, petId: number) =>
    apiClient.delete(
      `/api/food-products/${productId}/consumption-rates/${petId}`,
    ),

  // Food Stock Items
  listItems: () =>
    apiClient.get<FoodStockItemListResponse>("/api/food-stock-items"),

  createItem: (data: PurchaseFormValues) =>
    apiClient.post<FoodStockItemResponse>(
      "/api/food-stock-items",
      toPurchasePayload(data),
    ),

  openItem: (id: number) =>
    apiClient.patch<FoodStockItemResponse>(`/api/food-stock-items/${id}/open`),

  markFinished: (id: number) =>
    apiClient.patch<FoodStockItemResponse>(
      `/api/food-stock-items/${id}/finish`,
    ),

  deleteItem: (id: number) => apiClient.delete(`/api/food-stock-items/${id}`),

  // Projections
  getProjections: () =>
    apiClient.get<FoodProjectionsResponse>("/api/food-stock/projections"),
};
