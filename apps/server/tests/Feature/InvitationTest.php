<?php

declare(strict_types=1);

use App\Enums\InvitationStatus;
use App\Models\Household;
use App\Models\HouseholdInvitation;
use App\Models\HouseholdMember;
use App\Models\User;
use App\Notifications\HouseholdInviteNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

// ---------------------------------------------------------------------------
// POST /api/households/{household}/invite (invitation flow)
// ---------------------------------------------------------------------------

it('creates a pending HouseholdInvitation row when owner invites', function () {
    Notification::fake();

    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();

    $this->actingAs($owner)
        ->postJson("/api/households/{$household->id}/invite", ['email' => $invitee->email])
        ->assertCreated();

    expect(HouseholdInvitation::query()
        ->where('household_id', $household->id)
        ->where('invitee_id', $invitee->id)
        ->where('status', InvitationStatus::Pending)
        ->exists(),
    )->toBeTrue();
});

it('does NOT create a HouseholdMember row when owner invites', function () {
    Notification::fake();

    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();

    $this->actingAs($owner)
        ->postJson("/api/households/{$household->id}/invite", ['email' => $invitee->email])
        ->assertCreated();

    expect(HouseholdMember::query()
        ->where('household_id', $household->id)
        ->where('user_id', $invitee->id)
        ->exists(),
    )->toBeFalse();
});

it('returns 422 if a pending invitation already exists for same household+invitee', function () {
    Notification::fake();

    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();

    HouseholdInvitation::factory()->pending()->create([
        'household_id' => $household->id,
        'inviter_id' => $owner->id,
        'invitee_id' => $invitee->id,
    ]);

    $this->actingAs($owner)
        ->postJson("/api/households/{$household->id}/invite", ['email' => $invitee->email])
        ->assertUnprocessable()
        ->assertJsonPath('errors.email.0', 'A pending invitation already exists for this user.');
});

it('non-owner member cannot invite', function () {
    [$owner, $household] = householdWithOwner();
    $member = addMemberToHousehold($household);
    $other = User::factory()->create();

    $this->actingAs($member)
        ->postJson("/api/households/{$household->id}/invite", ['email' => $other->email])
        ->assertForbidden();
});

// ---------------------------------------------------------------------------
// GET /api/invitations/{token}
// ---------------------------------------------------------------------------

it('invitee can view their pending invitation details', function () {
    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();

    $invitation = HouseholdInvitation::factory()->pending()->create([
        'household_id' => $household->id,
        'inviter_id' => $owner->id,
        'invitee_id' => $invitee->id,
    ]);

    $this->actingAs($invitee)
        ->getJson("/api/invitations/{$invitation->token}")
        ->assertOk()
        ->assertJsonPath('data.status', InvitationStatus::Pending->value)
        ->assertJsonPath('data.household_name', $household->name)
        ->assertJsonPath('data.inviter_name', $owner->name)
        ->assertJsonStructure(['data' => ['id', 'token', 'status', 'expires_at', 'household_name', 'inviter_name']]);
});

it('returns 404 if a different authenticated user tries to view the invitation', function () {
    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();
    $stranger = User::factory()->create();

    $invitation = HouseholdInvitation::factory()->pending()->create([
        'household_id' => $household->id,
        'inviter_id' => $owner->id,
        'invitee_id' => $invitee->id,
    ]);

    $this->actingAs($stranger)
        ->getJson("/api/invitations/{$invitation->token}")
        ->assertNotFound();
});

it('returns 404 for a non-existent token', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/invitations/nonexistenttoken123')
        ->assertNotFound();
});

// ---------------------------------------------------------------------------
// POST /api/invitations/{token}/accept
// ---------------------------------------------------------------------------

it('creates HouseholdMember with joined_at set when invitation accepted', function () {
    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();

    $invitation = HouseholdInvitation::factory()->pending()->create([
        'household_id' => $household->id,
        'inviter_id' => $owner->id,
        'invitee_id' => $invitee->id,
    ]);

    $this->actingAs($invitee)
        ->postJson("/api/invitations/{$invitation->token}/accept")
        ->assertOk();

    $member = HouseholdMember::query()
        ->where('household_id', $household->id)
        ->where('user_id', $invitee->id)
        ->first();

    expect($member)->not->toBeNull();
    expect($member->joined_at)->not->toBeNull();
});

it('assigns Spatie member role scoped to the household when accepted', function () {
    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();

    $invitation = HouseholdInvitation::factory()->pending()->create([
        'household_id' => $household->id,
        'inviter_id' => $owner->id,
        'invitee_id' => $invitee->id,
    ]);

    $this->actingAs($invitee)
        ->postJson("/api/invitations/{$invitation->token}/accept")
        ->assertOk();

    setPermissionsTeamId($household->id);
    expect($invitee->fresh()->hasRole('member'))->toBeTrue();
});

