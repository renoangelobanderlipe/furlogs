<?php

declare(strict_types=1);

use App\Enums\VisitType;
use App\Models\Household;
use App\Models\Pet;
use App\Models\VetVisit;

// GET /api/vet-visits/stats

it('returns stats scoped to household', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Annual check',
        'cost' => '75.00',
    ]);

    // Visit in another household — must NOT appear in stats
    $otherHousehold = Household::factory()->create();
    $otherPet = Pet::withoutGlobalScopes()->create([
        'household_id' => $otherHousehold->id,
        'name' => 'ForeignPet',
        'species' => 'dog',
        'sex' => 'male',
        'is_neutered' => false,
    ]);
    VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $otherPet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Other household',
        'cost' => '500.00',
    ]);

    $response = $this->actingAs($owner)->getJson('/api/vet-visits/stats');

    $response->assertOk();
    expect($response->json('data.ytdVisits'))->toBe(1);
    expect((float) $response->json('data.ytdSpend'))->toBe(75.0);
});

it('returns zero stats when household has no visits', function () {
    [$owner] = createOwnerWithHousehold();

    $response = $this->actingAs($owner)->getJson('/api/vet-visits/stats');

    $response->assertOk();
    expect($response->json('data.ytdVisits'))->toBe(0);
    expect((float) $response->json('data.ytdSpend'))->toBe(0.0);
});

it('returns 401 for guest', function () {
    $this->getJson('/api/vet-visits/stats')->assertUnauthorized();
});
