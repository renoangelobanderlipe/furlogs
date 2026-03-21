<?php

declare(strict_types=1);

use App\Enums\FrequencyType;
use App\Models\Household;
use App\Models\Medication;
use App\Models\MedicationAdministration;
use App\Models\Pet;
use App\Models\User;
use App\Services\MedicationService;

/**
 * @return array{0: Medication, 1: User}
 */
function createStreakMedication(FrequencyType $frequency = FrequencyType::Daily): array
{
    $household = Household::factory()->create();
    $user = User::factory()->create(['current_household_id' => $household->id]);
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $medication = Medication::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'name' => 'Test Med',
        'start_date' => now()->subDays(30)->toDateString(),
        'frequency' => $frequency->value,
    ]);

    return [$medication, $user];
}

it('returns 0 for as_needed frequency', function () {
    [$medication] = createStreakMedication(FrequencyType::AsNeeded);

    $service = app(MedicationService::class);
    expect($service->calculateStreak($medication))->toBe(0);
});

it('returns 0 when no administrations exist', function () {
    [$medication] = createStreakMedication(FrequencyType::Daily);

    $service = app(MedicationService::class);
    expect($service->calculateStreak($medication))->toBe(0);
});

it('returns 1 after one dose today for daily frequency', function () {
    [$medication] = createStreakMedication(FrequencyType::Daily);

    MedicationAdministration::withoutGlobalScopes()->create([
        'medication_id' => $medication->id,
        'administered_at' => now(),
    ]);

    $service = app(MedicationService::class);
    expect($service->calculateStreak($medication))->toBe(1);
});

it('increments streak for consecutive days', function () {
    [$medication] = createStreakMedication(FrequencyType::Daily);

    foreach (range(0, 2) as $daysAgo) {
        MedicationAdministration::withoutGlobalScopes()->create([
            'medication_id' => $medication->id,
            'administered_at' => now()->subDays($daysAgo),
        ]);
    }

    $service = app(MedicationService::class);
    expect($service->calculateStreak($medication))->toBe(3);
});

it('resets when yesterday had 0 doses', function () {
    [$medication] = createStreakMedication(FrequencyType::Daily);

    // Today and 2 days ago, but NOT yesterday
    MedicationAdministration::withoutGlobalScopes()->create([
        'medication_id' => $medication->id,
        'administered_at' => now(),
    ]);
    MedicationAdministration::withoutGlobalScopes()->create([
        'medication_id' => $medication->id,
        'administered_at' => now()->subDays(2),
    ]);

    $service = app(MedicationService::class);
    // Today counts, but yesterday breaks the chain so streak = 1
    expect($service->calculateStreak($medication))->toBe(1);
});

it('twice_daily requires 2 administrations to count the day', function () {
    [$medication] = createStreakMedication(FrequencyType::TwiceDaily);

    // Only 1 dose today — should not count
    MedicationAdministration::withoutGlobalScopes()->create([
        'medication_id' => $medication->id,
        'administered_at' => now()->setTime(8, 0),
    ]);

    $service = app(MedicationService::class);
    expect($service->calculateStreak($medication))->toBe(0);

    // Add second dose today — now it counts
    MedicationAdministration::withoutGlobalScopes()->create([
        'medication_id' => $medication->id,
        'administered_at' => now()->setTime(20, 0),
    ]);

    expect($service->calculateStreak($medication))->toBe(1);
});

it('today with 0 doses does not break a prior streak', function () {
    [$medication] = createStreakMedication(FrequencyType::Daily);

    // Doses only for yesterday and the day before
    foreach (range(1, 2) as $daysAgo) {
        MedicationAdministration::withoutGlobalScopes()->create([
            'medication_id' => $medication->id,
            'administered_at' => now()->subDays($daysAgo),
        ]);
    }

    $service = app(MedicationService::class);
    // Today has no dose but skip-today logic means streak = 2
    expect($service->calculateStreak($medication))->toBe(2);
});
