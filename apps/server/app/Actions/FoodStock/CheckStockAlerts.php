<?php

declare(strict_types=1);

namespace App\Actions\FoodStock;

use App\Enums\StockStatus;
use App\Exceptions\StockProjectionException;
use App\Models\FoodStockItem;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class CheckStockAlerts
{
    /**
     * Check all open stock items and log warnings for low or critical stock levels.
     * Stub for Phase 4 notifications.
     */
    public function __construct(private readonly CalculateProjection $calculateProjection) {}

    public function __invoke(): void
    {
        FoodStockItem::query()
            ->where('status', StockStatus::Open)
            ->with(['foodProduct.consumptionRates'])
            ->chunkById(100, function (Collection $items): void {
                foreach ($items as $item) {
                    try {
                        $projection = ($this->calculateProjection)($item);
                    } catch (StockProjectionException) {
                        continue;
                    }

                    if (in_array($projection->status, ['low', 'critical'], true)) {
                        Log::warning('Stock alert: food stock item is '.$projection->status, [
                            'food_stock_item_id' => $item->id,
                            'food_product_id' => $item->food_product_id,
                            'status' => $projection->status,
                            'remaining_grams' => $projection->remainingGrams,
                            'days_remaining' => $projection->daysRemaining,
                        ]);
                    }
                }
            });
    }
}
