<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\VetClinic;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin VetClinic */
class VetClinicResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => 'vet-clinics',
            'attributes' => [
                'name' => $this->name,
                'address' => $this->address,
                'phone' => $this->phone,
                'notes' => $this->notes,
                'createdAt' => $this->created_at?->toISOString(),
                'updatedAt' => $this->updated_at?->toISOString(),
            ],
        ];
    }
}
