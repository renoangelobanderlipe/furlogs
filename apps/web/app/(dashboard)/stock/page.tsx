"use client";

import {
  AlertTriangle,
  History,
  Package,
  PlusCircle,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import { useState } from "react";
import { ActiveConsumptionCard } from "@/components/stock/ActiveConsumptionCard";
import { AddProductDialog } from "@/components/stock/AddProductDialog";
import { EditConsumptionRatesDialog } from "@/components/stock/EditConsumptionRatesDialog";
import { InventoryTable } from "@/components/stock/InventoryTable";
import { LogPurchaseDialog } from "@/components/stock/LogPurchaseDialog";
import { PurchaseHistoryFeed } from "@/components/stock/PurchaseHistoryFeed";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCreateFoodProduct,
  useDeleteConsumptionRate,
  useDeleteFoodProduct,
  useFoodProducts,
  useFoodProjections,
  useFoodStockItems,
  useLogPurchase,
  useMarkFinished,
  useUpdateFoodProduct,
  useUpsertConsumptionRate,
} from "@/hooks/api/useFoodStock";
import { usePets } from "@/hooks/api/usePets";
import type { FoodProduct, FoodProjectionItem } from "@/lib/api/food-stock";
import { cn } from "@/lib/utils";
import type {
  ProductFormValues,
  PurchaseFormValues,
} from "@/lib/validation/food-stock.schema";

const FOOD_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "dry", label: "Dry Food" },
  { value: "wet", label: "Wet Food" },
  { value: "treat", label: "Treat" },
  { value: "supplement", label: "Supplement" },
];

const URGENCY_ORDER: Record<string, number> = {
  critical: 0,
  low: 1,
  good: 2,
  unknown: 3,
};

