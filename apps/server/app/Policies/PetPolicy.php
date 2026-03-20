<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Pet;
use App\Models\User;

class PetPolicy
{
    /**
     * Any authenticated member of any household can view the pet list (scoped by household scope).
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * The user can view a pet only if it belongs to their current household.
     */
    public function view(User $user, Pet $pet): bool
    {
        return $user->current_household_id === $pet->household_id;
    }

    /**
     * Any authenticated user can create a pet within their current household.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * The user can update a pet only if it belongs to their current household.
     */
    public function update(User $user, Pet $pet): bool
    {
        return $user->current_household_id === $pet->household_id;
    }

    /**
     * Only the household owner may delete a pet.
     */
    public function delete(User $user, Pet $pet): bool
    {
        return $user->current_household_id === $pet->household_id
            && $user->hasRole('owner');
    }

    public function restore(User $user, Pet $pet): bool
    {
        return $user->current_household_id === $pet->household_id
            && $user->hasRole('owner');
    }

    public function forceDelete(User $user, Pet $pet): bool
    {
        return false;
    }
}
