<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Vaccination;

class VaccinationService
{
    /**
     * Create a new Vaccination record.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Vaccination
    {
        return Vaccination::query()->create($data);
    }

    /**
     * Update an existing Vaccination record.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Vaccination $vaccination, array $data): Vaccination
    {
        $vaccination->update($data);

        return $vaccination->fresh();
    }

    /**
     * Soft-delete a Vaccination record.
     */
    public function delete(Vaccination $vaccination): void
    {
        $vaccination->delete();
    }
}
