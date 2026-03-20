"use client";

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  PlusCircle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateFoodProduct,
  useFoodProjections,
  useFoodStockItems,
  useLogPurchase,
} from "@/hooks/api/useFoodStock";
import { formatCurrency, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  ok: "bg-success/15 text-success",
  low: "bg-warning/15 text-warning",
  critical: "bg-destructive/15 text-destructive",
};

const PER_PAGE = 5;

export default function StockPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    type: "dry",
    cost: "",
    purchasedAt: "",
  });

  const { data: items = [], isLoading: itemsLoading } = useFoodStockItems();
  const { data: projections = [], isLoading: projectionsLoading } =
    useFoodProjections();
  const createProduct = useCreateFoodProduct();
  const logPurchase = useLogPurchase();

  const isLoading = itemsLoading || projectionsLoading;

  const resetForm = () =>
    setForm({ name: "", brand: "", type: "dry", cost: "", purchasedAt: "" });

  const handleClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) resetForm();
  };

  // Build projection map: itemId → projection
  const projectionMap = new Map(
    projections.map((p) => [p.item.id, p.projection]),
  );

  const activeItems = items.filter((i) => i.attributes.status !== "finished");
  const lowCount = projections.filter(
    (p) => p.projection?.status === "low",
  ).length;
  const critCount = projections.filter(
    (p) => p.projection?.status === "critical",
  ).length;

  // Pagination
  const totalPages = Math.ceil(activeItems.length / PER_PAGE);
  const paginatedItems = activeItems.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE,
  );

  const handleAdd = () => {
    if (!form.name || !form.purchasedAt) return;

    createProduct.mutate(
      {
        name: form.name,
        brand: form.brand || undefined,
        type: form.type as "dry" | "wet" | "treat" | "supplement",
        unitType: "kg",
      },
      {
        onSuccess: (product) => {
          logPurchase.mutate(
            {
              foodProductId: product.id,
              purchasedAt: form.purchasedAt,
              purchaseCost: form.cost ? parseFloat(form.cost) : undefined,
              quantity: 1,
            },
            {
              onSuccess: () => {
                setDialogOpen(false);
                resetForm();
                setPage(1);
              },
            },
          );
        },
      },
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight">Food Stock</h1>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Summary bar */}
      {!isLoading && activeItems.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4 text-sm animate-fade-in-up">
          <span className="font-medium">{activeItems.length} items open</span>
          {" · "}
          <span className="text-warning">{lowCount} low</span>
          {" · "}
          <span className="text-destructive">{critCount} critical</span>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {["s1", "s2", "s3"].map((k) => (
            <Skeleton key={k} className="h-[68px] rounded-lg" />
          ))}
        </div>
      ) : activeItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
          <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold">No food stock tracked</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add products and log purchases to track stock levels
          </p>
          <Button
            size="sm"
            className="mt-4"
            onClick={() => setDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedItems.map((item, i) => {
            const product = item.relationships?.foodProduct;
            const projection = projectionMap.get(item.id);
            const projStatus = projection?.status ?? "good";
            const status =
              projStatus === "critical"
                ? "critical"
                : projStatus === "low"
                  ? "low"
                  : "ok";
            const daysLeft = projection?.daysRemaining;
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Package className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">
                    {product?.attributes.name ?? `Item #${item.id}`}
                    {product?.attributes.brand && (
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        · {product.attributes.brand}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {product?.attributes.type ?? "—"} ·{" "}
                    {formatShortDate(item.attributes.purchasedAt)} ·{" "}
                    {formatCurrency(item.attributes.purchaseCost)}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium uppercase shrink-0",
                    STATUS_COLORS[status],
                  )}
                >
                  {status}
                  {daysLeft != null ? ` — ~${daysLeft}d` : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} · {activeItems.length} items
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add Stock Item Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Stock Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g., Dog Kibble"
                className="mt-1.5 bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Brand</Label>
                <Input
                  value={form.brand}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, brand: e.target.value }))
                  }
                  className="mt-1.5 bg-background"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}
                >
                  <SelectTrigger className="mt-1.5 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dry">Dry Food</SelectItem>
                    <SelectItem value="wet">Wet Food</SelectItem>
                    <SelectItem value="treat">Treat</SelectItem>
                    <SelectItem value="supplement">Supplement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>
                  Cost (₱) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  value={form.cost}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, cost: e.target.value }))
                  }
                  className="mt-1.5 bg-background"
                />
              </div>
              <div>
                <Label>
                  Purchase Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={form.purchasedAt}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, purchasedAt: e.target.value }))
                  }
                  className="mt-1.5 bg-background"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleAdd}
              disabled={
                !form.name ||
                !form.purchasedAt ||
                createProduct.isPending ||
                logPurchase.isPending
              }
            >
              {(createProduct.isPending || logPurchase.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
