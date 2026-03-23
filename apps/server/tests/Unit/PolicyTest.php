<?php

declare(strict_types=1);

use App\Models\Household;
use App\Models\Medication;
use App\Models\Pet;
use App\Models\Reminder;
use App\Models\User;
use App\Models\VetVisit;
use App\Policies\MedicationPolicy;
use App\Policies\ReminderPolicy;
use App\Policies\VetVisitPolicy;
use Spatie\Permission\Models\Role;

// ---------------------------------------------------------------------------
// Helpers (scoped to this file)
// ---------------------------------------------------------------------------

/**
 * Build a policy test user with a given role in the given household.
 */
function makePolicyTestUser(string $householdId, string $role): User
{
    $user = User::factory()->create(['current_household_id' => $householdId]);

    setPermissionsTeamId($householdId);
    Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
    $user->assignRole($role);

    return $user;
}

// ---------------------------------------------------------------------------
// VetVisitPolicy
// ---------------------------------------------------------------------------

it('VetVisitPolicy: viewAny always returns true for authenticated user', function () {
    $household = Household::factory()->create();
    $user = makePolicyTestUser($household->id, 'member');

    expect((new VetVisitPolicy)->viewAny($user))->toBeTrue();
});

it('VetVisitPolicy: view returns true when visit belongs to user household', function () {
    $household = Household::factory()->create();
    $user = makePolicyTestUser($household->id, 'member');

    $pet = new Pet;
    $pet->household_id = $household->id;

    $visit = new VetVisit;
    $visit->setRelation('pet', $pet);

    expect((new VetVisitPolicy)->view($user, $visit))->toBeTrue();
});

it('VetVisitPolicy: view returns false when visit belongs to different household', function () {
    $household = Household::factory()->create();
    $otherHousehold = Household::factory()->create();
    $user = makePolicyTestUser($household->id, 'member');

    $pet = new Pet;
    $pet->household_id = $otherHousehold->id;

    $visit = new VetVisit;
    $visit->setRelation('pet', $pet);

    expect((new VetVisitPolicy)->view($user, $visit))->toBeFalse();
});

it('VetVisitPolicy: create always returns true for authenticated user', function () {
    $household = Household::factory()->create();
    $user = makePolicyTestUser($household->id, 'member');

    expect((new VetVisitPolicy)->create($user))->toBeTrue();
});

it('VetVisitPolicy: update returns true for household member', function () {
    $household = Household::factory()->create();
    $user = makePolicyTestUser($household->id, 'member');

    $pet = new Pet;
    $pet->household_id = $household->id;

    $visit = new VetVisit;
    $visit->setRelation('pet', $pet);

    expect((new VetVisitPolicy)->update($user, $visit))->toBeTrue();
});

it('VetVisitPolicy: delete requires owner role', function () {
    $household = Household::factory()->create();

    $owner = makePolicyTestUser($household->id, 'owner');
    $member = makePolicyTestUser($household->id, 'member');

    $pet = new Pet;
    $pet->household_id = $household->id;

    $visit = new VetVisit;
    $visit->setRelation('pet', $pet);

    setPermissionsTeamId($household->id);

    expect((new VetVisitPolicy)->delete($owner, $visit))->toBeTrue();
    expect((new VetVisitPolicy)->delete($member, $visit))->toBeFalse();
});

it('VetVisitPolicy: bulkDelete requires owner role', function () {
    $household = Household::factory()->create();

    $owner = makePolicyTestUser($household->id, 'owner');
    $member = makePolicyTestUser($household->id, 'member');

    setPermissionsTeamId($household->id);

    expect((new VetVisitPolicy)->bulkDelete($owner))->toBeTrue();
    expect((new VetVisitPolicy)->bulkDelete($member))->toBeFalse();
});

// ---------------------------------------------------------------------------
// MedicationPolicy
// ---------------------------------------------------------------------------

it('MedicationPolicy: viewAny always returns true', function () {
    $household = Household::factory()->create();
    $user = makePolicyTestUser($household->id, 'member');

    expect((new MedicationPolicy)->viewAny($user))->toBeTrue();
});

