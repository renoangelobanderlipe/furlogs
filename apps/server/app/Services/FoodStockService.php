<?php

declare(strict_types=1);

namespace App\Services;

use App\Actions\FoodStock\CalculateProjection;
use App\DTOs\FoodProjectionDTO;
use App\Enums\StockStatus;
use App\Exceptions\StockProjectionException;
use App\Models\FoodConsumptionRate;
use App\Models\FoodProduct;
use App\Models\FoodStockItem;
use App\Models\Pet;
use Illuminate\Support\Collection;

class FoodStockService
{
    public function __construct(
        private readonly CalculateProjection $calculateProjection,
    ) {}

    /**
     * Create a new food product for the current household.
     *
     * @param  array<string, mixed>  $data
     */
    public function createProduct(array $data): FoodProduct
    {
        return FoodProduct::query()->create($data);
    }

    /**
     * Update an existing food product's attributes.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateProduct(FoodProduct $product, array $data): FoodProduct
    {
        $product->update($data);

        return $product->fresh();
    }

    /**
     * Soft-delete a food product.
     */
    public function deleteProduct(FoodProduct $product): void
    {
        $product->delete();
    }

    /**
     * Log a new purchase as a sealed stock item.
     *
     * @param  array<string, mixed>  $data
     */
    public function logPurchase(FoodProduct $product, array $data): FoodStockItem
    {
        return $product->stockItems()->create([
            ...$data,
            'status' => StockStatus::Sealed,
        ]);
    }

    /**
     * Mark a stock item as open, setting opened_at to today if not already set.
     */
    public function openItem(FoodStockItem $item): FoodStockItem
    {
        $item->update([
            'status' => StockStatus::Open,
            'opened_at' => $item->opened_at ?? now()->toDateString(),
        ]);

        return $item->fresh();
    }

    /**
     * Mark a stock item as finished, setting finished_at to today.
     */
    public function markFinished(FoodStockItem $item): FoodStockItem
    {
        $item->update([
            'status' => StockStatus::Finished,
            'finished_at' => now()->toDateString(),
        ]);

        return $item->fresh();
    }

    /**
     * Create or update a daily consumption rate for a pet and product.
     */
    public function updateConsumptionRate(FoodProduct $product, Pet $pet, int $dailyAmountGrams): FoodConsumptionRate
    {
        return FoodConsumptionRate::query()->updateOrCreate(
            ['food_product_id' => $product->id, 'pet_id' => $pet->id],
            ['daily_amount_grams' => $dailyAmountGrams],
        );
    }

    /**
     * Get projections for all open stock items in a household.
     * Returns a collection of arrays with 'item' and 'projection' keys.
     *
     * @return list<array{item: FoodStockItem, projection: FoodProjectionDTO|null}>
     */
    public function getProjections(string $householdId): array
    {
        $items = FoodStockItem::query()
            ->whereHas('foodProduct', fn ($q) => $q->withoutGlobalScopes()->where('household_id', $householdId))
            ->where('status', StockStatus::Open)
            ->get();

        return $items->map(function (FoodStockItem $item): array {
            try {
                $projection = ($this->calculateProjection)($item);
            } catch (StockProjectionException) {
                $projection = null;
            }

            return ['item' => $item, 'projection' => $projection];
        })->values()->all();
    }

    /**
     * Get the suggested daily rate adjustment based on historical consumption logs.
     * Returns the average actual daily rate if 3 or more completed logs exist, otherwise null.
     */
    public function getSuggestedRateAdjustment(FoodProduct $product): ?float
    {
        $logs = $product->stockItems()
            ->whereHas('consumptionLog')
            ->with('consumptionLog')
            ->get()
            ->pluck('consumptionLog')
            ->filter()
            ->values();

        if ($logs->count() < 3) {
            return null;
        }

        return $logs->avg('actual_daily_rate_grams');
    }
}
