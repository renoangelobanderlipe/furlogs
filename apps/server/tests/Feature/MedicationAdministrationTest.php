<?php

declare(strict_types=1);

use App\Enums\FrequencyType;
use App\Models\Household;
use App\Models\Medication;
use App\Models\MedicationAdministration;
use App\Models\Pet;
use App\Models\User;
use Spatie\Permission\Models\Role;

/**
 * @return array{0: User, 1: Household, 2: Pet, 3: Medication}
 */
function createAdminOwnerWithMedication(): array
{
    $household = Household::factory()->create();
    $user = User::factory()->create(['current_household_id' => $household->id]);

    setPermissionsTeamId($household->id);
    Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
    $user->assignRole('owner');

    $pet = Pet::factory()->create(['household_id' => $household->id]);
    $medication = Medication::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'name' => 'Amoxicillin',
        'start_date' => now()->toDateString(),
        'frequency' => FrequencyType::Daily->value,
    ]);

    return [$user, $household, $pet, $medication];
}

it('returns 401 for unauthenticated access to administrations', function () {
    [, , , $medication] = createAdminOwnerWithMedication();

    $this->getJson("/api/medications/{$medication->id}/administrations")->assertUnauthorized();
});

it('member of wrong household cannot access administrations', function () {
    [, , , $medication] = createAdminOwnerWithMedication();

    $otherHousehold = Household::factory()->create();
    $otherUser = User::factory()->create(['current_household_id' => $otherHousehold->id]);

    setPermissionsTeamId($otherHousehold->id);
    Role::firstOrCreate(['name' => 'member', 'guard_name' => 'web']);
    $otherUser->assignRole('member');

    $this->actingAs($otherUser)
        ->getJson("/api/medications/{$medication->id}/administrations")
        ->assertNotFound();
});

it('index returns paginated list of administrations for the medication', function () {
    [$owner, , , $medication] = createAdminOwnerWithMedication();

    MedicationAdministration::withoutGlobalScopes()->create([
        'medication_id' => $medication->id,
        'administered_by' => $owner->id,
        'administered_at' => now(),
    ]);

    MedicationAdministration::withoutGlobalScopes()->create([
        'medication_id' => $medication->id,
        'administered_by' => $owner->id,
        'administered_at' => now()->subDay(),
    ]);

    $response = $this->actingAs($owner)
        ->getJson("/api/medications/{$medication->id}/administrations");

    $response->assertOk();
    $response->assertJsonCount(2, 'data');
});

it('date filter returns only administrations for that date', function () {
    [$owner, , , $medication] = createAdminOwnerWithMedication();

    $targetDate = now()->toDateString();

    MedicationAdministration::withoutGlobalScopes()->create([
        'medication_id' => $medication->id,
        'administered_by' => $owner->id,
        'administered_at' => $targetDate.' 09:00:00',
    ]);

    MedicationAdministration::withoutGlobalScopes()->create([
        'medication_id' => $medication->id,
        'administered_by' => $owner->id,
        'administered_at' => now()->subDay()->toDateString().' 09:00:00',
    ]);

    $response = $this->actingAs($owner)
        ->getJson("/api/medications/{$medication->id}/administrations?date={$targetDate}");

    $response->assertOk();
    $response->assertJsonCount(1, 'data');
});

it('store records an administration with administered_at defaulting to now', function () {
    [$owner, , , $medication] = createAdminOwnerWithMedication();

    $response = $this->actingAs($owner)
        ->postJson("/api/medications/{$medication->id}/administrations", []);

    $response->assertCreated();
    $response->assertJsonPath('data.type', 'medication_administrations');

    $this->assertDatabaseHas('medication_administrations', [
        'medication_id' => $medication->id,
    ]);
});

it('administered_by is set to the authenticated user', function () {
    [$owner, , , $medication] = createAdminOwnerWithMedication();

    $this->actingAs($owner)
        ->postJson("/api/medications/{$medication->id}/administrations", []);

    $this->assertDatabaseHas('medication_administrations', [
        'medication_id' => $medication->id,
        'administered_by' => $owner->id,
    ]);
});

it('rejects administered_at in the future with 422', function () {
    [$owner, , , $medication] = createAdminOwnerWithMedication();

    $response = $this->actingAs($owner)
        ->postJson("/api/medications/{$medication->id}/administrations", [
            'administered_at' => now()->addDay()->toISOString(),
        ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['administered_at']);
});

it('update modifies notes and administered_at', function () {
    [$owner, , , $medication] = createAdminOwnerWithMedication();

    $administration = MedicationAdministration::withoutGlobalScopes()->create([
        'medication_id' => $medication->id,
        'administered_by' => $owner->id,
        'administered_at' => now(),
    ]);

    $newAt = now()->subHours(2)->toISOString();

    $response = $this->actingAs($owner)
        ->patchJson("/api/administrations/{$administration->id}", [
            'notes' => 'Updated note',
            'administered_at' => $newAt,
        ]);

    $response->assertOk();
    $response->assertJsonPath('data.attributes.notes', 'Updated note');
});

it('destroy returns 204', function () {
    [$owner, , , $medication] = createAdminOwnerWithMedication();

    $administration = MedicationAdministration::withoutGlobalScopes()->create([
        'medication_id' => $medication->id,
        'administered_by' => $owner->id,
        'administered_at' => now(),
    ]);

    $response = $this->actingAs($owner)
        ->deleteJson("/api/administrations/{$administration->id}");

    $response->assertNoContent();

    $this->assertDatabaseMissing('medication_administrations', ['id' => $administration->id]);
});