it('MedicationPolicy: view returns true when medication belongs to user household', function () {
    $household = Household::factory()->create();
    $user = makePolicyTestUser($household->id, 'member');

    $pet = new Pet;
    $pet->household_id = $household->id;

    $medication = new Medication;
    $medication->setRelation('pet', $pet);

    expect((new MedicationPolicy)->view($user, $medication))->toBeTrue();
});

it('MedicationPolicy: view returns false for different household', function () {
    $household = Household::factory()->create();
    $otherHousehold = Household::factory()->create();
    $user = makePolicyTestUser($household->id, 'member');

    $pet = new Pet;
    $pet->household_id = $otherHousehold->id;

    $medication = new Medication;
    $medication->setRelation('pet', $pet);

    expect((new MedicationPolicy)->view($user, $medication))->toBeFalse();
});

it('MedicationPolicy: create always returns true', function () {
    $household = Household::factory()->create();
    $user = makePolicyTestUser($household->id, 'member');

    expect((new MedicationPolicy)->create($user))->toBeTrue();
});

it('MedicationPolicy: update returns true for household member', function () {
    $household = Household::factory()->create();
    $user = makePolicyTestUser($household->id, 'member');

    $pet = new Pet;
    $pet->household_id = $household->id;

    $medication = new Medication;
    $medication->setRelation('pet', $pet);

    expect((new MedicationPolicy)->update($user, $medication))->toBeTrue();
});

it('MedicationPolicy: delete requires owner role', function () {
    $household = Household::factory()->create();

    $owner = makePolicyTestUser($household->id, 'owner');
    $member = makePolicyTestUser($household->id, 'member');

    $pet = new Pet;
    $pet->household_id = $household->id;

    $medication = new Medication;
    $medication->setRelation('pet', $pet);

    setPermissionsTeamId($household->id);

    expect((new MedicationPolicy)->delete($owner, $medication))->toBeTrue();
    expect((new MedicationPolicy)->delete($member, $medication))->toBeFalse();
});

// ---------------------------------------------------------------------------
// ReminderPolicy
// ---------------------------------------------------------------------------

it('ReminderPolicy: viewAny always returns true', function () {
    $household = Household::factory()->create();
    $user = makePolicyTestUser($household->id, 'member');

    expect((new ReminderPolicy)->viewAny($user))->toBeTrue();
});

it('ReminderPolicy: view returns true when reminder belongs to user household', function () {
    $household = Household::factory()->create();
    $user = makePolicyTestUser($household->id, 'member');

    $reminder = new Reminder;
    $reminder->household_id = $household->id;

    expect((new ReminderPolicy)->view($user, $reminder))->toBeTrue();
});

it('ReminderPolicy: view returns false for different household', function () {
    $household = Household::factory()->create();
    $otherHousehold = Household::factory()->create();
    $user = makePolicyTestUser($household->id, 'member');

    $reminder = new Reminder;
    $reminder->household_id = $otherHousehold->id;

    expect((new ReminderPolicy)->view($user, $reminder))->toBeFalse();
});

it('ReminderPolicy: create always returns true', function () {
    $household = Household::factory()->create();
    $user = makePolicyTestUser($household->id, 'member');

    expect((new ReminderPolicy)->create($user))->toBeTrue();
});

it('ReminderPolicy: update returns true for household member', function () {
    $household = Household::factory()->create();
    $user = makePolicyTestUser($household->id, 'member');

    $reminder = new Reminder;
    $reminder->household_id = $household->id;

    expect((new ReminderPolicy)->update($user, $reminder))->toBeTrue();
});

it('ReminderPolicy: delete requires owner role', function () {
    $household = Household::factory()->create();

    $owner = makePolicyTestUser($household->id, 'owner');
    $member = makePolicyTestUser($household->id, 'member');

    setPermissionsTeamId($household->id);

    $reminder = new Reminder;
    $reminder->household_id = $household->id;

    expect((new ReminderPolicy)->delete($owner, $reminder))->toBeTrue();
    expect((new ReminderPolicy)->delete($member, $reminder))->toBeFalse();
});

it('ReminderPolicy: members can complete (update) a reminder', function () {
    $household = Household::factory()->create();
    $member = makePolicyTestUser($household->id, 'member');

    $reminder = new Reminder;
    $reminder->household_id = $household->id;

    // Update is used for complete/snooze/dismiss — members should be allowed
    expect((new ReminderPolicy)->update($member, $reminder))->toBeTrue();
});
