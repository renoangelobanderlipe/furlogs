<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\HouseholdRole;
use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\User;
use App\Notifications\HouseholdInviteNotification;
use Illuminate\Database\Eloquent\Collection;
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
        return Household::query()
            ->with(['householdMembers.user'])
            ->findOrFail($user->current_household_id);
    }

    /**
     * Rename a household. Only the owner may do this.
     */
    public function rename(Household $household, string $name): Household
    {
        $household->update(['name' => $name]);

        return $this->loadHousehold($household);
    }

    /**
     * Add a user to the household by email. Raises a ValidationException if the
     * email has no account or the user is already a member.
     *
     * @throws ValidationException
     */
    public function inviteByEmail(Household $household, string $email, User $actor): Household
    {
        $invitee = User::query()->where('email', $email)->first();

        if ($invitee === null) {
            throw ValidationException::withMessages([
                'email' => ['If this email is registered, an invitation will be sent to them.'],
            ]);
        }

        $alreadyMember = $household->householdMembers()
            ->where('user_id', $invitee->id)
            ->exists();

        if ($alreadyMember) {
            throw ValidationException::withMessages([
                'email' => ['If this email is registered, an invitation will be sent to them.'],
            ]);
        }

        $household->householdMembers()->create([
            'user_id' => $invitee->id,
            'role' => HouseholdRole::Member,
            'invited_at' => now(),
            'joined_at' => now(),
        ]);

        setPermissionsTeamId($household->id);
        Role::firstOrCreate(['name' => 'member', 'guard_name' => 'web']);
        $invitee->assignRole('member');

        $invitee->notify(new HouseholdInviteNotification(
            inviteUrl: config('app.frontend_url').'/dashboard',
            householdName: $household->name,
            inviterName: $actor->name,
        ));

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

        if ($target->current_household_id === $household->id) {
            $nextMembership = HouseholdMember::query()
                ->where('user_id', $target->id)
                ->where('household_id', '!=', $household->id)
                ->orderBy('joined_at')
                ->first();

            $target->update(['current_household_id' => $nextMembership?->household_id]);
        }

        return $this->loadHousehold($household);
    }

    /**
     * Transfer ownership from the current owner to an existing member.
     * The actor becomes a regular member; the target becomes the new owner.
     *
     * @throws ValidationException
     */
    public function transferOwnership(Household $household, User $actor, User $newOwner): Household
    {
        $targetMembership = $household->householdMembers()
            ->where('user_id', $newOwner->id)
            ->first();

        if ($targetMembership === null) {
            throw ValidationException::withMessages([
                'user' => ['This user is not a member of your household.'],
            ]);
        }

        if ($newOwner->id === $actor->id) {
            throw ValidationException::withMessages([
                'user' => ['You are already the owner.'],
            ]);
        }

        // Swap roles in household_members table
        $household->householdMembers()
            ->where('user_id', $actor->id)
            ->update(['role' => HouseholdRole::Member]);

        $targetMembership->update(['role' => HouseholdRole::Owner]);

        // Sync Spatie permission roles scoped to this household
        setPermissionsTeamId($household->id);
        Role::firstOrCreate(['name' => 'member', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);

        $actor->syncRoles(['member']);
        $newOwner->syncRoles(['owner']);

        return $this->loadHousehold($household);
    }

    /**
     * Return all households the user belongs to, with their role in each.
     *
     * @return Collection<int, Household>
     */
    public function getUserHouseholds(User $user): Collection
    {
        return $user->households()->orderByPivot('joined_at')->get();
    }

    /**
     * Switch the user's active household. Validates they are a member first.
     *
     * @throws ValidationException
     */
    public function switchHousehold(User $user, string $householdId): Household
    {
        $household = $user->households()->find($householdId);

        if ($household === null) {
            throw ValidationException::withMessages([
                'household_id' => ['You are not a member of this household.'],
            ]);
        }

        $user->update(['current_household_id' => $householdId]);

        return $household;
    }

    /**
     * Delete the household and all associated data.
     * DB cascades handle: household_members, pets, vet_clinics, food_products, reminders.
     * nullOnDelete on users.current_household_id clears member references automatically.
     */
    public function delete(Household $household): void
    {
        $household->delete();
    }

    /**
     * Reload a household with members relationship.
     */
    private function loadHousehold(Household $household): Household
    {
        return $household->load(['householdMembers.user']);
    }
}
