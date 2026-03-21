<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\FoodProduct;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin FoodProduct */
class FoodProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var FoodProduct $product */
        $product = $this->resource;

        return [
            'id' => $product->id,
            'type' => 'food-products',
            'attributes' => [
                'name' => $product->name,
                'brand' => $product->brand,
                'type' => $product->type->value,
                'unitWeightGrams' => $product->unit_weight_grams,
                'unitType' => $product->unit_type->value,
                'alertThresholdPct' => $product->alert_threshold_pct,
                'notes' => $product->notes,
                'consumptionRates' => $this->whenLoaded(
                    'consumptionRates',
                    fn () => $product->consumptionRates->map(fn ($rate) => [
                        'petId' => $rate->pet_id,
                        'dailyAmountGrams' => $rate->daily_amount_grams,
                    ])->values()->all(),
                    [],
                ),
                'createdAt' => $product->created_at->toISOString(),
                'updatedAt' => $product->updated_at->toISOString(),
            ],
            'relationships' => [],
        ];
    }
}
