<?php

declare(strict_types=1);

use App\Enums\ReminderStatus;
use App\Enums\ReminderType;
use App\Enums\VisitType;
use App\Models\Household;
use App\Models\Pet;
use App\Models\Reminder;
use App\Models\User;
use App\Models\VetVisit;
use Spatie\Permission\Models\Role;

/**
 * @return array{0: User, 1: Household}
 */
function createDashboardOwner(): array
{
    $household = Household::factory()->create();
    $user = User::factory()->create(['current_household_id' => $household->id]);

    setPermissionsTeamId($household->id);

    Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
    $user->assignRole('owner');

    return [$user, $household];
}

it('returns dashboard summary for authenticated user', function () {
    [$owner, $household] = createDashboardOwner();

    $pet1 = Pet::factory()->create(['household_id' => $household->id]);
    $pet2 = Pet::factory()->create(['household_id' => $household->id]);

    // 3 pending reminders with future due dates
    foreach (range(1, 3) as $i) {
        Reminder::query()->withoutGlobalScopes()->create([
            'household_id' => $household->id,
            'pet_id' => $pet1->id,
            'type' => ReminderType::Vaccination,
            'title' => "Reminder {$i}",
            'due_date' => now()->addDays($i)->toDateString(),
            'is_recurring' => false,
            'status' => ReminderStatus::Pending,
        ]);
    }

    // 2 vet visits this year
    foreach (range(1, 2) as $i) {
        VetVisit::withoutGlobalScopes()->create([
            'pet_id' => $pet1->id,
            'visit_date' => now()->subDays($i)->toDateString(),
            'visit_type' => VisitType::Checkup->value,
            'reason' => "Visit {$i}",
        ]);
    }

    $response = $this->actingAs($owner)->getJson('/api/dashboard/summary');

    $response->assertSuccessful();
    $response->assertJsonPath('data.petSummaries', fn ($v) => is_array($v) && count($v) === 2);
    $response->assertJsonPath('data.upcomingReminders.count', 3);
    $response->assertJsonPath('data.upcomingReminders.items', fn ($v) => is_array($v) && count($v) <= 4);
    $response->assertJsonPath('data.vetVisitStats.countThisYear', 2);
    $response->assertJsonStructure([
        'data' => [
            'stockStatus' => ['totalOpenItems', 'lowCount', 'criticalCount', 'worstItem'],
            'monthlySpend' => ['currentMonth', 'previousMonth', 'changePercent'],
        ],
    ]);
});

it('filters dashboard summary by pet', function () {
    [$owner, $household] = createDashboardOwner();

    $pet1 = Pet::factory()->create(['household_id' => $household->id]);
    $pet2 = Pet::factory()->create(['household_id' => $household->id]);

    Reminder::query()->withoutGlobalScopes()->create([
        'household_id' => $household->id,
        'pet_id' => $pet1->id,
        'type' => ReminderType::Vaccination,
        'title' => 'Pet 1 reminder',
        'due_date' => now()->addDays(3)->toDateString(),
        'is_recurring' => false,
        'status' => ReminderStatus::Pending,
    ]);

    Reminder::query()->withoutGlobalScopes()->create([
        'household_id' => $household->id,
        'pet_id' => $pet2->id,
        'type' => ReminderType::Medication,
        'title' => 'Pet 2 reminder',
        'due_date' => now()->addDays(5)->toDateString(),
        'is_recurring' => false,
        'status' => ReminderStatus::Pending,
    ]);

    $response = $this->actingAs($owner)->getJson("/api/dashboard/summary?filter[pet]={$pet1->id}");

    $response->assertSuccessful();
    $response->assertJsonPath('data.petSummaries', fn ($v) => is_array($v) && count($v) === 1);
    $response->assertJsonPath('data.upcomingReminders.count', 1);
});

it('returns 401 for unauthenticated request to dashboard', function () {
    $this->getJson('/api/dashboard/summary')->assertUnauthorized();
});

it('scopes dashboard data to current household', function () {
    // Household 1 — has a pet
    [$owner1, $household1] = createDashboardOwner();
    Pet::factory()->create(['household_id' => $household1->id]);

    // Household 2 — no pets
    $household2 = Household::factory()->create();
    $owner2 = User::factory()->create(['current_household_id' => $household2->id]);

    setPermissionsTeamId($household2->id);
    Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
    $owner2->assignRole('owner');

    $response = $this->actingAs($owner2)->getJson('/api/dashboard/summary');

    $response->assertSuccessful();
    $response->assertJsonPath('data.petSummaries', []);
});
