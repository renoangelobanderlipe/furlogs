<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Medication;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Medication */
class MedicationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Medication $medication */
        $medication = $this->resource;

        $isActive = $medication->end_date === null || $medication->end_date->isAfter(now());

        return [
            'id' => $medication->id,
            'type' => 'medications',
            'attributes' => [
                'name' => $medication->name,
                'dosage' => $medication->dosage,
                'frequency' => $medication->frequency,
                'startDate' => $medication->start_date->toDateString(),
                'endDate' => $medication->end_date?->toDateString(),
                'notes' => $medication->notes,
                'isActive' => $isActive,
                'createdAt' => $medication->created_at->toISOString(),
                'updatedAt' => $medication->updated_at->toISOString(),
            ],
            'relationships' => [
                'pet' => $this->whenLoaded('pet', fn () => new PetResource($medication->pet)),
                'vetVisit' => $this->whenLoaded('vetVisit', fn () => new VetVisitResource($medication->vetVisit)),
            ],
        ];
    }
}
