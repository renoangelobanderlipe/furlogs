<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Models\VetClinic;

class VetClinicPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, VetClinic $vetClinic): bool
    {
        return $user->current_household_id === $vetClinic->household_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, VetClinic $vetClinic): bool
    {
        return $user->current_household_id === $vetClinic->household_id;
    }

    public function delete(User $user, VetClinic $vetClinic): bool
    {
        return $user->current_household_id === $vetClinic->household_id
            && $user->hasRole('owner');
    }

    public function restore(User $user, VetClinic $vetClinic): bool
    {
        return false;
    }

    public function forceDelete(User $user, VetClinic $vetClinic): bool
    {
        return false;
    }
}
