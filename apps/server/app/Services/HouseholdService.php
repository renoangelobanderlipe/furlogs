<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\HouseholdRole;
use App\Models\Household;
use App\Models\User;

class HouseholdService
{
    public function create(User $owner, string $name): Household
    {
        $household = Household::query()->create(['name' => $name]);

        $household->householdMembers()->create([
            'user_id' => $owner->id,
            'role' => HouseholdRole::Owner,
            'joined_at' => now(),
        ]);

        $owner->update(['current_household_id' => $household->id]);

        // Assign Spatie 'owner' role scoped to this household (team_id = household_id).
        setPermissionsTeamId($household->id);
        $owner->assignRole('owner');

        return $household;
    }
}
