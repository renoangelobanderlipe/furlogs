<?php

declare(strict_types=1);

use App\Models\Household;
use App\Models\Pet;
use App\Models\PetWeight;

// DELETE /api/pets/{pet}/weights/{weight}

it('owner can delete a pet weight', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $pet = Pet::factory()->create(['household_id' => $household->id]);
    $weight = PetWeight::factory()->create([
        'pet_id' => $pet->id,
        'weight_kg' => 10.5,
        'recorded_at' => now()->toDateString(),
    ]);

    $this->actingAs($owner)
        ->deleteJson("/api/pets/{$pet->id}/weights/{$weight->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('pet_weights', ['id' => $weight->id]);
});

it('member can also delete a pet weight', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $member = createMemberWithHousehold($household);

    $pet = Pet::factory()->create(['household_id' => $household->id]);
    $weight = PetWeight::factory()->create([
        'pet_id' => $pet->id,
        'weight_kg' => 8.0,
        'recorded_at' => now()->toDateString(),
    ]);

    $this->actingAs($member)
        ->deleteJson("/api/pets/{$pet->id}/weights/{$weight->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('pet_weights', ['id' => $weight->id]);
});

it('returns 404 when trying to delete a weight belonging to another household', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $otherHousehold = Household::factory()->create();
    $otherPet = Pet::withoutGlobalScopes()->create([
        'household_id' => $otherHousehold->id,
        'name' => 'OtherPet',
        'species' => 'dog',
        'sex' => 'male',
        'is_neutered' => false,
    ]);
    $weight = PetWeight::factory()->create([
        'pet_id' => $otherPet->id,
        'weight_kg' => 7.0,
        'recorded_at' => now()->toDateString(),
    ]);

    // Pet is in another household — route model binding hides it via global scope → 404
    $this->actingAs($owner)
        ->deleteJson("/api/pets/{$otherPet->id}/weights/{$weight->id}")
        ->assertNotFound();
});

it('requires authentication to delete a weight', function () {
    $pet = Pet::withoutGlobalScopes()->create([
        'household_id' => Household::factory()->create()->id,
        'name' => 'TestPet',
        'species' => 'dog',
        'sex' => 'male',
        'is_neutered' => false,
    ]);
    $weight = PetWeight::factory()->create([
        'pet_id' => $pet->id,
        'weight_kg' => 9.0,
        'recorded_at' => now()->toDateString(),
    ]);

    $this->deleteJson("/api/pets/{$pet->id}/weights/{$weight->id}")
        ->assertUnauthorized();
});
