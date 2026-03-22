<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Pet;
use App\Models\PetWeight;
use App\Models\User;

class PetWeightPolicy
{
    /**
     * Any household member can view the weight list for a pet in their household.
     */
    public function viewAny(User $user, Pet $pet): bool
    {
        return $user->current_household_id === $pet->household_id;
    }

    /**
     * The user can view a weight record only if the pet belongs to their current household.
     */
    public function view(User $user, PetWeight $weight): bool
    {
        return $weight->pet?->household_id === $user->current_household_id;
    }

    /**
     * Any household member can record a weight for a pet in their household.
     */
    public function create(User $user, Pet $pet): bool
    {
        return $user->current_household_id === $pet->household_id;
    }

    /**
     * The user can update a weight record only if the pet belongs to their current household.
     */
    public function update(User $user, PetWeight $weight): bool
    {
        return $weight->pet?->household_id === $user->current_household_id;
    }

    /**
     * The user can delete a weight record only if the pet belongs to their current household.
     */
    public function delete(User $user, PetWeight $weight): bool
    {
        return $weight->pet?->household_id === $user->current_household_id;
    }
}
