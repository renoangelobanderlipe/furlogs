<?php

declare(strict_types=1);

use App\Enums\HouseholdRole;
use App\Enums\InvitationStatus;
use App\Models\Household;
use App\Models\HouseholdInvitation;
use App\Models\HouseholdMember;
use App\Models\User;
use App\Notifications\HouseholdInviteNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Create a household with an owner and add that owner to household_members.
 *
 * @return array{User, Household}
 */
function householdWithOwner(): array
{
    $household = Household::factory()->create();
    $owner = User::factory()->create(['current_household_id' => $household->id]);

    HouseholdMember::factory()->create([
        'household_id' => $household->id,
        'user_id' => $owner->id,
        'role' => HouseholdRole::Owner,
        'joined_at' => now(),
    ]);

    setPermissionsTeamId($household->id);
    Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
    $owner->assignRole('owner');

    return [$owner, $household];
}

/**
 * Add a regular member to an existing household.
 */
function addMemberToHousehold(Household $household): User
{
    $member = User::factory()->create(['current_household_id' => $household->id]);

    HouseholdMember::factory()->create([
        'household_id' => $household->id,
        'user_id' => $member->id,
        'role' => HouseholdRole::Member,
        'joined_at' => now(),
    ]);

    setPermissionsTeamId($household->id);
    Role::firstOrCreate(['name' => 'member', 'guard_name' => 'web']);
    $member->assignRole('member');

    return $member;
}

// ---------------------------------------------------------------------------
// GET /api/households/current
// ---------------------------------------------------------------------------

it('returns the current household with members', function () {
    [$owner, $household] = householdWithOwner();

    $response = $this->actingAs($owner)->getJson('/api/households/current');

    $response->assertOk()
        ->assertJsonPath('data.id', $household->id)
        ->assertJsonPath('data.name', $household->name)
        ->assertJsonCount(1, 'data.members');
});

it('returns member details with role and joinedAt', function () {
    [$owner, $household] = householdWithOwner();

    $response = $this->actingAs($owner)->getJson('/api/households/current');

    $response->assertOk()
        ->assertJsonPath('data.members.0.email', $owner->email)
        ->assertJsonPath('data.members.0.role', 'owner')
        ->assertJsonStructure(['data' => ['members' => [['id', 'name', 'email', 'role', 'joinedAt']]]]);
});

it('requires authentication to get current household', function () {
    $this->getJson('/api/households/current')->assertUnauthorized();
});

// ---------------------------------------------------------------------------
// PATCH /api/households/{household}
// ---------------------------------------------------------------------------

it('owner can rename the household', function () {
    [$owner, $household] = householdWithOwner();

    $response = $this->actingAs($owner)
        ->patchJson("/api/households/{$household->id}", ['name' => 'New Name']);

    $response->assertOk()
        ->assertJsonPath('data.name', 'New Name');

    expect($household->fresh()->name)->toBe('New Name');
});

it('member cannot rename the household', function () {
    [$owner, $household] = householdWithOwner();
    $member = addMemberToHousehold($household);

    $this->actingAs($member)
        ->patchJson("/api/households/{$household->id}", ['name' => 'Hijacked'])
        ->assertForbidden();
});

it('outsider cannot rename a household', function () {
    [, $household] = householdWithOwner();
    $outsider = User::factory()->create();

    $this->actingAs($outsider)
        ->patchJson("/api/households/{$household->id}", ['name' => 'Hijacked'])
        ->assertForbidden();
});

it('validates name is required when renaming', function () {
    [$owner, $household] = householdWithOwner();

    $this->actingAs($owner)
        ->patchJson("/api/households/{$household->id}", ['name' => ''])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
});

// ---------------------------------------------------------------------------
// POST /api/households/{household}/invite
// ---------------------------------------------------------------------------

it('owner can invite a user by email', function () {
    Notification::fake();

    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();

    $response = $this->actingAs($owner)
        ->postJson("/api/households/{$household->id}/invite", ['email' => $invitee->email]);

    $response->assertCreated()
        ->assertJsonPath('message', 'Invitation sent.');

    // A pending invitation row is created, NOT a HouseholdMember row.
    expect(HouseholdInvitation::query()
        ->where('household_id', $household->id)
        ->where('invitee_id', $invitee->id)
        ->where('status', InvitationStatus::Pending)
        ->exists(),
    )->toBeTrue();

    expect(HouseholdMember::query()
        ->where('household_id', $household->id)
        ->where('user_id', $invitee->id)
        ->exists(),
    )->toBeFalse();

    // Invitee's current household is not touched.
    expect($invitee->fresh()->current_household_id)->toBeNull();

    // Email is queued via notification class (mail channel only).
    Notification::assertSentTo($invitee, HouseholdInviteNotification::class, function (HouseholdInviteNotification $notification) {
        expect($notification->via(new stdClass))->toBe(['mail']);

        return true;
    });

    // DB notification is written synchronously by the service.
    $record = $invitee->notifications()->first();
    expect($record)->not->toBeNull();
    expect($record->data['type'])->toBe('household_invite');
    expect($record->data)->toHaveKeys(['title', 'inviter_name', 'household_name', 'invite_url', 'invitation_token']);
});

