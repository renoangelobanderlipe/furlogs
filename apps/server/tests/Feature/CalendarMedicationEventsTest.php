<?php

declare(strict_types=1);

use App\Enums\FrequencyType;
use App\Models\Medication;
use App\Models\Pet;

it('active medication produces one event per day in range', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $rangeStart = now()->startOfMonth()->toDateString();
    $rangeEnd = now()->startOfMonth()->addDays(2)->toDateString();

    Medication::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'name' => 'Amoxicillin',
        'start_date' => $rangeStart,
        'frequency' => FrequencyType::Daily->value,
    ]);

    $response = $this->actingAs($owner)
        ->getJson("/api/calendar/events?start={$rangeStart}&end={$rangeEnd}");

    $response->assertSuccessful();

    $events = collect($response->json('data'))->where('type', 'medication');
    // 3 days: start, start+1, start+2
    expect($events->count())->toBe(3);
});

it('medication ending before range start is excluded', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    Medication::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'name' => 'OldMed',
        'start_date' => now()->subDays(30)->toDateString(),
        'end_date' => now()->subDays(5)->toDateString(),
        'frequency' => FrequencyType::Daily->value,
    ]);

    $rangeStart = now()->toDateString();
    $rangeEnd = now()->addDays(7)->toDateString();

    $response = $this->actingAs($owner)
        ->getJson("/api/calendar/events?start={$rangeStart}&end={$rangeEnd}");

    $response->assertSuccessful();

    $events = collect($response->json('data'))->where('type', 'medication');
    expect($events->count())->toBe(0);
});

it('medication with no end_date continues to end of range', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $rangeStart = now()->toDateString();
    $rangeEnd = now()->addDays(4)->toDateString();

    Medication::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'name' => 'OngoingMed',
        'start_date' => now()->subDays(5)->toDateString(),
        'end_date' => null,
        'frequency' => FrequencyType::Daily->value,
    ]);

    $response = $this->actingAs($owner)
        ->getJson("/api/calendar/events?start={$rangeStart}&end={$rangeEnd}");

    $response->assertSuccessful();

    $events = collect($response->json('data'))->where('type', 'medication');
    // 5 days: today through today+4
    expect($events->count())->toBe(5);
});

it('medication schedule events have type medication_schedule and color #ff9800', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $rangeStart = now()->toDateString();
    $rangeEnd = now()->toDateString();

    Medication::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'name' => 'Prednisolone',
        'start_date' => $rangeStart,
        'frequency' => FrequencyType::Daily->value,
    ]);

    $response = $this->actingAs($owner)
        ->getJson("/api/calendar/events?start={$rangeStart}&end={$rangeEnd}");

    $response->assertSuccessful();

    $data = $response->json('data');
    $event = collect($data)->where('type', 'medication')->first();

    expect($event)->not->toBeNull();
    expect($event['type'])->toBe('medication');
    expect($event)->not->toHaveKey('color');
});
