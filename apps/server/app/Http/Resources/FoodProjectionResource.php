<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\DTOs\FoodProjectionDTO;
use App\Models\FoodStockItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FoodProjectionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var array{item: FoodStockItem, projection: FoodProjectionDTO|null} $data */
        $data = $this->resource;

        $item = $data['item'];
        $projection = $data['projection'];

        return [
            'item' => new FoodStockItemResource($item),
            'projection' => $projection === null ? null : [
                'remainingGrams' => $projection->remainingGrams,
                'daysRemaining' => $projection->daysRemaining,
                'runsOutDate' => $projection->runsOutDate->toISOString(),
                'status' => $projection->status,
                'totalDailyRate' => $projection->totalDailyRate,
                'percentageRemaining' => $projection->percentageRemaining,
            ],
        ];
    }
}
