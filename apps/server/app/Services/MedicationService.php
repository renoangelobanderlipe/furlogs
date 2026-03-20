<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Medication;

class MedicationService
{
    /**
     * Create a new Medication record.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Medication
    {
        return Medication::query()->create($data);
    }

    /**
     * Update an existing Medication record.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Medication $medication, array $data): Medication
    {
        $medication->update($data);

        return $medication->fresh();
    }

    /**
     * Soft-delete a Medication record.
     */
    public function delete(Medication $medication): void
    {
        $medication->delete();
    }
}
