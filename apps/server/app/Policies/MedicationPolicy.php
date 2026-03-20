<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Medication;
use App\Models\User;

class MedicationPolicy
{
    /**
     * Any authenticated household member can view the medication list.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * The user can view a medication only if it belongs to a pet in their current household.
     */
    public function view(User $user, Medication $medication): bool
    {
        return $medication->pet !== null
            && $user->current_household_id === $medication->pet->household_id;
    }

    /**
     * Any authenticated user can create a medication record.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * The user can update a medication only if it belongs to their current household.
     */
    public function update(User $user, Medication $medication): bool
    {
        return $medication->pet !== null
            && $user->current_household_id === $medication->pet->household_id;
    }

    /**
     * Only the household owner may delete a medication.
     */
    public function delete(User $user, Medication $medication): bool
    {
        return $medication->pet !== null
            && $user->current_household_id === $medication->pet->household_id
            && $user->hasRole('owner');
    }

    public function restore(User $user, Medication $medication): bool
    {
        return $medication->pet !== null
            && $user->current_household_id === $medication->pet->household_id
            && $user->hasRole('owner');
    }

    public function forceDelete(User $user, Medication $medication): bool
    {
        return false;
    }
}
