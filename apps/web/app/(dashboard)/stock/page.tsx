"use client";

import AddIcon from "@mui/icons-material/Add";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import { ActiveConsumptionCard } from "@/components/stock/ActiveConsumptionCard";
import { AddProductDialog } from "@/components/stock/AddProductDialog";
import { EditConsumptionRatesDialog } from "@/components/stock/EditConsumptionRatesDialog";
import { InventoryTable } from "@/components/stock/InventoryTable";
import { LogPurchaseDialog } from "@/components/stock/LogPurchaseDialog";
import { PurchaseHistoryFeed } from "@/components/stock/PurchaseHistoryFeed";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
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
import type {
  FoodProduct,
  FoodProjectionItem,
  FoodStockItem,
} from "@/lib/api/food-stock";
import type {
  ConsumptionRateFormValues,
  ProductFormValues,
  PurchaseFormValues,
} from "@/lib/validation/food-stock.schema";

// ─── Helper ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function isThisMonth(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  );
}

// ─── Stats row ───────────────────────────────────────────────────────────────

interface StatsRowProps {
  products: FoodProduct[];
  items: FoodStockItem[];
  projections: FoodProjectionItem[];
  isLoading: boolean;
}

function StatsRow({ products, items, projections, isLoading }: StatsRowProps) {
  if (isLoading) {
    return (
      <Grid container spacing={2} mb={3}>
        {Array.from({ length: 4 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
          <Grid key={i} size={{ xs: 6, md: 3 }}>
            <Skeleton variant="rounded" height={88} />
          </Grid>
        ))}
      </Grid>
    );
  }

  const alertCount = projections.filter(
    (p) =>
      p.projection?.status === "low" || p.projection?.status === "critical",
  ).length;

  const monthlySpend = items
    .filter((item) => isThisMonth(item.attributes.purchasedAt))
    .reduce((sum, item) => sum + (item.attributes.purchaseCost ?? 0), 0);

  const projectionsWithData = projections.filter((p) => p.projection != null);
  const avgDays =
    projectionsWithData.length > 0
      ? projectionsWithData.reduce(
          (sum, p) => sum + (p.projection?.daysRemaining ?? 0),
          0,
        ) / projectionsWithData.length
      : 0;

  return (
    <Grid container spacing={2} mb={3}>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          label="Total Products"
          value={products.length}
          icon={<Inventory2Icon />}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          label="Low / Critical"
          value={alertCount}
          subtitle="items need attention"
          icon={<TrendingDownIcon />}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          label="Monthly Spend"
          value={formatCurrency(monthlySpend)}
          subtitle="this month"
          icon={<ShoppingCartIcon />}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          label="Avg Days Remaining"
          value={
            Number.isNaN(avgDays) || avgDays === 0
              ? "—"
              : `${avgDays.toFixed(0)}d`
          }
          subtitle="across open bags"
        />
      </Grid>
    </Grid>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StockPage() {
  const [activeTab, setActiveTab] = useState(0);

  // Dialog state
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<FoodProduct | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<FoodProduct | null>(null);
  const [logPurchaseOpen, setLogPurchaseOpen] = useState(false);
  const [preselectedProductId, setPreselectedProductId] = useState<
    number | null
  >(null);
  const [ratesProduct, setRatesProduct] = useState<FoodProduct | null>(null);
  const [finishItem, setFinishItem] = useState<FoodStockItem | null>(null);

  // Data queries
  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
  } = useFoodProducts();

  const {
    data: items = [],
    isLoading: itemsLoading,
    isError: itemsError,
  } = useFoodStockItems();

  const {
    data: projections = [],
    isLoading: projectionsLoading,
    isError: projectionsError,
  } = useFoodProjections();

  const { data: petsData } = usePets();
  const pets = petsData?.data ?? [];

  // Mutations
  const createProduct = useCreateFoodProduct();
  const updateProduct = useUpdateFoodProduct();
  const deleteProductMutation = useDeleteFoodProduct();
  const logPurchase = useLogPurchase();
  const markFinished = useMarkFinished();
  const upsertRate = useUpsertConsumptionRate();
  const deleteRate = useDeleteConsumptionRate();

  const isLoading = productsLoading || itemsLoading || projectionsLoading;

  // ── Derived ──

  const criticalProjections = projections.filter(
    (p) => p.projection?.status === "critical",
  );

  const openItems = items
    .filter((item) => item.attributes.status === "open")
    .map((item) => {
      const proj = projections.find((p) => p.item.id === item.id);
      return proj ?? { item, projection: null };
    })
    .sort((a, b) => {
      const order: Record<string, number> = { critical: 0, low: 1, good: 2 };
      return (
        (order[a.projection?.status ?? "good"] ?? 2) -
        (order[b.projection?.status ?? "good"] ?? 2)
      );
    });

  // ── Handlers ──

  const handleProductSubmit = (values: ProductFormValues) => {
    if (editProduct) {
      updateProduct.mutate(
        { id: editProduct.id, data: values },
        { onSuccess: () => setEditProduct(null) },
      );
    } else {
      createProduct.mutate(values, {
        onSuccess: () => setAddProductOpen(false),
      });
    }
  };

  const handlePurchaseSubmit = (values: PurchaseFormValues) => {
    logPurchase.mutate(values, {
      onSuccess: () => {
        setLogPurchaseOpen(false);
        setPreselectedProductId(null);
      },
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteProduct) return;
    deleteProductMutation.mutate(deleteProduct.id, {
      onSuccess: () => setDeleteProduct(null),
    });
  };

  const handleMarkFinished = () => {
    if (!finishItem) return;
    markFinished.mutate(finishItem.id, {
      onSuccess: () => setFinishItem(null),
    });
  };

  const handleUpsertRate = (
    productId: number,
    data: ConsumptionRateFormValues,
  ) => {
    upsertRate.mutate({ productId, data });
  };

  const handleDeleteRate = (productId: number, petId: number) => {
    deleteRate.mutate({ productId, petId });
  };

  const openLogNewBag = (productId: number) => {
    setPreselectedProductId(productId);
    setLogPurchaseOpen(true);
  };

  // ── Render ──

  const hasError = productsError || itemsError || projectionsError;

  return (
    <Box>
      {/* Page header */}
      <Box
        display="flex"
        alignItems={{ xs: "flex-start", sm: "center" }}
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Food Stock
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track food inventory and consumption for your pets
          </Typography>
        </Box>
        <Box flexGrow={1} />
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<ShoppingCartIcon />}
            onClick={() => {
              setPreselectedProductId(null);
              setLogPurchaseOpen(true);
            }}
            sx={{ minHeight: 48 }}
          >
            Log Purchase
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditProduct(null);
              setAddProductOpen(true);
            }}
            sx={{ minHeight: 48 }}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Error alert */}
      {hasError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load food stock data. Please refresh the page.
        </Alert>
      )}

      {/* Critical alert bar */}
      {!isLoading && criticalProjections.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>Critical stock level</strong> — running out soon:{" "}
          {criticalProjections
            .map(
              (p) =>
                p.item.attributes.foodProduct?.attributes.name ??
                `Item #${p.item.id}`,
            )
            .join(", ")}
        </Alert>
      )}

      {/* Stats */}
      <StatsRow
        products={products}
        items={items}
        projections={projections}
        isLoading={isLoading}
      />

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v: number) => setActiveTab(v)}
        sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
      >
        <Tab label="Inventory" />
        <Tab
          label={
            openItems.length > 0
              ? `Active (${openItems.length})`
              : "Active Consumption"
          }
        />
        <Tab label="Purchase History" />
      </Tabs>

      {/* Tab 1: Inventory */}
      {activeTab === 0 && (
        <InventoryTable
          products={products}
          projections={projections}
          isLoading={isLoading}
          onEdit={(product) => {
            setEditProduct(product);
            setAddProductOpen(true);
          }}
          onDelete={(product) => setDeleteProduct(product)}
          onEditRates={(product) => setRatesProduct(product)}
          onAddProduct={() => {
            setEditProduct(null);
            setAddProductOpen(true);
          }}
        />
      )}

      {/* Tab 2: Active Consumption */}
      {activeTab === 1 && (
        <Box>
          {isLoading ? (
            <Box display="flex" flexDirection="column" gap={2}>
              {Array.from({ length: 3 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                <Skeleton key={i} variant="rounded" height={240} />
              ))}
            </Box>
          ) : openItems.length === 0 ? (
            <EmptyState
              title="No open bags"
              description="Log a purchase and mark a bag as open to see active consumption tracking."
              action={{
                label: "Log Purchase",
                onClick: () => setLogPurchaseOpen(true),
              }}
            />
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {openItems.map((projItem) => {
                const productForRates = products.find(
                  (p) => p.id === projItem.item.attributes.foodProductId,
                );
                return (
                  <ActiveConsumptionCard
                    key={projItem.item.id}
                    projectionItem={projItem}
                    pets={pets}
                    onAdjustRates={() =>
                      setRatesProduct(productForRates ?? null)
                    }
                    onMarkFinished={() => setFinishItem(projItem.item)}
                    onLogNewBag={() =>
                      openLogNewBag(projItem.item.attributes.foodProductId)
                    }
                    isMarkingFinished={
                      markFinished.isPending &&
                      finishItem?.id === projItem.item.id
                    }
                  />
                );
              })}
            </Box>
          )}
        </Box>
      )}

      {/* Tab 3: Purchase History */}
      {activeTab === 2 && (
        <PurchaseHistoryFeed items={items} isLoading={itemsLoading} />
      )}

      {/* ── Dialogs ── */}

      <AddProductDialog
        open={addProductOpen}
        onClose={() => {
          setAddProductOpen(false);
          setEditProduct(null);
        }}
        onSubmit={handleProductSubmit}
        isLoading={createProduct.isPending || updateProduct.isPending}
        editProduct={editProduct}
      />

      <LogPurchaseDialog
        open={logPurchaseOpen}
        onClose={() => {
          setLogPurchaseOpen(false);
          setPreselectedProductId(null);
        }}
        onSubmit={handlePurchaseSubmit}
        isLoading={logPurchase.isPending}
        products={products}
        preselectedProductId={preselectedProductId}
      />

      <EditConsumptionRatesDialog
        open={ratesProduct != null}
        onClose={() => setRatesProduct(null)}
        product={ratesProduct}
        pets={pets}
        onUpsert={handleUpsertRate}
        onDelete={handleDeleteRate}
        isUpserting={upsertRate.isPending}
        isDeleting={deleteRate.isPending}
      />

      <ConfirmDialog
        open={deleteProduct != null}
        title="Delete product?"
        description={
          deleteProduct
            ? `Are you sure you want to delete "${deleteProduct.attributes.name}"? All stock history for this product will also be removed.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteProduct(null)}
        isLoading={deleteProductMutation.isPending}
      />

      <ConfirmDialog
        open={finishItem != null}
        title="Mark bag as finished?"
        description={
          finishItem
            ? `This will record that the bag of ${finishItem.attributes.foodProduct?.attributes.name ?? "this product"} has been fully used.`
            : ""
        }
        confirmLabel="Mark Finished"
        onConfirm={handleMarkFinished}
        onCancel={() => setFinishItem(null)}
        isLoading={markFinished.isPending}
      />
    </Box>
  );
}
