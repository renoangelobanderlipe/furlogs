<?php

declare(strict_types=1);

namespace App\Actions\FoodStock;

use App\Models\FoodConsumptionLog;
use App\Models\FoodProduct;
use App\Models\FoodStockItem;

class LogBagCompletion
{
    /**
     * Record an actual consumption log when a food stock item is marked finished.
     */
    public function __invoke(FoodStockItem $item): FoodConsumptionLog
    {
        // Use withTrashed() so soft-deleted products are still found when called from the observer.
        $product = FoodProduct::withoutGlobalScopes()
            ->withTrashed()
            ->with('consumptionRates')
            ->find($item->food_product_id);

        if ($product === null) {
            throw new \RuntimeException("LogBagCompletion: product {$item->food_product_id} not found.");
        }

        $actualDuration = ($item->opened_at !== null && $item->finished_at !== null)
            ? (int) $item->opened_at->diffInDays($item->finished_at)
            : 1;

        $unitWeightGrams = $product->unit_weight_grams ?? 0;

        $actualDailyRate = $actualDuration > 0
            ? (int) round($unitWeightGrams / $actualDuration)
            : $unitWeightGrams;

        $estimatedRate = (int) $product->consumptionRates->sum('daily_amount_grams');

        $diff = $estimatedRate > 0
            ? round((($actualDailyRate - $estimatedRate) / $estimatedRate) * 100, 2)
            : 0;

        return FoodConsumptionLog::updateOrCreate(
            ['food_stock_item_id' => $item->id],
            [
                'actual_duration_days' => $actualDuration,
                'actual_daily_rate_grams' => $actualDailyRate,
                'estimated_vs_actual_diff' => $diff,
            ],
        );
    }
}
