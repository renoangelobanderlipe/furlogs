<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Pet;
use App\Models\PetWeight;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class PetService
{
    /**
     * Create a new pet for the current household.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Pet
    {
        return Pet::query()->create($data);
    }

    /**
     * Update an existing pet's attributes.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Pet $pet, array $data): Pet
    {
        $pet->update($data);

        return $pet->fresh();
    }

    /**
     * Soft-delete a pet.
     */
    public function delete(Pet $pet): void
    {
        $pet->delete();
    }

    /**
     * Record a weight entry for a pet on a given date.
     */
    public function recordWeight(Pet $pet, float $weight, string $date): PetWeight
    {
        return $pet->weights()->create([
            'weight_kg' => $weight,
            'recorded_at' => $date,
        ]);
    }

    /**
     * Upload and attach an avatar image to the pet's 'avatar' media collection.
     * Cleans up on failure.
     */
    public function uploadAvatar(Pet $pet, UploadedFile $file): void
    {
        try {
            $pet->addMedia($file)->toMediaCollection('avatar');
        } catch (\Throwable $e) {
            Log::error('Failed to upload pet avatar', ['pet_id' => $pet->id, 'error' => $e->getMessage()]);

            throw $e;
        }
    }
}