export default function StockPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<FoodProduct | null>(null);
  const [logPurchaseFor, setLogPurchaseFor] = useState<
    string | null | undefined
  >(undefined);
  const [ratesProduct, setRatesProduct] = useState<FoodProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FoodProduct | null>(null);
  const [finishingItemId, setFinishingItemId] = useState<string | null>(null);

  const { data: products = [], isLoading: productsLoading } = useFoodProducts();
  const { data: stockItems = [], isLoading: itemsLoading } =
    useFoodStockItems();
  const { data: projections = [], isLoading: projectionsLoading } =
    useFoodProjections();
  const { data: petsData } = usePets();
  const pets = petsData?.data ?? [];

  const isLoading = productsLoading || itemsLoading || projectionsLoading;

  const createProduct = useCreateFoodProduct();
  const updateProduct = useUpdateFoodProduct();
  const deleteProduct = useDeleteFoodProduct();
  const logPurchase = useLogPurchase();
  const markFinished = useMarkFinished();
  const upsertRate = useUpsertConsumptionRate();
  const deleteRate = useDeleteConsumptionRate();

  const criticalCount = projections.filter(
    (p) => p.projection?.status === "critical",
  ).length;
  const lowCount = projections.filter(
    (p) => p.projection?.status === "low",
  ).length;
  const alertCount = criticalCount + lowCount;

  const activeProjections: FoodProjectionItem[] = [...projections]
    .filter((p) => p.item.attributes.status !== "finished")
    .sort((a, b) => {
      const aStatus = a.projection?.status ?? "unknown";
      const bStatus = b.projection?.status ?? "unknown";
      return (URGENCY_ORDER[aStatus] ?? 3) - (URGENCY_ORDER[bStatus] ?? 3);
    });

  const filteredProducts = products.filter((p) => {
    if (typeFilter !== "all" && p.attributes.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.attributes.name.toLowerCase().includes(q) ||
        (p.attributes.brand?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const handleAddProduct = (values: ProductFormValues) => {
    createProduct.mutate(values, { onSuccess: () => setAddProductOpen(false) });
  };

  const handleEditProduct = (values: ProductFormValues) => {
    if (!editProduct) return;
    updateProduct.mutate(
      { id: editProduct.id, data: values },
      { onSuccess: () => setEditProduct(null) },
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteProduct.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const handleLogPurchase = (values: PurchaseFormValues) => {
    logPurchase.mutate(values, {
      onSuccess: () => setLogPurchaseFor(undefined),
    });
  };

  const handleLogNewBag = (productId: string) => {
    setLogPurchaseFor(productId);
  };

  const handleAdjustRates = (foodProductId: string) => {
    const fullProduct = products.find((p) => p.id === foodProductId);
    setRatesProduct(fullProduct ?? null);
  };

  const hasFilters = search || typeFilter !== "all";
  const isEmpty =
    !isLoading && products.length === 0 && stockItems.length === 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Food Stock</h1>
            {!isLoading && !isEmpty && (
              <p className="text-sm text-muted-foreground">
                {products.length} product{products.length !== 1 ? "s" : ""}
                {activeProjections.length > 0 &&
                  ` · ${activeProjections.length} open bag${activeProjections.length !== 1 ? "s" : ""}`}
              </p>
            )}
          </div>
        </div>
        {!isEmpty && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setLogPurchaseFor(null)}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Log Purchase
            </Button>
            <Button size="sm" onClick={() => setAddProductOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        )}
      </div>

      {/* Stat cards — shown once data has loaded */}
      {!isLoading && !isEmpty && (
        <div
          className="grid grid-cols-3 gap-3 animate-fade-in-up"
          style={{ animationDelay: "60ms" }}
        >
          <div className="rounded-xl border border-primary/20 bg-card p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <p className="text-xs text-muted-foreground font-medium">
              Products
            </p>
            <p className="text-2xl font-bold tabular-nums mt-1 text-primary">
              {products.length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-transparent pointer-events-none" />
            <p className="text-xs text-muted-foreground font-medium">
              Open Bags
            </p>
            <p className="text-2xl font-bold tabular-nums mt-1">
              {activeProjections.length}
            </p>
          </div>
          <div
            className={cn(
              "rounded-xl border bg-card p-4 relative overflow-hidden",
              alertCount > 0 ? "border-destructive/20" : "border-border",
            )}
          >
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br to-transparent pointer-events-none",
                alertCount > 0 ? "from-destructive/5" : "from-muted/30",
              )}
            />
            <p className="text-xs text-muted-foreground font-medium">
              Low / Critical
            </p>
            <p
              className={cn(
                "text-2xl font-bold tabular-nums mt-1",
                alertCount > 0 ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {alertCount}
            </p>
          </div>
        </div>
      )}

      {/* Alert banner */}
      {!isLoading && criticalCount > 0 && (
        <div
          className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 animate-fade-in-up"
          style={{ animationDelay: "80ms" }}
        >
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive font-medium">
            {criticalCount} item{criticalCount !== 1 ? "s are" : " is"}{" "}
            critically low
            {lowCount > 0 && ` · ${lowCount} more running low`}
          </p>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div
          className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up"
          style={{ animationDelay: "60ms" }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Package className="h-8 w-8 text-primary/60" />
          </div>
          <h2 className="text-lg font-semibold">No food stock tracked</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Add a food product and log a purchase to start tracking your
            pet&apos;s food inventory and consumption
          </p>
          <Button
            className="mt-4"
            size="sm"
            onClick={() => setAddProductOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      )}

      {/* Tabbed content */}
      {!isEmpty && (
        <Tabs
          defaultValue="active"
          className="animate-fade-in-up"
          style={{ animationDelay: "120ms" }}
        >
          <TabsList className="w-full justify-start">
            <TabsTrigger value="active" className="gap-2">
              <Package className="h-3.5 w-3.5" />
              Active Stock
              {activeProjections.length > 0 && (
                <span
                  className={cn(
                    "ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                    alertCount > 0
                      ? "bg-destructive/15 text-destructive"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {activeProjections.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              Products
              {products.length > 0 && (
                <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold leading-none text-muted-foreground">
                  {products.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-3.5 w-3.5" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Active Stock Tab */}
          <TabsContent value="active" className="mt-4 space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {["s1", "s2"].map((k) => (
                  <Skeleton key={k} className="h-[200px] rounded-xl" />
                ))}
              </div>
            ) : activeProjections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-border bg-muted/20">
                <Package className="h-8 w-8 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  No open bags
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Log a purchase to start tracking stock consumption
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setLogPurchaseProductId(null);
                    setLogPurchaseOpen(true);
                  }}
                >
                  <ShoppingCart className="mr-2 h-3.5 w-3.5" />
                  Log Purchase
                </Button>
              </div>
            ) : (
              activeProjections.map((projItem, i) => (
                <div
                  key={projItem.item.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <ActiveConsumptionCard
                    projectionItem={projItem}
                    pets={pets}
                    onAdjustRates={() =>
                      handleAdjustRates(projItem.item.attributes.foodProductId)
                    }
                    onMarkFinished={() => {
                      setFinishingItemId(projItem.item.id);
                      markFinished.mutate(projItem.item.id, {
                        onSettled: () => setFinishingItemId(null),
                      });
                    }}
                    onLogNewBag={() =>
                      handleLogNewBag(projItem.item.attributes.foodProductId)
                    }
                    isMarkingFinished={finishingItemId === projItem.item.id}
                  />
                </div>
              ))
            )}
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-4 space-y-3">
            {/* Search + filter bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products…"
                  className="pl-8 h-9 text-sm bg-background"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9 w-36 text-sm bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOOD_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 text-xs"
                  onClick={() => {
                    setSearch("");
                    setTypeFilter("all");
                  }}
                >
                  Clear
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="ml-auto h-9"
                onClick={() => setAddProductOpen(true)}
              >
                <PlusCircle className="mr-2 h-3.5 w-3.5" />
                Add Product
              </Button>
            </div>

            {isLoading ? (
              <Skeleton className="h-[200px] rounded-lg" />
            ) : filteredProducts.length === 0 && hasFilters ? (
              <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-border bg-muted/20">
                <Search className="h-8 w-8 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  No products found
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Try different search terms or clear your filters
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-xs"
                  onClick={() => {
                    setSearch("");
                    setTypeFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <InventoryTable
                products={filteredProducts}
                projections={projections}
                isLoading={isLoading}
                onEdit={(p) => setEditProduct(p)}
                onDelete={(p) => setDeleteTarget(p)}
                onEditRates={(p) => setRatesProduct(p)}
                onAddProduct={() => setAddProductOpen(true)}
              />
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <PurchaseHistoryFeed items={stockItems} isLoading={isLoading} />
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Add / Edit Product Dialog */}
      <AddProductDialog
        open={addProductOpen || editProduct != null}
        onClose={() => {
          setAddProductOpen(false);
          setEditProduct(null);
        }}
        onSubmit={editProduct ? handleEditProduct : handleAddProduct}
        isLoading={createProduct.isPending || updateProduct.isPending}
        editProduct={editProduct}
      />

      {/* Log Purchase Dialog */}
      <LogPurchaseDialog
        open={logPurchaseFor !== undefined}
        onClose={() => setLogPurchaseFor(undefined)}
        onSubmit={handleLogPurchase}
        isLoading={logPurchase.isPending}
        products={products}
        preselectedProductId={logPurchaseFor ?? null}
      />

      {/* Edit Consumption Rates Dialog */}
      <EditConsumptionRatesDialog
        open={ratesProduct != null}
        onClose={() => setRatesProduct(null)}
        product={ratesProduct}
        pets={pets}
        onUpsert={(productId, data) => upsertRate.mutate({ productId, data })}
        onDelete={(productId, petId) => deleteRate.mutate({ productId, petId })}
        isUpserting={upsertRate.isPending}
        isDeleting={deleteRate.isPending}
      />

      {/* Confirm Delete Dialog */}
      <Dialog
        open={deleteTarget != null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {deleteTarget?.attributes.name}
            </span>
            ? This will also remove all associated stock entries and purchase
            history.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
