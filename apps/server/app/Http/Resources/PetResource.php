<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Pet;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Pet */
class PetResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Pet $pet */
        $pet = $this->resource;

        return [
            'id' => $pet->id,
            'type' => 'pets',
            'attributes' => [
                'name' => $pet->name,
                'species' => $pet->species->value,
                'breed' => $pet->breed,
                'sex' => $pet->sex->value,
                'birthday' => $pet->birthday?->toDateString(),
                'age' => $pet->age,
                'isNeutered' => $pet->is_neutered,
                'size' => $pet->size?->value,
                'notes' => $pet->notes,
                'latestWeightKg' => $pet->relationLoaded('latestWeight') ? $pet->latestWeight?->weight_kg : null,
                'avatarUrl' => $pet->getFirstMediaUrl('avatar', 'card') ?: null,
                'thumbUrl' => $pet->getFirstMediaUrl('avatar', 'thumb') ?: null,
                'createdAt' => $pet->created_at->toISOString(),
                'updatedAt' => $pet->updated_at->toISOString(),
            ],
        ];
    }
}
