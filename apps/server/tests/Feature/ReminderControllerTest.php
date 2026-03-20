<?php

declare(strict_types=1);

use App\Enums\ReminderStatus;
use App\Enums\ReminderType;
use App\Models\Household;
use App\Models\Pet;
use App\Models\Reminder;
use App\Models\User;
use Spatie\Permission\Models\Role;

/**
 * @return array{0: User, 1: Household}
 */
function createReminderOwner(): array
{
    $household = Household::factory()->create();
    $user = User::factory()->create(['current_household_id' => $household->id]);

    setPermissionsTeamId($household->id);

    Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
    $user->assignRole('owner');

    return [$user, $household];
}

function createReminderMember(Household $household): User
{
    $user = User::factory()->create(['current_household_id' => $household->id]);

    setPermissionsTeamId($household->id);

    Role::firstOrCreate(['name' => 'member', 'guard_name' => 'web']);
    $user->assignRole('member');

    return $user;
}

it('can list reminders scoped to authenticated user household', function () {
    [$owner, $household] = createReminderOwner();

    Reminder::query()->withoutGlobalScopes()->create([
        'household_id' => $household->id,
        'type' => ReminderType::Vaccination,
        'title' => 'My reminder',
        'due_date' => now()->addDays(5)->toDateString(),
        'is_recurring' => false,
        'status' => ReminderStatus::Pending,
    ]);

    $otherHousehold = Household::factory()->create();
    Reminder::query()->withoutGlobalScopes()->create([
        'household_id' => $otherHousehold->id,
        'type' => ReminderType::Vaccination,
        'title' => 'Other household reminder',
        'due_date' => now()->addDays(5)->toDateString(),
        'is_recurring' => false,
        'status' => ReminderStatus::Pending,
    ]);

    $response = $this->actingAs($owner)->getJson('/api/reminders');

    $response->assertOk();
    $response->assertJsonCount(1, 'data');
});

it('can create a reminder', function () {
    [$owner, $household] = createReminderOwner();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $response = $this->actingAs($owner)->postJson('/api/reminders', [
        'pet_id' => $pet->id,
        'type' => 'vaccination',
        'title' => 'Rabies booster',
        'due_date' => now()->addMonths(3)->toDateString(),
        'is_recurring' => false,
    ]);

    $response->assertStatus(201);
    $response->assertJsonPath('data.attributes.reminderType', 'vaccination');
});

it('validates required fields on store reminder', function () {
    [$owner] = createReminderOwner();

    $response = $this->actingAs($owner)->postJson('/api/reminders', []);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['type', 'title', 'due_date']);
});

it('cannot view reminder from another household', function () {
    [$owner] = createReminderOwner();

    $otherHousehold = Household::factory()->create();
    $reminder = Reminder::query()->withoutGlobalScopes()->create([
        'household_id' => $otherHousehold->id,
        'type' => ReminderType::Vaccination,
        'title' => 'Other reminder',
        'due_date' => now()->addDays(5)->toDateString(),
        'is_recurring' => false,
        'status' => ReminderStatus::Pending,
    ]);

    $response = $this->actingAs($owner)->getJson("/api/reminders/{$reminder->id}");

    $response->assertNotFound();
});

it('only owner can delete a reminder', function () {
    [$owner, $household] = createReminderOwner();
    $member = createReminderMember($household);

    $reminder = Reminder::query()->withoutGlobalScopes()->create([
        'household_id' => $household->id,
        'type' => ReminderType::Vaccination,
        'title' => 'Delete me',
        'due_date' => now()->addDays(5)->toDateString(),
        'is_recurring' => false,
        'status' => ReminderStatus::Pending,
    ]);

    $this->actingAs($member)->deleteJson("/api/reminders/{$reminder->id}")->assertForbidden();
    $this->actingAs($owner)->deleteJson("/api/reminders/{$reminder->id}")->assertNoContent();
});

it('can complete a reminder', function () {
    [$owner, $household] = createReminderOwner();

    $reminder = Reminder::query()->withoutGlobalScopes()->create([
        'household_id' => $household->id,
        'type' => ReminderType::Medication,
        'title' => 'Flea treatment',
        'due_date' => now()->addDays(2)->toDateString(),
        'is_recurring' => false,
        'status' => ReminderStatus::Pending,
    ]);

    $response = $this->actingAs($owner)->patchJson("/api/reminders/{$reminder->id}/complete");

    $response->assertOk();
    $response->assertJsonPath('data.attributes.status', 'completed');
});

it('can snooze a reminder', function () {
    [$owner, $household] = createReminderOwner();

    $dueDate = now()->addDays(1)->toDateString();
    $reminder = Reminder::query()->withoutGlobalScopes()->create([
        'household_id' => $household->id,
        'type' => ReminderType::Medication,
        'title' => 'Snooze me',
        'due_date' => $dueDate,
        'is_recurring' => false,
        'status' => ReminderStatus::Pending,
    ]);

    $response = $this->actingAs($owner)->patchJson("/api/reminders/{$reminder->id}/snooze", ['days' => 7]);

    $response->assertOk();

    $reminder->refresh();
    expect($reminder->due_date->toDateString())->toBe(now()->addDays(1 + 7)->toDateString());
});

it('can dismiss a reminder', function () {
    [$owner, $household] = createReminderOwner();

    $reminder = Reminder::query()->withoutGlobalScopes()->create([
        'household_id' => $household->id,
        'type' => ReminderType::Custom,
        'title' => 'Dismiss me',
        'due_date' => now()->addDays(3)->toDateString(),
        'is_recurring' => false,
        'status' => ReminderStatus::Pending,
    ]);

    $response = $this->actingAs($owner)->patchJson("/api/reminders/{$reminder->id}/dismiss");

    $response->assertOk();
    $response->assertJsonPath('data.attributes.status', 'dismissed');
});

it('member can complete a reminder', function () {
    [$owner, $household] = createReminderOwner();
    $member = createReminderMember($household);

    $reminder = Reminder::query()->withoutGlobalScopes()->create([
        'household_id' => $household->id,
        'type' => ReminderType::Vaccination,
        'title' => 'Member completes',
        'due_date' => now()->addDays(3)->toDateString(),
        'is_recurring' => false,
        'status' => ReminderStatus::Pending,
    ]);

    $this->actingAs($member)->patchJson("/api/reminders/{$reminder->id}/complete")->assertOk();
});
