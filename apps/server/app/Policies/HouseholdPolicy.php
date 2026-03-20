<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\User;

class HouseholdPolicy
{
    /**
     * Only the household owner may rename the household.
     */
    public function update(User $user, Household $household): bool
    {
        return $this->isOwnerOf($user, $household);
    }

    /**
     * Only the household owner may invite new members.
     */
    public function invite(User $user, Household $household): bool
    {
        return $this->isOwnerOf($user, $household);
    }

    /**
     * An owner may remove any non-owner member.
     * A member may remove themselves (leave the household).
     */
    public function removeMember(User $user, Household $household, User $target): bool
    {
        $isSelf = $user->id === $target->id;

        if ($isSelf) {
            return $this->isMemberOf($user, $household);
        }

        return $this->isOwnerOf($user, $household);
    }

    private function isOwnerOf(User $user, Household $household): bool
    {
        return $user->current_household_id === $household->id
            && $user->hasRole('owner');
    }

    private function isMemberOf(User $user, Household $household): bool
    {
        return $user->current_household_id === $household->id
            && HouseholdMember::query()
                ->where('household_id', $household->id)
                ->where('user_id', $user->id)
                ->exists();
    }
}
