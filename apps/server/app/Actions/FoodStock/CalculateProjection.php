<?php

declare(strict_types=1);

namespace App\Actions\FoodStock;

use App\DTOs\FoodProjectionDTO;
use App\Exceptions\StockProjectionException;
use App\Models\FoodProduct;
use App\Models\FoodStockItem;

class CalculateProjection
{
    /**
     * Calculate stock projection for an open food stock item.
     *
     * @throws StockProjectionException
     */
    public function __invoke(FoodStockItem $item): FoodProjectionDTO
    {
        // Use already-loaded relationship when available (e.g. from FoodStockService::getProjections),
        // otherwise query directly to support non-HTTP contexts (observers, scheduled jobs).
        $product = $item->relationLoaded('foodProduct')
            ? $item->foodProduct
            : FoodProduct::withoutGlobalScopes()->with('consumptionRates')->find($item->food_product_id);

        if ($product === null) {
            throw new StockProjectionException('Food product not found for this stock item.');
        }

        $totalDailyRate = (int) $product->consumptionRates->sum('daily_amount_grams');

        if ($totalDailyRate === 0) {
            throw new StockProjectionException('No consumption rates configured for this product.');
        }

        $unitWeightGrams = $product->unit_weight_grams;

        if ($unitWeightGrams === null || $unitWeightGrams <= 0) {
            throw new StockProjectionException('Product has no valid unit weight configured.');
        }

        $daysSinceOpened = $item->days_since_opened ?? 0;
        $remainingGrams = max(0, $unitWeightGrams - ($daysSinceOpened * $totalDailyRate));
        $daysRemaining = $remainingGrams / $totalDailyRate;
        $runsOutDate = now()->addDays((int) ceil($daysRemaining));
        $percentageRemaining = ($remainingGrams / $unitWeightGrams) * 100;
        $threshold = $product->alert_threshold_pct;

        $status = match (true) {
            $remainingGrams === 0 => 'critical',
            $percentageRemaining <= 10 => 'critical',
            $percentageRemaining <= $threshold => 'low',
            default => 'good',
        };

        return FoodProjectionDTO::fromCalculation(
            remainingGrams: $remainingGrams,
            daysRemaining: $daysRemaining,
            runsOutDate: $runsOutDate,
            status: $status,
            totalDailyRate: $totalDailyRate,
            percentageRemaining: $percentageRemaining,
        );
    }
}