it('inviting a user who owns their own household does not change their active household', function () {
    Notification::fake();

    [$owner, $household] = householdWithOwner();
    [$invitee, $inviteeHousehold] = householdWithOwner();

    $this->actingAs($owner)
        ->postJson("/api/households/{$household->id}/invite", ['email' => $invitee->email])
        ->assertCreated();

    // Invitee still points to their own household.
    expect($invitee->fresh()->current_household_id)->toBe($inviteeHousehold->id);
});

it('invite returns 422 when email has no account', function () {
    [$owner, $household] = householdWithOwner();

    $this->actingAs($owner)
        ->postJson("/api/households/{$household->id}/invite", ['email' => 'ghost@example.com'])
        ->assertUnprocessable()
        ->assertJsonPath('errors.email.0', 'If this email is registered, an invitation will be sent to them.');
});

it('invite returns 422 when user is already a member', function () {
    [$owner, $household] = householdWithOwner();
    $member = addMemberToHousehold($household);

    $this->actingAs($owner)
        ->postJson("/api/households/{$household->id}/invite", ['email' => $member->email])
        ->assertUnprocessable()
        ->assertJsonPath('errors.email.0', 'If this email is registered, an invitation will be sent to them.');
});

it('member cannot invite others', function () {
    [$owner, $household] = householdWithOwner();
    $member = addMemberToHousehold($household);
    $other = User::factory()->create();

    $this->actingAs($member)
        ->postJson("/api/households/{$household->id}/invite", ['email' => $other->email])
        ->assertForbidden();
});

