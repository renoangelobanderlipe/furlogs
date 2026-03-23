<?php

declare(strict_types=1);

use App\Models\Household;
use App\Models\VetClinic;

it('unauthenticated user cannot list vet clinics', function () {
    $response = $this->getJson('/api/vet-clinics');

    $response->assertUnauthorized();
});

it('can list vet clinics for authenticated user', function () {
    [$owner, $household] = createOwnerWithHousehold();

    VetClinic::factory()->count(3)->create(['household_id' => $household->id]);

    $response = $this->actingAs($owner)->getJson('/api/vet-clinics');

    $response->assertOk();
    $response->assertJsonCount(3, 'data');
});

it('cannot see vet clinics from another household', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $otherHousehold = Household::factory()->create();
    VetClinic::factory()->create(['household_id' => $otherHousehold->id]);

    VetClinic::factory()->count(2)->create(['household_id' => $household->id]);

    $response = $this->actingAs($owner)->getJson('/api/vet-clinics');

    $response->assertOk();
    $response->assertJsonCount(2, 'data');
});

it('can create a vet clinic', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $payload = [
        'name' => 'Happy Paws Clinic',
        'address' => '123 Pet Street',
        'phone' => '555-0100',
        'notes' => 'Open on weekends.',
    ];

    $response = $this->actingAs($owner)->postJson('/api/vet-clinics', $payload);

    $response->assertCreated();
    $this->assertDatabaseHas('vet_clinics', [
        'name' => 'Happy Paws Clinic',
        'household_id' => $household->id,
    ]);
});

it('validates vet clinic data on create', function () {
    [$owner] = createOwnerWithHousehold();

    $response = $this->actingAs($owner)->postJson('/api/vet-clinics', []);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['name']);
});

it('can update a vet clinic', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $clinic = VetClinic::factory()->create(['household_id' => $household->id]);

    $response = $this->actingAs($owner)->patchJson("/api/vet-clinics/{$clinic->id}", [
        'name' => 'Updated Clinic Name',
    ]);

    $response->assertOk();
    $this->assertDatabaseHas('vet_clinics', ['id' => $clinic->id, 'name' => 'Updated Clinic Name']);
});

it('can delete a vet clinic', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $clinic = VetClinic::factory()->create(['household_id' => $household->id]);

    $response = $this->actingAs($owner)->deleteJson("/api/vet-clinics/{$clinic->id}");

    $response->assertNoContent();
    $this->assertDatabaseMissing('vet_clinics', ['id' => $clinic->id]);
});
