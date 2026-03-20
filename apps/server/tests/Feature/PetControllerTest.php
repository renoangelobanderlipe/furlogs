<?php

declare(strict_types=1);

use App\Enums\Sex;
use App\Enums\Species;
use App\Models\Household;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Foundation\Testing\WithFaker;
use Spatie\Permission\Models\Role;

uses(WithFaker::class);

/**
 * Helper: create a user who owns a household (with Spatie owner role).
 */
function createOwnerWithHousehold(): array
{
    $household = Household::factory()->create();
    $user = User::factory()->create(['current_household_id' => $household->id]);

    setPermissionsTeamId($household->id);

    Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
    $user->assignRole('owner');

    return [$user, $household];
}

/**
 * Helper: create a user who is a member (not owner) of a household.
 */
function createMemberWithHousehold(Household $household): User
{
    $user = User::factory()->create(['current_household_id' => $household->id]);

    setPermissionsTeamId($household->id);

    Role::firstOrCreate(['name' => 'member', 'guard_name' => 'web']);
    $user->assignRole('member');

    return $user;
}

it('can list pets for authenticated user', function () {
    [$owner, $household] = createOwnerWithHousehold();

    Pet::factory()->count(2)->create(['household_id' => $household->id]);

    $response = $this->actingAs($owner)->getJson('/api/pets');

    $response->assertOk();
    $response->assertJsonCount(2, 'data');
});

it('cannot see pets from another household', function () {
    [$owner, $household] = createOwnerWithHousehold();

    // Pet in a different household
    $otherHousehold = Household::factory()->create();
    Pet::factory()->create(['household_id' => $otherHousehold->id]);

    // Pet in owner's household
    Pet::factory()->create(['household_id' => $household->id]);

    $response = $this->actingAs($owner)->getJson('/api/pets');

    $response->assertOk();
    $response->assertJsonCount(1, 'data');
});

it('can create a pet', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $payload = [
        'name' => 'Buddy',
        'species' => Species::Dog->value,
        'sex' => Sex::Male->value,
        'is_neutered' => false,
    ];

    $response = $this->actingAs($owner)->postJson('/api/pets', $payload);

    $response->assertStatus(201);
    $this->assertDatabaseHas('pets', [
        'name' => 'Buddy',
        'household_id' => $household->id,
        'species' => 'dog',
        'sex' => 'male',
    ]);
});

it('can update a pet', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $response = $this->actingAs($owner)->patchJson("/api/pets/{$pet->id}", [
        'name' => 'UpdatedName',
    ]);

    $response->assertOk();
    $this->assertDatabaseHas('pets', ['id' => $pet->id, 'name' => 'UpdatedName']);
});

it('owner can delete a pet', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $response = $this->actingAs($owner)->deleteJson("/api/pets/{$pet->id}");

    $response->assertNoContent();
    $this->assertSoftDeleted('pets', ['id' => $pet->id]);
});

it('member cannot delete a pet', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $member = createMemberWithHousehold($household);

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $response = $this->actingAs($member)->deleteJson("/api/pets/{$pet->id}");

    $response->assertForbidden();
});

it('validates pet data on create', function () {
    [$owner] = createOwnerWithHousehold();

    $response = $this->actingAs($owner)->postJson('/api/pets', []);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['name', 'species', 'sex']);
});

it('returns 404 when viewing pet from another household due to scope', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $otherHousehold = Household::factory()->create();

    // Create the pet in another household without the authenticated scope interfering
    $pet = Pet::withoutGlobalScopes()->create([
        'household_id' => $otherHousehold->id,
        'name' => 'OtherPet',
        'species' => 'dog',
        'sex' => 'male',
        'is_neutered' => false,
    ]);

    // Route model binding uses the global scope, so the pet won't be found → 404
    $response = $this->actingAs($owner)->getJson("/api/pets/{$pet->id}");

    $response->assertNotFound();
});

it('can record a weight for a pet', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $response = $this->actingAs($owner)->postJson("/api/pets/{$pet->id}/weights", [
        'weight_kg' => 12.5,
        'recorded_at' => now()->toDateString(),
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('pet_weights', ['pet_id' => $pet->id, 'weight_kg' => 12.5]);
});
