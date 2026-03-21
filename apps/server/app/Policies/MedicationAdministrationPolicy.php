<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\MedicationAdministration;
use App\Models\User;

class MedicationAdministrationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->current_household_id !== null;
    }

    public function view(User $user, MedicationAdministration $administration): bool
    {
        return $administration->medication?->pet?->household_id === $user->current_household_id;
    }

    public function create(User $user): bool
    {
        return $user->current_household_id !== null;
    }

    public function update(User $user, MedicationAdministration $administration): bool
    {
        return $administration->medication?->pet?->household_id === $user->current_household_id;
    }

    public function delete(User $user, MedicationAdministration $administration): bool
    {
        return $administration->medication?->pet?->household_id === $user->current_household_id;
    }
}
