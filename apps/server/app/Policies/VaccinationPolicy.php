<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Models\Vaccination;

class VaccinationPolicy
{
    /**
     * Any authenticated household member can view the vaccination list.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * The user can view a vaccination only if it belongs to a pet in their current household.
     */
    public function view(User $user, Vaccination $vaccination): bool
    {
        return $vaccination->pet !== null
            && $user->current_household_id === $vaccination->pet->household_id;
    }

    /**
     * Any authenticated user can create a vaccination record.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * The user can update a vaccination only if it belongs to their current household.
     */
    public function update(User $user, Vaccination $vaccination): bool
    {
        return $vaccination->pet !== null
            && $user->current_household_id === $vaccination->pet->household_id;
    }

    /**
     * Only the household owner may delete a vaccination.
     */
    public function delete(User $user, Vaccination $vaccination): bool
    {
        return $vaccination->pet !== null
            && $user->current_household_id === $vaccination->pet->household_id
            && $user->hasRole('owner');
    }

    public function restore(User $user, Vaccination $vaccination): bool
    {
        return $vaccination->pet !== null
            && $user->current_household_id === $vaccination->pet->household_id
            && $user->hasRole('owner');
    }

    public function forceDelete(User $user, Vaccination $vaccination): bool
    {
        return false;
    }
}
