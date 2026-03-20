"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SpeedIcon from "@mui/icons-material/Speed";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { EmptyState } from "@/components/ui/EmptyState";
import type {
  FoodProduct,
  FoodProjectionItem,
  ProjectionStatus,
} from "@/lib/api/food-stock";

interface InventoryTableProps {
  products: FoodProduct[];
  projections: FoodProjectionItem[];
  isLoading: boolean;
  onEdit: (product: FoodProduct) => void;
  onDelete: (product: FoodProduct) => void;
  onEditRates: (product: FoodProduct) => void;
  onAddProduct: () => void;
}

const FOOD_TYPE_LABELS: Record<string, string> = {
  dry: "Dry",
  wet: "Wet",
  treat: "Treat",
  supplement: "Supplement",
};

const STATUS_COLOR_MAP: Record<
  ProjectionStatus,
  "success" | "warning" | "error"
> = {
  good: "success",
  low: "warning",
  critical: "error",
};

const PROGRESS_COLOR_MAP: Record<
  ProjectionStatus,
  "success" | "warning" | "error"
> = {
  good: "success",
  low: "warning",
  critical: "error",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface InventoryRowProps {
  product: FoodProduct;
  projection: FoodProjectionItem | undefined;
  onEdit: () => void;
  onDelete: () => void;
  onEditRates: () => void;
}

function InventoryRow({
  product,
  projection,
  onEdit,
  onDelete,
  onEditRates,
}: InventoryRowProps) {
  const attr = product.attributes;
  const proj = projection?.projection ?? null;
  const rateCount = attr.consumptionRates?.length ?? 0;

  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="body2" fontWeight={600}>
          {attr.name}
        </Typography>
        {attr.brand && (
          <Chip
            label={attr.brand}
            size="small"
            variant="outlined"
            sx={{ mt: 0.5 }}
          />
        )}
      </TableCell>

      <TableCell>
        <Chip
          label={FOOD_TYPE_LABELS[attr.type] ?? attr.type}
          size="small"
          variant="outlined"
        />
      </TableCell>

      <TableCell>
        {proj ? (
          <Chip
            label={proj.status}
            size="small"
            color={STATUS_COLOR_MAP[proj.status]}
            variant="outlined"
          />
        ) : (
          <Typography variant="caption" color="text.disabled">
            —
          </Typography>
        )}
      </TableCell>

      <TableCell sx={{ minWidth: 140 }}>
        {proj ? (
          <Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(proj.percentageRemaining, 100)}
              color={PROGRESS_COLOR_MAP[proj.status]}
              sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
            />
            <Typography variant="caption" color="text.secondary">
              {proj.percentageRemaining.toFixed(0)}% remaining
            </Typography>
          </Box>
        ) : (
          <Typography variant="caption" color="text.disabled">
            —
          </Typography>
        )}
      </TableCell>

      <TableCell>
        {proj?.runsOutDate ? (
          <Typography variant="body2">
            {formatDate(proj.runsOutDate)}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.disabled">
            —
          </Typography>
        )}
      </TableCell>

      <TableCell>
        {rateCount > 0 ? (
          <Chip
            label={`${rateCount} pet${rateCount === 1 ? "" : "s"}`}
            size="small"
          />
        ) : (
          <Typography variant="caption" color="text.disabled">
            None
          </Typography>
        )}
      </TableCell>

      <TableCell align="right">
        <Box display="flex" gap={0.5} justifyContent="flex-end">
          <Tooltip title="Edit consumption rates">
            <IconButton
              size="small"
              onClick={onEditRates}
              sx={{ minWidth: 36, minHeight: 36 }}
            >
              <SpeedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit product">
            <IconButton
              size="small"
              onClick={onEdit}
              sx={{ minWidth: 36, minHeight: 36 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete product">
            <IconButton
              size="small"
              color="error"
              onClick={onDelete}
              sx={{ minWidth: 36, minHeight: 36 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton has no stable id
        <TableRow key={i}>
          {Array.from({ length: 7 }).map((__, j) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton has no stable id
            <TableCell key={j}>
              <Skeleton variant="text" width="80%" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function InventoryTable({
  products,
  projections,
  isLoading,
  onEdit,
  onDelete,
  onEditRates,
  onAddProduct,
}: InventoryTableProps) {
  const projectionByProductId = new Map(
    projections.map((p) => [p.item.attributes.foodProductId, p]),
  );

  if (!isLoading && products.length === 0) {
    return (
      <EmptyState
        title="No products yet"
        description="Add your first food product to start tracking stock."
        action={{ label: "Add Product", onClick: onAddProduct }}
      />
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Remaining</TableCell>
            <TableCell>Runs Out</TableCell>
            <TableCell>Assigned Pets</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <SkeletonRows />
          ) : (
            products.map((product) => (
              <InventoryRow
                key={product.id}
                product={product}
                projection={projectionByProductId.get(product.id)}
                onEdit={() => onEdit(product)}
                onDelete={() => onDelete(product)}
                onEditRates={() => onEditRates(product)}
              />
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