it('sets current_household_id if invitee had none when accepted', function () {
    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create(['current_household_id' => null]);

    $invitation = HouseholdInvitation::factory()->pending()->create([
        'household_id' => $household->id,
        'inviter_id' => $owner->id,
        'invitee_id' => $invitee->id,
    ]);

    $this->actingAs($invitee)
        ->postJson("/api/invitations/{$invitation->token}/accept")
        ->assertOk();

    expect($invitee->fresh()->current_household_id)->toBe($household->id);
});

it('does not override current_household_id if invitee already has one', function () {
    [$owner, $household] = householdWithOwner();
    [$invitee, $ownHousehold] = householdWithOwner();

    $invitation = HouseholdInvitation::factory()->pending()->create([
        'household_id' => $household->id,
        'inviter_id' => $owner->id,
        'invitee_id' => $invitee->id,
    ]);

    $this->actingAs($invitee)
        ->postJson("/api/invitations/{$invitation->token}/accept")
        ->assertOk();

    expect($invitee->fresh()->current_household_id)->toBe($ownHousehold->id);
});

it('marks invitation as accepted', function () {
    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();

    $invitation = HouseholdInvitation::factory()->pending()->create([
        'household_id' => $household->id,
        'inviter_id' => $owner->id,
        'invitee_id' => $invitee->id,
    ]);

    $this->actingAs($invitee)
        ->postJson("/api/invitations/{$invitation->token}/accept")
        ->assertOk();

    $fresh = $invitation->fresh();
    expect($fresh->status)->toBe(InvitationStatus::Accepted);
    expect($fresh->accepted_at)->not->toBeNull();
});

it('marks the corresponding database notification as read when accepted', function () {
    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();

    $invitation = HouseholdInvitation::factory()->pending()->create([
        'household_id' => $household->id,
        'inviter_id' => $owner->id,
        'invitee_id' => $invitee->id,
    ]);

    // Seed a database notification matching the invitation token
    $invitee->notifications()->create([
        'id' => Str::uuid(),
        'type' => HouseholdInviteNotification::class,
        'data' => [
            'type' => 'household_invite',
            'invitation_token' => $invitation->token,
            'invite_url' => 'http://localhost/invitations/'.$invitation->token,
        ],
        'read_at' => null,
    ]);

    $this->actingAs($invitee)
        ->postJson("/api/invitations/{$invitation->token}/accept")
        ->assertOk();

    expect($invitee->notifications()->whereNull('read_at')->count())->toBe(0);
});

it('returns 422 if invitation is expired when accepting', function () {
    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();

    $invitation = HouseholdInvitation::factory()->expired()->create([
        'household_id' => $household->id,
        'inviter_id' => $owner->id,
        'invitee_id' => $invitee->id,
    ]);

    $this->actingAs($invitee)
        ->postJson("/api/invitations/{$invitation->token}/accept")
        ->assertUnprocessable()
        ->assertJsonPath('errors.invitation.0', 'This invitation has expired.');
});

it('returns 404 if a different user tries to accept', function () {
    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();
    $stranger = User::factory()->create();

    $invitation = HouseholdInvitation::factory()->pending()->create([
        'household_id' => $household->id,
        'inviter_id' => $owner->id,
        'invitee_id' => $invitee->id,
    ]);

    $this->actingAs($stranger)
        ->postJson("/api/invitations/{$invitation->token}/accept")
        ->assertNotFound();
});

it('returns 422 if invitation is already accepted when trying to accept again', function () {
    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();

    $invitation = HouseholdInvitation::factory()->accepted()->create([
        'household_id' => $household->id,
        'inviter_id' => $owner->id,
        'invitee_id' => $invitee->id,
    ]);

    $this->actingAs($invitee)
        ->postJson("/api/invitations/{$invitation->token}/accept")
        ->assertUnprocessable()
        ->assertJsonPath('errors.invitation.0', 'This invitation has already been responded to.');
});

// ---------------------------------------------------------------------------
// POST /api/invitations/{token}/decline
// ---------------------------------------------------------------------------

it('marks invitation as declined', function () {
    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();

    $invitation = HouseholdInvitation::factory()->pending()->create([
        'household_id' => $household->id,
        'inviter_id' => $owner->id,
        'invitee_id' => $invitee->id,
    ]);

    $this->actingAs($invitee)
        ->postJson("/api/invitations/{$invitation->token}/decline")
        ->assertOk()
        ->assertJsonPath('message', 'Invitation declined.');

    $fresh = $invitation->fresh();
    expect($fresh->status)->toBe(InvitationStatus::Declined);
    expect($fresh->declined_at)->not->toBeNull();
});

