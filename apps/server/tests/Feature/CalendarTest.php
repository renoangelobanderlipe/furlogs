<?php

declare(strict_types=1);

use App\Enums\ReminderStatus;
use App\Enums\ReminderType;
use App\Enums\VisitType;
use App\Models\Household;
use App\Models\Pet;
use App\Models\Reminder;
use App\Models\User;
use App\Models\Vaccination;
use App\Models\VetVisit;
use Spatie\Permission\Models\Role;

/**
 * @return array{0: User, 1: Household}
 */
function createCalendarOwner(): array
{
    $household = Household::factory()->create();
    $user = User::factory()->create(['current_household_id' => $household->id]);

    setPermissionsTeamId($household->id);

    Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
    $user->assignRole('owner');

    return [$user, $household];
}

it('returns calendar events in date range', function () {
    [$owner, $household] = createCalendarOwner();

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $rangeStart = now()->startOfMonth()->toDateString();
    $rangeEnd = now()->startOfMonth()->addDays(27)->toDateString();
    $inRange = now()->startOfMonth()->addDays(5)->toDateString();

    // Vet visit in range
    VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'visit_date' => $inRange,
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'In-range checkup',
    ]);

    // Vaccination with next_due_date in range
    Vaccination::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'vaccine_name' => 'Rabies',
        'administered_date' => now()->subYear()->toDateString(),
        'next_due_date' => $inRange,
    ]);

    // Medication reminder in range
    Reminder::query()->withoutGlobalScopes()->create([
        'household_id' => $household->id,
        'pet_id' => $pet->id,
        'type' => ReminderType::Medication,
        'title' => 'Flea treatment',
        'due_date' => $inRange,
        'is_recurring' => false,
        'status' => ReminderStatus::Pending,
    ]);

    $response = $this->actingAs($owner)->getJson(
        "/api/calendar/events?start={$rangeStart}&end={$rangeEnd}",
    );

    $response->assertSuccessful();

    $data = collect($response->json('data'));

    expect($data->where('type', 'vet_visit')->count())->toBe(1);
    expect($data->where('type', 'vaccination')->count())->toBe(1);
    expect($data->where('type', 'medication')->count())->toBe(1);
});

it('excludes events outside date range', function () {
    [$owner, $household] = createCalendarOwner();

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    // Vet visit outside the query range
    VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'visit_date' => now()->subYear()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Old visit',
    ]);

    $rangeStart = now()->startOfMonth()->toDateString();
    $rangeEnd = now()->startOfMonth()->addDays(27)->toDateString();

    $response = $this->actingAs($owner)->getJson(
        "/api/calendar/events?start={$rangeStart}&end={$rangeEnd}",
    );

    $response->assertSuccessful();

    $data = collect($response->json('data'));
    expect($data->where('type', 'vet_visit')->count())->toBe(0);
});

it('validates date range is required for calendar events', function () {
    [$owner] = createCalendarOwner();

    $this->actingAs($owner)->getJson('/api/calendar/events')->assertUnprocessable();
});

it('returns 401 for unauthenticated request to calendar events', function () {
    $start = now()->startOfMonth()->toDateString();
    $end = now()->endOfMonth()->toDateString();

    $this->getJson("/api/calendar/events?start={$start}&end={$end}")->assertUnauthorized();
});
