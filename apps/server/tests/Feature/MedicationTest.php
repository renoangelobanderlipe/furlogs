<?php

declare(strict_types=1);

use App\Enums\VisitType;
use App\Models\Household;
use App\Models\Medication;
use App\Models\Pet;
use App\Models\Reminder;
use App\Models\VetVisit;

it('creating a medication with end_date auto-creates a reminder', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $response = $this->actingAs($owner)->postJson('/api/medications', [
        'pet_id' => $pet->id,
        'name' => 'Amoxicillin',
        'start_date' => now()->toDateString(),
        'end_date' => now()->addDays(10)->toDateString(),
    ]);

    $response->assertCreated();

    $this->assertDatabaseHas('reminders', [
        'household_id' => $household->id,
        'pet_id' => $pet->id,
        'type' => 'medication',
        'source_type' => Medication::class,
    ]);
});

it('creating a medication without end_date does NOT create a reminder', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $response = $this->actingAs($owner)->postJson('/api/medications', [
        'pet_id' => $pet->id,
        'name' => 'Prednisolone',
        'start_date' => now()->toDateString(),
    ]);

    $response->assertCreated();

    expect(Reminder::withoutGlobalScopes()->where('type', 'medication')->count())->toBe(0);
});

it('can list medications scoped to the authenticated user household', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    Medication::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'name' => 'Amoxicillin',
        'start_date' => now()->toDateString(),
    ]);

    // Medication in another household
    $otherHousehold = Household::factory()->create();
    $otherPet = Pet::withoutGlobalScopes()->create([
        'household_id' => $otherHousehold->id,
        'name' => 'OtherPet',
        'species' => 'dog',
        'sex' => 'male',
        'is_neutered' => false,
    ]);
    Medication::withoutGlobalScopes()->create([
        'pet_id' => $otherPet->id,
        'name' => 'Furosemide',
        'start_date' => now()->toDateString(),
    ]);

    $response = $this->actingAs($owner)->getJson('/api/medications');

    $response->assertOk();
    $response->assertJsonCount(1, 'data');
});

it('cannot view medication from another household', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $otherHousehold = Household::factory()->create();
    $otherPet = Pet::withoutGlobalScopes()->create([
        'household_id' => $otherHousehold->id,
        'name' => 'OtherPet',
        'species' => 'dog',
        'sex' => 'male',
        'is_neutered' => false,
    ]);
    $medication = Medication::withoutGlobalScopes()->create([
        'pet_id' => $otherPet->id,
        'name' => 'Enalapril',
        'start_date' => now()->toDateString(),
    ]);

    $response = $this->actingAs($owner)->getJson("/api/medications/{$medication->id}");

    $response->assertNotFound();
});

it('only owner can delete a medication', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $member = createMemberWithHousehold($household);
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $medication = Medication::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'name' => 'Metronidazole',
        'start_date' => now()->toDateString(),
    ]);

    $this->actingAs($member)->deleteJson("/api/medications/{$medication->id}")->assertForbidden();
    $this->actingAs($owner)->deleteJson("/api/medications/{$medication->id}")->assertNoContent();

    $this->assertSoftDeleted('medications', ['id' => $medication->id]);
});

it('validates required fields on store medication', function () {
    [$owner] = createOwnerWithHousehold();

    $response = $this->actingAs($owner)->postJson('/api/medications', []);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['pet_id', 'name', 'start_date']);
});

it('vet_visit_id from a different household is rejected with 422', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    // Create a vet visit in a different household
    $otherHousehold = Household::factory()->create();
    $otherPet = Pet::withoutGlobalScopes()->create([
        'household_id' => $otherHousehold->id,
        'name' => 'OtherPet',
        'species' => 'dog',
        'sex' => 'male',
        'is_neutered' => false,
    ]);

    $otherVisit = VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $otherPet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Other household visit',
    ]);

    $response = $this->actingAs($owner)->postJson('/api/medications', [
        'pet_id' => $pet->id,
        'name' => 'Amoxicillin',
        'start_date' => now()->toDateString(),
        'vet_visit_id' => $otherVisit->id,
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['vet_visit_id']);
});

it('updating end_date on a medication deletes the old reminder and creates a new one', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $response = $this->actingAs($owner)->postJson('/api/medications', [
        'pet_id' => $pet->id,
        'name' => 'Prednisolone',
        'start_date' => now()->toDateString(),
        'end_date' => now()->addDays(10)->toDateString(),
    ]);
    $response->assertCreated();
    $medicationId = $response->json('data.id');

    expect(Reminder::withoutGlobalScopes()
        ->where('source_type', Medication::class)
        ->where('source_id', $medicationId)
        ->count(),
    )->toBe(1);

    $newEndDate = now()->addDays(20)->toDateString();

    $this->actingAs($owner)->patchJson("/api/medications/{$medicationId}", [
        'end_date' => $newEndDate,
    ])->assertOk();

    $reminders = Reminder::withoutGlobalScopes()
        ->where('source_type', Medication::class)
        ->where('source_id', $medicationId)
        ->get();

    expect($reminders)->toHaveCount(1);
    expect($reminders->first()->due_date->toDateString())->toBe($newEndDate);
});
