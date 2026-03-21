<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\VetVisit;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin VetVisit */
class VetVisitResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var VetVisit $visit */
        $visit = $this->resource;

        return [
            'id' => $visit->id,
            'type' => 'vet-visits',
            'attributes' => [
                'petId' => $visit->pet_id,
                'clinicId' => $visit->clinic_id,
                'vetName' => $visit->vet_name,
                'visitDate' => $visit->visit_date->toDateString(),
                'visitType' => $visit->visit_type->value,
                'reason' => $visit->reason,
                'diagnosis' => $visit->diagnosis,
                'treatment' => $visit->treatment,
                'cost' => $visit->cost,
                'weightAtVisit' => $visit->weight_at_visit,
                'followUpDate' => $visit->follow_up_date?->toDateString(),
                'notes' => $visit->notes,
                'attachmentCount' => $visit->relationLoaded('media')
                    ? $visit->getMedia('attachments')->count()
                    : 0,
                'createdAt' => $visit->created_at->toISOString(),
                'updatedAt' => $visit->updated_at->toISOString(),
            ],
            'relationships' => [
                'pet' => $this->whenLoaded('pet', fn () => new PetResource($visit->pet)),
                'clinic' => $this->whenLoaded('clinic', fn () => new VetClinicResource($visit->clinic)),
                'medications' => $this->whenLoaded('medications', fn () => MedicationResource::collection($visit->medications)),
                'attachments' => $this->when(
                    $visit->relationLoaded('media') || $request->query('include') === 'attachments',
                    fn () => $visit->getMedia('attachments')->map(fn ($media) => [
                        'id' => $media->id,
                        'name' => $media->file_name,
                        'mimeType' => $media->mime_type,
                        'size' => $media->size,
                        // getTemporaryUrl requires a private cloud disk in production;
                        // falls back to getUrl() on local disk (acceptable for local dev).
                        'url' => $media->getTemporaryUrl(now()->addMinutes(60)),
                    ]),
                ),
            ],
        ];
    }
}
