<?php

declare(strict_types=1);

use App\Models\Household;
use App\Models\Pet;
use App\Models\User;
use App\Policies\PetPolicy;
use Spatie\Permission\Models\Role;

function makePolicyUser(int $householdId, string $role): User
{
    $user = User::factory()->create(['current_household_id' => $householdId]);

    setPermissionsTeamId($householdId);
    Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
    $user->assignRole($role);

    return $user;
}

/**
 * Build a Pet model instance with a specific household_id without triggering global scopes.
 */
function makePetForHousehold(int $householdId): Pet
{
    $pet = new Pet;
    $pet->household_id = $householdId;

    return $pet;
}

it('allows any authenticated user to viewAny', function () {
    $household = Household::factory()->create();
    $user = makePolicyUser($household->id, 'member');

    expect((new PetPolicy)->viewAny($user))->toBeTrue();
});

it('allows view when pet belongs to same household', function () {
    $household = Household::factory()->create();
    $user = makePolicyUser($household->id, 'member');
    $pet = makePetForHousehold($household->id);

    expect((new PetPolicy)->view($user, $pet))->toBeTrue();
});

it('denies view when pet belongs to different household', function () {
    $household = Household::factory()->create();
    $otherHousehold = Household::factory()->create();
    $user = makePolicyUser($household->id, 'member');
    $pet = makePetForHousehold($otherHousehold->id);

    expect((new PetPolicy)->view($user, $pet))->toBeFalse();
});

it('allows any authenticated user to create', function () {
    $household = Household::factory()->create();
    $user = makePolicyUser($household->id, 'member');

    expect((new PetPolicy)->create($user))->toBeTrue();
});

it('allows update when pet belongs to same household', function () {
    $household = Household::factory()->create();
    $user = makePolicyUser($household->id, 'member');
    $pet = makePetForHousehold($household->id);

    expect((new PetPolicy)->update($user, $pet))->toBeTrue();
});

it('allows owner to delete pet in same household', function () {
    $household = Household::factory()->create();
    $user = makePolicyUser($household->id, 'owner');
    $pet = makePetForHousehold($household->id);

    setPermissionsTeamId($household->id);

    expect((new PetPolicy)->delete($user, $pet))->toBeTrue();
});

it('denies member from deleting a pet', function () {
    $household = Household::factory()->create();
    $user = makePolicyUser($household->id, 'member');
    $pet = makePetForHousehold($household->id);

    setPermissionsTeamId($household->id);

    expect((new PetPolicy)->delete($user, $pet))->toBeFalse();
});

it('denies delete when pet is from different household even for owner', function () {
    $household = Household::factory()->create();
    $otherHousehold = Household::factory()->create();
    $user = makePolicyUser($household->id, 'owner');
    $pet = makePetForHousehold($otherHousehold->id);

    setPermissionsTeamId($household->id);

    expect((new PetPolicy)->delete($user, $pet))->toBeFalse();
});
