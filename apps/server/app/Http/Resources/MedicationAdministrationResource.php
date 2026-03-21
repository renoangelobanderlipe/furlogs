<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\MedicationAdministration;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin MedicationAdministration */
class MedicationAdministrationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var MedicationAdministration $administration */
        $administration = $this->resource;

        return [
            'id' => $administration->id,
            'type' => 'medication_administrations',
            'attributes' => [
                'administeredAt' => $administration->administered_at->toISOString(),
                'notes' => $administration->notes,
                'createdAt' => $administration->created_at->toISOString(),
            ],
            'relationships' => [
                'administeredBy' => $this->whenLoaded('administeredBy', fn () => [
                    'id' => $administration->administeredBy->id,
                    'name' => $administration->administeredBy->name,
                ]),
            ],
        ];
    }
}
