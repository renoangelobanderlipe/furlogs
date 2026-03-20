<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\FoodConsumptionRate;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin FoodConsumptionRate */
class FoodConsumptionRateResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var FoodConsumptionRate $rate */
        $rate = $this->resource;

        return [
            'id' => $rate->id,
            'type' => 'food-consumption-rates',
            'attributes' => [
                'petId' => $rate->pet_id,
                'dailyAmountGrams' => $rate->daily_amount_grams,
                'createdAt' => $rate->created_at->toISOString(),
            ],
        ];
    }
}
