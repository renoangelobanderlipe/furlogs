<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Vaccination;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Vaccination */
class VaccinationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Vaccination $vaccination */
        $vaccination = $this->resource;

        $daysUntilDue = $vaccination->next_due_date !== null
            ? (int) now()->diffInDays($vaccination->next_due_date, false)
            : null;

        $status = $daysUntilDue !== null ? match (true) {
            $daysUntilDue < 0 => 'overdue',
            $daysUntilDue <= 30 => 'due_soon',
            default => 'up_to_date',
        } : null;

        return [
            'id' => $vaccination->id,
            'type' => 'vaccinations',
            'attributes' => [
                'petId' => $vaccination->pet_id,
                'vaccineName' => $vaccination->vaccine_name,
                'administeredDate' => $vaccination->administered_date->toDateString(),
                'nextDueDate' => $vaccination->next_due_date?->toDateString(),
                'vetName' => $vaccination->vet_name,
                'batchNumber' => $vaccination->batch_number,
                'notes' => $vaccination->notes,
                'daysUntilDue' => $daysUntilDue,
                'status' => $status,
                'createdAt' => $vaccination->created_at->toISOString(),
                'updatedAt' => $vaccination->updated_at->toISOString(),
            ],
            'relationships' => [
                'pet' => $this->whenLoaded('pet', fn () => new PetResource($vaccination->pet)),
                'clinic' => $this->whenLoaded('clinic', fn () => new VetClinicResource($vaccination->clinic)),
            ],
        ];
    }
}