it('validates email format when inviting', function () {
    [$owner, $household] = householdWithOwner();

    $this->actingAs($owner)
        ->postJson("/api/households/{$household->id}/invite", ['email' => 'not-an-email'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

// ---------------------------------------------------------------------------
// DELETE /api/households/{household}/members/{user}
// ---------------------------------------------------------------------------

it('owner can remove a member', function () {
    [$owner, $household] = householdWithOwner();
    $member = addMemberToHousehold($household);

    $response = $this->actingAs($owner)
        ->deleteJson("/api/households/{$household->id}/members/{$member->id}");

    $response->assertOk()
        ->assertJsonCount(1, 'data.members');

    expect(HouseholdMember::query()
        ->where('household_id', $household->id)
        ->where('user_id', $member->id)
        ->exists(),
    )->toBeFalse();
});

it('member can leave (remove themselves)', function () {
    [$owner, $household] = householdWithOwner();
    $member = addMemberToHousehold($household);

    $response = $this->actingAs($member)
        ->deleteJson("/api/households/{$household->id}/members/{$member->id}");

    $response->assertOk();

    expect($member->fresh()->current_household_id)->toBeNull();
});

it('removes member and nulls their current_household_id when it pointed to this household', function () {
    [$owner, $household] = householdWithOwner();
    $member = addMemberToHousehold($household);

    $this->actingAs($owner)
        ->deleteJson("/api/households/{$household->id}/members/{$member->id}")
        ->assertOk();

    expect($member->fresh()->current_household_id)->toBeNull();
});

it('removes member but keeps their current_household_id if they already switched away', function () {
    [$owner, $household] = householdWithOwner();
    [, $ownHousehold] = householdWithOwner();
    $member = User::factory()->create(['current_household_id' => $ownHousehold->id]);

    HouseholdMember::factory()->create([
        'household_id' => $household->id,
        'user_id' => $member->id,
        'role' => HouseholdRole::Member,
        'joined_at' => now(),
    ]);

    $this->actingAs($owner)
        ->deleteJson("/api/households/{$household->id}/members/{$member->id}")
        ->assertOk();

    // They were viewing their own household, not this one — pointer unchanged.
    expect($member->fresh()->current_household_id)->toBe($ownHousehold->id);
});

it('member cannot remove another member', function () {
    [$owner, $household] = householdWithOwner();
    $memberA = addMemberToHousehold($household);
    $memberB = addMemberToHousehold($household);

    $this->actingAs($memberA)
        ->deleteJson("/api/households/{$household->id}/members/{$memberB->id}")
        ->assertForbidden();
});

it('cannot remove the owner from the household', function () {
    [$owner, $household] = householdWithOwner();
    $member = addMemberToHousehold($household);

    // Even the owner cannot remove themselves (they are the owner)
    $this->actingAs($owner)
        ->deleteJson("/api/households/{$household->id}/members/{$owner->id}")
        ->assertUnprocessable()
        ->assertJsonPath('errors.user.0', 'The household owner cannot be removed.');
});

it('outsider cannot remove a member from another household', function () {
    [$owner, $household] = householdWithOwner();
    $member = addMemberToHousehold($household);
    $outsider = User::factory()->create();

    $this->actingAs($outsider)
        ->deleteJson("/api/households/{$household->id}/members/{$member->id}")
        ->assertForbidden();
});

// ---------------------------------------------------------------------------
// POST /api/households/{household}/transfer-ownership/{user}
// ---------------------------------------------------------------------------

it('owner can transfer ownership to a member', function () {
    [$owner, $household] = householdWithOwner();
    $member = addMemberToHousehold($household);

    $response = $this->actingAs($owner)
        ->postJson("/api/households/{$household->id}/transfer-ownership/{$member->id}");

    $response->assertOk();

    // New owner's role updated in household_members
    expect(
        HouseholdMember::query()
            ->where('household_id', $household->id)
            ->where('user_id', $member->id)
            ->value('role'),
    )->toBe(HouseholdRole::Owner);

    // Old owner is now a member
    expect(
        HouseholdMember::query()
            ->where('household_id', $household->id)
            ->where('user_id', $owner->id)
            ->value('role'),
    )->toBe(HouseholdRole::Member);
});

it('member cannot transfer ownership', function () {
    [$owner, $household] = householdWithOwner();
    $member = addMemberToHousehold($household);
    $other = addMemberToHousehold($household);

    $this->actingAs($member)
        ->postJson("/api/households/{$household->id}/transfer-ownership/{$other->id}")
        ->assertForbidden();
});

it('cannot transfer ownership to oneself', function () {
    [$owner, $household] = householdWithOwner();

    $this->actingAs($owner)
        ->postJson("/api/households/{$household->id}/transfer-ownership/{$owner->id}")
        ->assertUnprocessable()
        ->assertJsonPath('errors.user.0', 'You are already the owner.');
});

it('cannot transfer ownership to a non-member', function () {
    [$owner, $household] = householdWithOwner();
    $outsider = User::factory()->create();

    $this->actingAs($owner)
        ->postJson("/api/households/{$household->id}/transfer-ownership/{$outsider->id}")
        ->assertUnprocessable()
        ->assertJsonPath('errors.user.0', 'This user is not a member of your household.');
});

// ---------------------------------------------------------------------------
// DELETE /api/households/{household}
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// GET /api/user/households
// ---------------------------------------------------------------------------

it('lists all households the user belongs to', function () {
    [$user, $householdA] = householdWithOwner();
    [, $householdB] = householdWithOwner();

    // Add user to a second household as member
    HouseholdMember::factory()->create([
        'household_id' => $householdB->id,
        'user_id' => $user->id,
        'role' => HouseholdRole::Member,
        'joined_at' => now(),
    ]);

    $response = $this->actingAs($user)->getJson('/api/user/households');

    $response->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.id', $householdA->id)
        ->assertJsonPath('data.0.role', 'owner')
        ->assertJsonPath('data.1.id', $householdB->id)
        ->assertJsonPath('data.1.role', 'member');
});

it('requires authentication to list user households', function () {
    $this->getJson('/api/user/households')->assertUnauthorized();
});

// ---------------------------------------------------------------------------
// PATCH /api/user/switch-household
// ---------------------------------------------------------------------------

it('user can switch to a household they belong to', function () {
    [$user] = householdWithOwner();
    [, $householdB] = householdWithOwner();

    HouseholdMember::factory()->create([
        'household_id' => $householdB->id,
        'user_id' => $user->id,
        'role' => HouseholdRole::Member,
        'joined_at' => now(),
    ]);

    $this->actingAs($user)
        ->patchJson('/api/user/switch-household', ['household_id' => $householdB->id])
        ->assertOk()
        ->assertJsonPath('data.id', $householdB->id);

    expect($user->fresh()->current_household_id)->toBe($householdB->id);
});

it('cannot switch to a household the user is not a member of', function () {
    [$user] = householdWithOwner();
    [, $otherHousehold] = householdWithOwner();

    $this->actingAs($user)
        ->patchJson('/api/user/switch-household', ['household_id' => $otherHousehold->id])
        ->assertUnprocessable()
        ->assertJsonPath('errors.household_id.0', 'You are not a member of this household.');
});

it('validates household_id is required when switching', function () {
    [$user] = householdWithOwner();

    $this->actingAs($user)
        ->patchJson('/api/user/switch-household', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['household_id']);
});

it('requires authentication to switch household', function () {
    $this->patchJson('/api/user/switch-household', ['household_id' => fake()->uuid()])
        ->assertUnauthorized();
});

// ---------------------------------------------------------------------------
// DELETE /api/households/{household}
// ---------------------------------------------------------------------------

it('owner can delete the household', function () {
    [$owner, $household] = householdWithOwner();
    $householdId = $household->id;

    $this->actingAs($owner)
        ->deleteJson("/api/households/{$householdId}")
        ->assertNoContent();

    expect(Household::query()->find($householdId))->toBeNull();
    expect($owner->fresh()->current_household_id)->toBeNull();
});

it('member cannot delete the household', function () {
    [$owner, $household] = householdWithOwner();
    $member = addMemberToHousehold($household);

    $this->actingAs($member)
        ->deleteJson("/api/households/{$household->id}")
        ->assertForbidden();
});

it('outsider cannot delete a household', function () {
    [, $household] = householdWithOwner();
    $outsider = User::factory()->create();

    $this->actingAs($outsider)
        ->deleteJson("/api/households/{$household->id}")
        ->assertForbidden();
});

// ---------------------------------------------------------------------------
// Household invite — notification DB storage & API shape
// ---------------------------------------------------------------------------

/**
 * Mirror what HouseholdService::inviteByEmail() does: write the DB notification
 * synchronously so tests don't need a queue worker.
 */
function sendInviteNotification(User $invitee, Household $household, User $owner): void
{
    $token = bin2hex(random_bytes(32));

    $invitee->notifications()->create([
        'id' => Str::uuid()->toString(),
        'type' => HouseholdInviteNotification::class,
        'data' => [
            'type' => 'household_invite',
            'title' => "{$owner->name} invited you to join {$household->name}",
            'inviter_name' => $owner->name,
            'household_name' => $household->name,
            'invite_url' => config('app.frontend_url').'/invitations/'.$token,
            'invitation_token' => $token,
        ],
    ]);
}

it('household invite notification is persisted to the database', function () {
    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();

    sendInviteNotification($invitee, $household, $owner);

    expect($invitee->notifications()->count())->toBe(1);

    $record = $invitee->notifications()->first();
    expect($record->data['type'])->toBe('household_invite');
    expect($record->data['title'])->toContain($household->name);
    expect($record->data['inviter_name'])->toBe($owner->name);
    expect($record->data['household_name'])->toBe($household->name);
    expect($record->data['invite_url'])->not->toBeEmpty();
    expect($record->read_at)->toBeNull();
});

it('household invite notification appears in the notifications API with correct shape', function () {
    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();

    sendInviteNotification($invitee, $household, $owner);

    $response = $this->actingAs($invitee)
        ->getJson('/api/notifications');

    $response->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.type', 'household_invite')
        ->assertJsonPath('data.0.readAt', null)
        ->assertJsonPath('data.0.data.type', 'household_invite')
        ->assertJsonPath('data.0.data.inviter_name', $owner->name)
        ->assertJsonPath('data.0.data.household_name', $household->name);

    expect($response->json('data.0.data.title'))->toContain($household->name);
});

it('household invite increments the unread notification count', function () {
    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();

    $this->actingAs($invitee)
        ->getJson('/api/notifications/unread-count')
        ->assertOk()
        ->assertJsonPath('data.count', 0);

    sendInviteNotification($invitee, $household, $owner);

    $this->actingAs($invitee)
        ->getJson('/api/notifications/unread-count')
        ->assertOk()
        ->assertJsonPath('data.count', 1);
});

it('household invite notification can be marked as read', function () {
    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();

    sendInviteNotification($invitee, $household, $owner);

    $notificationId = $invitee->notifications()->first()->getKey();

    $this->actingAs($invitee)
        ->patchJson("/api/notifications/{$notificationId}")
        ->assertOk()
        ->assertJsonPath('message', 'Notification marked as read.');

    expect($invitee->unreadNotifications()->count())->toBe(0);
});

it('deleting a household removes all members', function () {
    [$owner, $household] = householdWithOwner();
    $member = addMemberToHousehold($household);
    $householdId = $household->id;

    $this->actingAs($owner)
        ->deleteJson("/api/households/{$householdId}")
        ->assertNoContent();

    expect(HouseholdMember::query()->where('household_id', $householdId)->count())->toBe(0);
    expect($member->fresh()->current_household_id)->toBeNull();
});
