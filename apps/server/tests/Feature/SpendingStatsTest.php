<?php

declare(strict_types=1);

use App\Enums\VisitType;
use App\Models\FoodProduct;
use App\Models\FoodStockItem;
use App\Models\Household;
use App\Models\Pet;
use App\Models\VetVisit;

// ─── Auth ────────────────────────────────────────────────────────────────────

it('returns 401 for guests', function () {
    $this->getJson('/api/spending/stats')->assertUnauthorized();
});

// ─── Happy path ───────────────────────────────────────────────────────────────

it('returns correct YTD totals for vet and food spending', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    // Vet visit in the current year with a known cost
    VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Annual checkup',
        'cost' => '120.00',
    ]);

    $product = FoodProduct::factory()->create(['household_id' => $household->id]);

    // Food stock item with a known purchase cost
    FoodStockItem::factory()->create([
        'food_product_id' => $product->id,
        'purchased_at' => now()->toDateString(),
        'purchase_cost' => '45.00',
    ]);

    $response = $this->actingAs($owner)->getJson('/api/spending/stats');

    $response->assertOk();
    expect($response->json('data.vetYtdSpend'))->toEqual(120.0);
    expect($response->json('data.foodYtdSpend'))->toEqual(45.0);
    expect($response->json('data.totalYtdSpend'))->toEqual(165.0);
});

// ─── Monthly array shape ──────────────────────────────────────────────────────

it('always returns 12 months in the monthly array', function () {
    [$owner] = createOwnerWithHousehold();

    $response = $this->actingAs($owner)->getJson('/api/spending/stats');

    $response->assertOk();
    $response->assertJsonCount(12, 'data.monthly');

    // Each entry has the expected keys
    $first = $response->json('data.monthly.0');
    expect($first)->toHaveKeys(['month', 'vet', 'food']);
    expect($first['month'])->toBe(1);
});

// ─── Household isolation ──────────────────────────────────────────────────────

it('does not include other households spending data', function () {
    [$owner, $household] = createOwnerWithHousehold();

    // Our household — one vet visit
    $pet = Pet::factory()->create(['household_id' => $household->id]);
    VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Our visit',
        'cost' => '100.00',
    ]);

    // Foreign household — vet visit and food stock
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
        'reason' => 'Foreign visit',
        'cost' => '999.00',
    ]);

    $foreignProduct = FoodProduct::withoutGlobalScopes()->create([
        'household_id' => $otherHousehold->id,
        'name' => 'Foreign Food',
        'type' => 'dry',
        'unit_type' => 'kg',
        'alert_threshold_pct' => 25,
    ]);
    FoodStockItem::withoutGlobalScopes()->create([
        'food_product_id' => $foreignProduct->id,
        'status' => 'sealed',
        'purchased_at' => now()->toDateString(),
        'purchase_cost' => '999.00',
        'quantity' => 1,
    ]);

    $response = $this->actingAs($owner)->getJson('/api/spending/stats');

    $response->assertOk();
    // Only our household's vet visit cost should appear
    expect($response->json('data.vetYtdSpend'))->toEqual(100.0);
    expect($response->json('data.foodYtdSpend'))->toEqual(0.0);
});

// ─── Year filter ──────────────────────────────────────────────────────────────

it('filters spending to the requested year', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $currentYear = (int) now()->year;
    $previousYear = $currentYear - 1;

    // Visit in the current year
    VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'This year',
        'cost' => '200.00',
    ]);

    // Visit in the previous year
    VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'visit_date' => now()->subYear()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Last year',
        'cost' => '300.00',
    ]);

    // Query for current year — only 200 should appear
    $currentYearResponse = $this->actingAs($owner)
        ->getJson("/api/spending/stats?year={$currentYear}");

    $currentYearResponse->assertOk();
    $currentYearResponse->assertJsonPath('data.year', $currentYear);
    expect($currentYearResponse->json('data.vetYtdSpend'))->toEqual(200.0);

    // Query for previous year — only 300 should appear
    $previousYearResponse = $this->actingAs($owner)
        ->getJson("/api/spending/stats?year={$previousYear}");

    $previousYearResponse->assertOk();
    $previousYearResponse->assertJsonPath('data.year', $previousYear);
    expect($previousYearResponse->json('data.vetYtdSpend'))->toEqual(300.0);
});

// ─── Zero spend ───────────────────────────────────────────────────────────────

it('returns zero totals when no spending exists for the year', function () {
    [$owner] = createOwnerWithHousehold();

    $response = $this->actingAs($owner)->getJson('/api/spending/stats');

    $response->assertOk();
    expect($response->json('data.vetYtdSpend'))->toEqual(0.0);
    expect($response->json('data.foodYtdSpend'))->toEqual(0.0);
    expect($response->json('data.totalYtdSpend'))->toEqual(0.0);
});
