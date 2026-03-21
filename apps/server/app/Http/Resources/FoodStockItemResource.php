<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\FoodStockItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin FoodStockItem */
class FoodStockItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var FoodStockItem $item */
        $item = $this->resource;

        return [
            'id' => $item->id,
            'type' => 'food-stock-items',
            'attributes' => [
                'foodProductId' => $item->food_product_id,
                'status' => $item->status->value,
                'purchasedAt' => $item->purchased_at->toDateString(),
                'openedAt' => $item->opened_at?->toDateString(),
                'finishedAt' => $item->finished_at?->toDateString(),
                'purchaseCost' => $item->purchase_cost,
                'purchaseSource' => $item->purchase_source,
                'quantity' => $item->quantity,
                'notes' => $item->notes,
                'daysSinceOpened' => $item->days_since_opened,
                'createdAt' => $item->created_at->toISOString(),
                'updatedAt' => $item->updated_at->toISOString(),
            ],
            'relationships' => [
                'foodProduct' => $this->whenLoaded(
                    'foodProduct',
                    fn () => new FoodProductResource($item->foodProduct),
                ),
                'consumptionLog' => $this->whenLoaded(
                    'consumptionLog',
                    fn () => $item->consumptionLog ? [
                        'actualDurationDays' => $item->consumptionLog->actual_duration_days,
                        'actualDailyRateGrams' => $item->consumptionLog->actual_daily_rate_grams,
                        'estimatedVsActualDiff' => $item->consumptionLog->estimated_vs_actual_diff,
                        'createdAt' => $item->consumptionLog->created_at->toISOString(),
                    ] : null,
                ),
            ],
        ];
    }
}
