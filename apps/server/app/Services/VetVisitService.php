<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\VetVisit;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class VetVisitService
{
    /**
     * Create a new VetVisit, optionally attaching uploaded files.
     * If any attachment upload fails, previously uploaded files are cleaned up.
     *
     * @param  array<string, mixed>  $data
     * @param  UploadedFile[]  $attachments
     */
    public function create(array $data, array $attachments = []): VetVisit
    {
        $visit = VetVisit::query()->create($data);

        if (empty($attachments)) {
            return $visit;
        }

        $uploaded = [];

        try {
            foreach ($attachments as $file) {
                $media = $visit->addMedia($file)->toMediaCollection('attachments');
                $uploaded[] = $media;
            }
        } catch (\Throwable $e) {
            Log::error('Failed to upload vet visit attachment', [
                'vet_visit_id' => $visit->id,
                'error' => $e->getMessage(),
            ]);

            foreach ($uploaded as $media) {
                try {
                    $media->delete();
                } catch (\Throwable $cleanupError) {
                    Log::error('Failed to clean up uploaded media', [
                        'media_id' => $media->id,
                        'error' => $cleanupError->getMessage(),
                    ]);
                }
            }

            throw $e;
        }

        return $visit;
    }

    /**
     * Update an existing VetVisit's attributes.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(VetVisit $visit, array $data): VetVisit
    {
        $visit->update($data);

        return $visit->fresh();
    }

    /**
     * Soft-delete a VetVisit.
     */
    public function delete(VetVisit $visit): void
    {
        $visit->delete();
    }

    /**
     * Add a single attachment to a VetVisit.
     * Enforces a maximum of 5 attachments per visit.
     *
     * @throws \RuntimeException
     */
    public function addAttachment(VetVisit $visit, UploadedFile $file): void
    {
        if ($visit->getMedia('attachments')->count() >= 5) {
            throw new \RuntimeException('A vet visit may have at most 5 attachments.');
        }

        try {
            $visit->addMedia($file)->toMediaCollection('attachments');
        } catch (\Throwable $e) {
            Log::error('Failed to add attachment to vet visit', [
                'vet_visit_id' => $visit->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Remove a specific Media attachment from a VetVisit.
     */
    public function removeAttachment(VetVisit $visit, Media $media): void
    {
        $media->delete();
    }

    /**
     * Soft-delete multiple VetVisits by ID, scoped to the current household via pet.
     *
     * @param  int[]  $ids
     */
    public function bulkDelete(array $ids): void
    {
        // BelongsToHouseholdViaPet global scope automatically excludes cross-household IDs.
        VetVisit::query()->whereIn('id', $ids)->delete();
    }

    /**
     * Aggregate vet visit stats for a household, optionally filtered to one pet.
     * Uses a single grouped query for top clinic to avoid N+1 loading.
     *
     * @return array<string, mixed>
     */
    public function getStats(?string $petId = null): array
    {
        $yearStart = now()->startOfYear()->toDateString();

        $ytdVisits = (int) VetVisit::query()
            ->when($petId, fn ($q) => $q->where('pet_id', $petId))
            ->where('visit_date', '>=', $yearStart)
            ->count();

        $ytdSpend = (float) VetVisit::query()
            ->when($petId, fn ($q) => $q->where('pet_id', $petId))
            ->where('visit_date', '>=', $yearStart)
            ->whereNotNull('cost')
            ->sum('cost');

        $lastVisit = VetVisit::query()
            ->when($petId, fn ($q) => $q->where('pet_id', $petId))
            ->orderBy('visit_date', 'desc')
            ->value('visit_date');

        // Single query — avoids loading all visits to find the most-visited clinic.
        $topClinic = VetVisit::query()
            ->when($petId, fn ($q) => $q->where('pet_id', $petId))
            ->join('vet_clinics', 'vet_visits.clinic_id', '=', 'vet_clinics.id')
            ->whereNotNull('vet_visits.clinic_id')
            ->select('vet_clinics.name', DB::raw('count(*) as visit_count'))
            ->groupBy('vet_clinics.id', 'vet_clinics.name')
            ->orderByDesc('visit_count')
            ->value('vet_clinics.name');

        return [
            'ytdVisits' => $ytdVisits,
            'ytdSpend' => $ytdSpend,
            'lastVisitDate' => $lastVisit,
            'topClinic' => $topClinic,
        ];
    }
}
