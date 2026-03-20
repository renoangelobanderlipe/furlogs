<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\PetWeight;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin PetWeight */
class PetWeightResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var PetWeight $weight */
        $weight = $this->resource;

        return [
            'id' => $weight->id,
            'type' => 'pet-weights',
            'attributes' => [
                'weightKg' => (float) $weight->weight_kg,
                'recordedAt' => $weight->recorded_at->toDateString(),
                'createdAt' => $weight->created_at->toISOString(),
            ],
        ];
    }
}
