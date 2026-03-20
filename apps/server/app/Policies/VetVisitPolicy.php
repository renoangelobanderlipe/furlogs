<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Models\VetVisit;

class VetVisitPolicy
{
    /**
     * Any authenticated household member can view the vet visit list (scoped by global scope).
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * The user can view a vet visit only if it belongs to a pet in their current household.
     */
    public function view(User $user, VetVisit $visit): bool
    {
        return $visit->pet !== null
            && $user->current_household_id === $visit->pet->household_id;
    }

    /**
     * Any authenticated user can create a vet visit.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * The user can update a vet visit only if it belongs to their current household.
     */
    public function update(User $user, VetVisit $visit): bool
    {
        return $visit->pet !== null
            && $user->current_household_id === $visit->pet->household_id;
    }

    /**
     * Only the household owner may delete a vet visit.
     */
    public function delete(User $user, VetVisit $visit): bool
    {
        return $visit->pet !== null
            && $user->current_household_id === $visit->pet->household_id
            && $user->hasRole('owner');
    }

    public function restore(User $user, VetVisit $visit): bool
    {
        return $visit->pet !== null
            && $user->current_household_id === $visit->pet->household_id
            && $user->hasRole('owner');
    }

    public function forceDelete(User $user, VetVisit $visit): bool
    {
        return false;
    }

    /**
     * Only household owners may perform bulk deletes.
     */
    public function bulkDelete(User $user): bool
    {
        return $user->hasRole('owner');
    }
}
