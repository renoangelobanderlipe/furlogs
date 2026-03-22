<?php

declare(strict_types=1);

namespace App\Actions\FoodStock;

use App\Enums\StockStatus;
use App\Exceptions\StockProjectionException;
use App\Models\FoodStockItem;
use App\Notifications\CriticalStockNotification;
use App\Notifications\LowStockNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class CheckStockAlerts
{
    /**
     * Check all open stock items and dispatch low/critical stock notifications to household members.
     */
    public function __construct(private readonly CalculateProjection $calculateProjection) {}

    public function __invoke(): void
    {
        // Bypass the global scope — this job runs in a queue/scheduler context with no
        // authenticated user. It processes all households directly.
        FoodStockItem::withoutGlobalScopes()
            ->where('status', StockStatus::Open)
            ->with([
                'foodProduct' => fn ($q) => $q
                    ->withoutGlobalScopes()
                    ->with(['consumptionRates', 'household.members']),
            ])
            ->chunkById(100, function (Collection $items): void {
                foreach ($items as $item) {
                    try {
                        $projection = ($this->calculateProjection)($item);
                    } catch (StockProjectionException) {
                        continue;
                    }

                    if (! in_array($projection->status, ['low', 'critical'], true)) {
                        continue;
                    }

                    Log::warning('Stock alert: food stock item is '.$projection->status, [
                        'food_stock_item_id' => $item->id,
                        'food_product_id' => $item->food_product_id,
                        'status' => $projection->status,
                        'remaining_grams' => $projection->remainingGrams,
                        'days_remaining' => $projection->daysRemaining,
                    ]);

                    $product = $item->foodProduct;
                    $productName = $product !== null ? $product->name : 'Unknown product';
                    $daysRemaining = (int) $projection->daysRemaining;
                    $household = $product?->household;
                    $members = $household !== null ? $household->members : collect();

                    if ($projection->status === 'critical') {
                        $notification = new CriticalStockNotification(
                            stockItem: $item,
                            productName: $productName,
                            daysRemaining: $daysRemaining,
                            runsOutDate: $projection->runsOutDate->toDateString(),
                        );
                    } else {
                        $notification = new LowStockNotification(
                            stockItem: $item,
                            productName: $productName,
                            daysRemaining: $daysRemaining,
                        );
                    }

                    foreach ($members as $member) {
                        $member->notify($notification);
                    }
                }
            });
    }
}
