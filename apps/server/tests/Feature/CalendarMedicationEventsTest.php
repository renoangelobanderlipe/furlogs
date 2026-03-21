<?php

declare(strict_types=1);

use App\Enums\FrequencyType;
use App\Models\Household;
use App\Models\Medication;
use App\Models\Pet;
use App\Models\User;
use Spatie\Permission\Models\Role;

/**
 * @return array{0: User, 1: Household}
 */
function createCalendarMedOwner(): array
{
    $household = Household::factory()->create();
    $user = User::factory()->create(['current_household_id' => $household->id]);

    setPermissionsTeamId($household->id);
    Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
    $user->assignRole('owner');

    return [$user, $household];
}

it('active medication produces one event per day in range', function () {
    [$owner, $household] = createCalendarMedOwner();

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

    $events = collect($response->json('data'))->where('type', 'medication_schedule');
    // 3 days: start, start+1, start+2
    expect($events->count())->toBe(3);
});

it('medication ending before range start is excluded', function () {
    [$owner, $household] = createCalendarMedOwner();

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

    $events = collect($response->json('data'))->where('type', 'medication_schedule');
    expect($events->count())->toBe(0);
});

it('medication with no end_date continues to end of range', function () {
    [$owner, $household] = createCalendarMedOwner();

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

    $events = collect($response->json('data'))->where('type', 'medication_schedule');
    // 5 days: today through today+4
    expect($events->count())->toBe(5);
});

it('medication schedule events have type medication_schedule and color #ff9800', function () {
    [$owner, $household] = createCalendarMedOwner();

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
    $event = collect($data)->where('type', 'medication_schedule')->first();

    expect($event)->not->toBeNull();
    expect($event['type'])->toBe('medication_schedule');
    expect($event['color'])->toBe('#ff9800');
});
