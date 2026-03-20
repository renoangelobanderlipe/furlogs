<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\HouseholdRole;
use App\Models\Household;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class HouseholdService
{
    /**
     * Create a new household and assign the given user as owner.
     */
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
        Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
        $owner->assignRole('owner');

        return $household;
    }

    /**
     * Return the current household for the given user, with all members loaded.
     */
    public function getCurrent(User $user): Household
    {
        /** @var Household $household */
        $household = Household::query()
            ->with(['householdMembers.user'])
            ->findOrFail($user->current_household_id);

        return $household;
    }

    /**
     * Rename a household. Only the owner may do this.
     */
    public function rename(Household $household, string $name): Household
    {
        $household->update(['name' => $name]);

        return $this->getCurrent($household->members()->wherePivot('role', HouseholdRole::Owner)->firstOrFail());
    }

    /**
     * Add a user to the household by email. Raises a ValidationException if the
     * email has no account or the user is already a member.
     *
     * @throws ValidationException
     */
    public function inviteByEmail(Household $household, string $email): Household
    {
        $invitee = User::query()->where('email', $email)->first();

        if ($invitee === null) {
            throw ValidationException::withMessages([
                'email' => ['No FurLog account found with that email.'],
            ]);
        }

        $alreadyMember = $household->householdMembers()
            ->where('user_id', $invitee->id)
            ->exists();

        if ($alreadyMember) {
            throw ValidationException::withMessages([
                'email' => ['This user is already a member of your household.'],
            ]);
        }

        $household->householdMembers()->create([
            'user_id' => $invitee->id,
            'role' => HouseholdRole::Member,
            'invited_at' => now(),
            'joined_at' => now(),
        ]);

        $invitee->update(['current_household_id' => $household->id]);

        setPermissionsTeamId($household->id);
        Role::firstOrCreate(['name' => 'member', 'guard_name' => 'web']);
        $invitee->assignRole('member');

        return $this->loadHousehold($household);
    }

    /**
     * Remove a member from the household. Cannot remove the owner.
     * If the user is removing themselves, their current_household_id is nulled.
     *
     * @throws ValidationException
     */
    public function removeMember(Household $household, User $actor, User $target): Household
    {
        $targetMembership = $household->householdMembers()
            ->where('user_id', $target->id)
            ->first();

        if ($targetMembership === null) {
            throw ValidationException::withMessages([
                'user' => ['This user is not a member of this household.'],
            ]);
        }

        if ($targetMembership->role === HouseholdRole::Owner) {
            throw ValidationException::withMessages([
                'user' => ['The household owner cannot be removed.'],
            ]);
        }

        $targetMembership->delete();

        if ($actor->id === $target->id) {
            $target->update(['current_household_id' => null]);
        }

        return $this->loadHousehold($household);
    }

    /**
     * Reload a household with members relationship.
     */
    private function loadHousehold(Household $household): Household
    {
        return $household->load(['householdMembers.user']);
    }
}
