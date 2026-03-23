<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\HouseholdRole;
use App\Enums\InvitationStatus;
use App\Models\Household;
use App\Models\HouseholdInvitation;
use App\Models\HouseholdMember;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class InvitationService
{
    /**
     * Find an invitation by token, ensuring it belongs to the given actor.
     * Throws 404 if not found or if the token belongs to a different user.
     */
    public function getByToken(string $token, User $actor): HouseholdInvitation
    {
        $invitation = HouseholdInvitation::query()
            ->with(['household', 'inviter'])
            ->where('token', $token)
            ->first();

        if ($invitation === null || $invitation->invitee_id !== $actor->id) {
            abort(404);
        }

        return $invitation;
    }

    /**
     * Accept a pending invitation. Creates a HouseholdMember record, assigns the
     * Spatie member role, optionally sets the actor's current_household_id, marks
     * the corresponding database notification as read, and returns the household.
     *
     * @throws ValidationException
     */
    public function accept(HouseholdInvitation $invitation, User $actor): Household
    {
        if (! $invitation->isPending()) {
            throw ValidationException::withMessages([
                'invitation' => ['This invitation has already been responded to.'],
            ]);
        }

        if ($invitation->isExpired()) {
            throw ValidationException::withMessages([
                'invitation' => ['This invitation has expired.'],
            ]);
        }

        return DB::transaction(function () use ($invitation, $actor): Household {
            HouseholdMember::query()->create([
                'household_id' => $invitation->household_id,
                'user_id' => $actor->id,
                'role' => HouseholdRole::Member,
                'invited_at' => $invitation->created_at,
                'joined_at' => now(),
            ]);

            $invitation->update([
                'status' => InvitationStatus::Accepted,
                'accepted_at' => now(),
            ]);

            setPermissionsTeamId($invitation->household_id);
            Role::firstOrCreate(['name' => 'member', 'guard_name' => 'web']);
            $actor->assignRole('member');

            if ($actor->current_household_id === null) {
                $actor->update(['current_household_id' => $invitation->household_id]);
            }

            // Mark the corresponding database notification as read
            $actor->notifications()
                ->whereNull('read_at')
                ->where('data->type', 'household_invite')
                ->where('data->invitation_token', $invitation->token)
                ->update(['read_at' => now()]);

            return $invitation->household->load(['householdMembers.user']);
        });
    }

    /**
     * Decline a pending invitation, recording the declined_at timestamp.
     * Does not create a HouseholdMember record.
     *
     * @throws ValidationException
     */
    public function decline(HouseholdInvitation $invitation): void
    {
        if (! $invitation->isPending()) {
            throw ValidationException::withMessages([
                'invitation' => ['This invitation has already been responded to.'],
            ]);
        }

        $invitation->update([
            'status' => InvitationStatus::Declined,
            'declined_at' => now(),
        ]);

        $invitation->loadMissing('invitee');

        $invitation->invitee?->notifications()
            ->whereNull('read_at')
            ->where('data->type', 'household_invite')
            ->where('data->invitation_token', $invitation->token)
            ->update(['read_at' => now()]);
    }
}
