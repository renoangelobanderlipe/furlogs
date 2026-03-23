<?php

declare(strict_types=1);

use App\Models\Household;
use App\Models\Pet;
use App\Models\Reminder;
use App\Models\Vaccination;

it('creating a vaccination with next_due_date auto-creates a reminder', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $response = $this->actingAs($owner)->postJson('/api/vaccinations', [
        'pet_id' => $pet->id,
        'vaccine_name' => 'Rabies',
        'administered_date' => now()->toDateString(),
        'next_due_date' => now()->addYear()->toDateString(),
    ]);

    $response->assertCreated();

    $this->assertDatabaseHas('reminders', [
        'household_id' => $household->id,
        'pet_id' => $pet->id,
        'type' => 'vaccination',
        'source_type' => Vaccination::class,
    ]);
});

it('creating a vaccination without next_due_date does NOT create a reminder', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $response = $this->actingAs($owner)->postJson('/api/vaccinations', [
        'pet_id' => $pet->id,
        'vaccine_name' => 'Bordetella',
        'administered_date' => now()->toDateString(),
    ]);

    $response->assertCreated();

    expect(Reminder::withoutGlobalScopes()->where('type', 'vaccination')->count())->toBe(0);
});

it('can list vaccinations scoped to the authenticated user household', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    Vaccination::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'vaccine_name' => 'DHPP',
        'administered_date' => now()->toDateString(),
    ]);

    // Vaccination in another household
    $otherHousehold = Household::factory()->create();
    $otherPet = Pet::withoutGlobalScopes()->create([
        'household_id' => $otherHousehold->id,
        'name' => 'OtherPet',
        'species' => 'dog',
        'sex' => 'male',
        'is_neutered' => false,
    ]);
    Vaccination::withoutGlobalScopes()->create([
        'pet_id' => $otherPet->id,
        'vaccine_name' => 'Lyme',
        'administered_date' => now()->toDateString(),
    ]);

    $response = $this->actingAs($owner)->getJson('/api/vaccinations');

    $response->assertOk();
    $response->assertJsonCount(1, 'data');
});

it('cannot view vaccination from another household', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $otherHousehold = Household::factory()->create();
    $otherPet = Pet::withoutGlobalScopes()->create([
        'household_id' => $otherHousehold->id,
        'name' => 'OtherPet',
        'species' => 'dog',
        'sex' => 'male',
        'is_neutered' => false,
    ]);
    $vaccination = Vaccination::withoutGlobalScopes()->create([
        'pet_id' => $otherPet->id,
        'vaccine_name' => 'Rabies',
        'administered_date' => now()->toDateString(),
    ]);

    $response = $this->actingAs($owner)->getJson("/api/vaccinations/{$vaccination->id}");

    $response->assertNotFound();
});

it('only owner can delete a vaccination', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $member = createMemberWithHousehold($household);
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $vaccination = Vaccination::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'vaccine_name' => 'Rabies',
        'administered_date' => now()->toDateString(),
    ]);

    $this->actingAs($member)->deleteJson("/api/vaccinations/{$vaccination->id}")->assertForbidden();
    $this->actingAs($owner)->deleteJson("/api/vaccinations/{$vaccination->id}")->assertNoContent();

    $this->assertSoftDeleted('vaccinations', ['id' => $vaccination->id]);
});

it('validates required fields on store vaccination', function () {
    [$owner] = createOwnerWithHousehold();

    $response = $this->actingAs($owner)->postJson('/api/vaccinations', []);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['pet_id', 'vaccine_name', 'administered_date']);
});

it('updating next_due_date deletes the old reminder and creates a new one', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    // Create with an initial next_due_date — seeds one reminder
    $response = $this->actingAs($owner)->postJson('/api/vaccinations', [
        'pet_id' => $pet->id,
        'vaccine_name' => 'Rabies',
        'administered_date' => now()->toDateString(),
        'next_due_date' => now()->addYear()->toDateString(),
    ]);
    $response->assertCreated();
    $vaccinationId = $response->json('data.id');

    expect(Reminder::withoutGlobalScopes()
        ->where('source_type', Vaccination::class)
        ->where('source_id', $vaccinationId)
        ->count(),
    )->toBe(1);

    $newDueDate = now()->addYears(2)->toDateString();

    $this->actingAs($owner)->patchJson("/api/vaccinations/{$vaccinationId}", [
        'next_due_date' => $newDueDate,
    ])->assertOk();

    $reminders = Reminder::withoutGlobalScopes()
        ->where('source_type', Vaccination::class)
        ->where('source_id', $vaccinationId)
        ->get();

    expect($reminders)->toHaveCount(1);
    expect($reminders->first()->due_date->toDateString())->toBe($newDueDate);
});

it('clearing next_due_date deletes the reminder without creating a replacement', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $response = $this->actingAs($owner)->postJson('/api/vaccinations', [
        'pet_id' => $pet->id,
        'vaccine_name' => 'Bordetella',
        'administered_date' => now()->toDateString(),
        'next_due_date' => now()->addYear()->toDateString(),
    ]);
    $response->assertCreated();
    $vaccinationId = $response->json('data.id');

    expect(Reminder::withoutGlobalScopes()
        ->where('source_type', Vaccination::class)
        ->where('source_id', $vaccinationId)
        ->count(),
    )->toBe(1);

    $this->actingAs($owner)->patchJson("/api/vaccinations/{$vaccinationId}", [
        'next_due_date' => null,
    ])->assertOk();

    expect(Reminder::withoutGlobalScopes()
        ->where('source_type', Vaccination::class)
        ->where('source_id', $vaccinationId)
        ->count(),
    )->toBe(0);
});
