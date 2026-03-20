<?php

declare(strict_types=1);

use App\Enums\HouseholdRole;
use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\User;
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
    [$owner, $household] = householdWithOwner();
    $invitee = User::factory()->create();

    $response = $this->actingAs($owner)
        ->postJson("/api/households/{$household->id}/invite", ['email' => $invitee->email]);

    $response->assertOk()
        ->assertJsonCount(2, 'data.members');

    expect(HouseholdMember::query()
        ->where('household_id', $household->id)
        ->where('user_id', $invitee->id)
        ->exists(),
    )->toBeTrue();

    expect($invitee->fresh()->current_household_id)->toBe($household->id);
});

it('invite returns 422 when email has no account', function () {
    [$owner, $household] = householdWithOwner();

    $this->actingAs($owner)
        ->postJson("/api/households/{$household->id}/invite", ['email' => 'ghost@example.com'])
        ->assertUnprocessable()
        ->assertJsonPath('errors.email.0', 'No FurLog account found with that email.');
});

it('invite returns 422 when user is already a member', function () {
    [$owner, $household] = householdWithOwner();
    $member = addMemberToHousehold($household);

    $this->actingAs($owner)
        ->postJson("/api/households/{$household->id}/invite", ['email' => $member->email])
        ->assertUnprocessable()
        ->assertJsonPath('errors.email.0', 'This user is already a member of your household.');
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