it('does NOT create a HouseholdMember row when declined', function () {
    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();

    $invitation = HouseholdInvitation::factory()->pending()->create([
        'household_id' => $household->id,
        'inviter_id' => $owner->id,
        'invitee_id' => $invitee->id,
    ]);

    $this->actingAs($invitee)
        ->postJson("/api/invitations/{$invitation->token}/decline")
        ->assertOk();

    expect(HouseholdMember::query()
        ->where('household_id', $household->id)
        ->where('user_id', $invitee->id)
        ->exists(),
    )->toBeFalse();
});

it('returns 404 if wrong user tries to decline', function () {
    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();
    $stranger = User::factory()->create();

    $invitation = HouseholdInvitation::factory()->pending()->create([
        'household_id' => $household->id,
        'inviter_id' => $owner->id,
        'invitee_id' => $invitee->id,
    ]);

    $this->actingAs($stranger)
        ->postJson("/api/invitations/{$invitation->token}/decline")
        ->assertNotFound();
});

it('returns 422 if invitation is already accepted when declining', function () {
    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();

    $invitation = HouseholdInvitation::factory()->accepted()->create([
        'household_id' => $household->id,
        'inviter_id' => $owner->id,
        'invitee_id' => $invitee->id,
    ]);

    $this->actingAs($invitee)
        ->postJson("/api/invitations/{$invitation->token}/decline")
        ->assertUnprocessable()
        ->assertJsonPath('errors.invitation.0', 'This invitation has already been responded to.');
});

it('returns 422 if invitation is already declined when declining again', function () {
    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();

    $invitation = HouseholdInvitation::factory()->declined()->create([
        'household_id' => $household->id,
        'inviter_id' => $owner->id,
        'invitee_id' => $invitee->id,
    ]);

    $this->actingAs($invitee)
        ->postJson("/api/invitations/{$invitation->token}/decline")
        ->assertUnprocessable()
        ->assertJsonPath('errors.invitation.0', 'This invitation has already been responded to.');
});

// ---------------------------------------------------------------------------
// DELETE /api/households/{household}/invitations/{invitation}
// ---------------------------------------------------------------------------

it('owner can cancel a pending invitation', function () {
    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();

    $invitation = HouseholdInvitation::factory()->pending()->create([
        'household_id' => $household->id,
        'inviter_id' => $owner->id,
        'invitee_id' => $invitee->id,
    ]);

    $this->actingAs($owner)
        ->deleteJson("/api/households/{$household->id}/invitations/{$invitation->id}")
        ->assertOk()
        ->assertJsonPath('message', 'Invitation cancelled.');

    expect(HouseholdInvitation::query()->find($invitation->id))->toBeNull();
});

it('member cannot cancel an invitation', function () {
    [$owner, $household] = householdWithOwner();
    $member = addMemberToHousehold($household);
    $invitee = User::factory()->create();

    $invitation = HouseholdInvitation::factory()->pending()->create([
        'household_id' => $household->id,
        'inviter_id' => $owner->id,
        'invitee_id' => $invitee->id,
    ]);

    $this->actingAs($member)
        ->deleteJson("/api/households/{$household->id}/invitations/{$invitation->id}")
        ->assertForbidden();
});

it('returns 422 when trying to cancel an already-accepted invitation', function () {
    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();

    $invitation = HouseholdInvitation::factory()->accepted()->create([
        'household_id' => $household->id,
        'inviter_id' => $owner->id,
        'invitee_id' => $invitee->id,
    ]);

    $this->actingAs($owner)
        ->deleteJson("/api/households/{$household->id}/invitations/{$invitation->id}")
        ->assertUnprocessable()
        ->assertJsonPath('errors.invitation.0', 'Only pending invitations can be cancelled.');
});

it('returns 404 when cancelling an invitation that belongs to a different household', function () {
    [$owner, $household] = householdWithOwner();
    [$owner2, $household2] = householdWithOwner();
    $invitee = User::factory()->create();

    $invitation = HouseholdInvitation::factory()->pending()->create([
        'household_id' => $household2->id,
        'inviter_id' => $owner2->id,
        'invitee_id' => $invitee->id,
    ]);

    // Owner of household1 tries to cancel an invite that belongs to household2
    $this->actingAs($owner)
        ->deleteJson("/api/households/{$household->id}/invitations/{$invitation->id}")
        ->assertNotFound();
});
