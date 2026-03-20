<?php

declare(strict_types=1);

namespace App\Observers;

use App\Actions\FoodStock\LogBagCompletion;
use App\Enums\StockStatus;
use App\Models\FoodStockItem;
use Illuminate\Support\Facades\Log;

class FoodStockItemObserver
{
    public function updated(FoodStockItem $item): void
    {
        if ($item->wasChanged('status') && $item->status === StockStatus::Finished) {
            try {
                app(LogBagCompletion::class)($item);
            } catch (\Throwable $e) {
                Log::error('Failed to log bag completion', [
                    'food_stock_item_id' => $item->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
