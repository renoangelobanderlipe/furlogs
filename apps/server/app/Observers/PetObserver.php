<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Pet;
use Illuminate\Support\Facades\Log;

class PetObserver
{
    public function created(Pet $pet): void
    {
        Log::info('Pet created', ['pet_id' => $pet->id, 'household_id' => $pet->household_id]);
    }

    public function updated(Pet $pet): void
    {
        Log::info('Pet updated', ['pet_id' => $pet->id, 'household_id' => $pet->household_id, 'changes' => $pet->getDirty()]);
    }

    public function deleted(Pet $pet): void
    {
        Log::info('Pet deleted', ['pet_id' => $pet->id, 'household_id' => $pet->household_id]);
    }

    public function restored(Pet $pet): void
    {
        Log::info('Pet restored', ['pet_id' => $pet->id, 'household_id' => $pet->household_id]);
    }

    public function forceDeleted(Pet $pet): void
    {
        Log::info('Pet force deleted', ['pet_id' => $pet->id, 'household_id' => $pet->household_id]);
    }
}
