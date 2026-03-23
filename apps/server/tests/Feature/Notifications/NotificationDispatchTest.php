<?php

declare(strict_types=1);

use App\Actions\FoodStock\CheckStockAlerts;
use App\Enums\FoodType;
use App\Enums\ReminderStatus;
use App\Enums\ReminderType;
use App\Enums\StockStatus;
use App\Enums\UnitType;
use App\Models\FoodConsumptionRate;
use App\Models\FoodProduct;
use App\Models\FoodStockItem;
use App\Models\Pet;
use App\Models\Reminder;
use App\Notifications\LowStockNotification;
use App\Notifications\UpcomingVaccinationNotification;
use Illuminate\Support\Facades\Notification;

it('dispatches UpcomingVaccinationNotification when DispatchRemindersCommand runs with a pending vaccination reminder due in 3 days', function () {
    Notification::fake();

    [$user, $household] = createOwnerWithHousehold();
    $household->members()->attach($user->id, ['role' => 'owner', 'joined_at' => now()]);

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    Reminder::query()->withoutGlobalScopes()->create([
        'household_id' => $household->id,
        'pet_id' => $pet->id,
        'type' => ReminderType::Vaccination,
        'title' => 'Vaccination due: Rabies',
        'due_date' => now()->addDays(3)->toDateString(),
        'is_recurring' => false,
        'status' => ReminderStatus::Pending,
    ]);

    $this->artisan('notifications:dispatch-reminders')->assertSuccessful();

    Notification::assertSentTo($user, UpcomingVaccinationNotification::class);
});

it('dispatches LowStockNotification when CheckStockAlerts finds low stock', function () {
    Notification::fake();

    [$user, $household] = createOwnerWithHousehold();
    $household->members()->attach($user->id, ['role' => 'owner', 'joined_at' => now()]);

    $product = FoodProduct::withoutGlobalScopes()->create([
        'household_id' => $household->id,
        'name' => 'Royal Canin Adult',
        'type' => FoodType::Dry,
        'unit_type' => UnitType::Pack,
        'unit_weight_grams' => 2000,
        'alert_threshold_pct' => 40,
    ]);

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    FoodConsumptionRate::query()->create([
        'food_product_id' => $product->id,
        'pet_id' => $pet->id,
        'daily_amount_grams' => 200,
    ]);

    // Item opened 8 days ago — 8 * 200 = 1600g used, 400g left = 20% remaining (below 40% threshold = low)
    $stockItem = FoodStockItem::query()->create([
        'food_product_id' => $product->id,
        'status' => StockStatus::Open,
        'purchased_at' => now()->subDays(10)->toDateString(),
        'opened_at' => now()->subDays(8)->toDateString(),
        'quantity' => 1,
    ]);

    $action = app(CheckStockAlerts::class);
    $action();

    Notification::assertSentTo($user, LowStockNotification::class);
});

it('bulk mark-read sets read_at on all specified notifications', function () {
    [$user, $household] = createOwnerWithHousehold();

    $user->notify(new UpcomingVaccinationNotification(
        Reminder::query()->withoutGlobalScopes()->create([
            'household_id' => $household->id,
            'type' => ReminderType::Vaccination,
            'title' => 'Test reminder',
            'due_date' => now()->addDays(5)->toDateString(),
            'is_recurring' => false,
            'status' => ReminderStatus::Pending,
        ]),
        'Buddy',
    ));

    $user->notify(new UpcomingVaccinationNotification(
        Reminder::query()->withoutGlobalScopes()->create([
            'household_id' => $household->id,
            'type' => ReminderType::Vaccination,
            'title' => 'Test reminder 2',
            'due_date' => now()->addDays(6)->toDateString(),
            'is_recurring' => false,
            'status' => ReminderStatus::Pending,
        ]),
        'Max',
    ));

    expect($user->unreadNotifications()->count())->toBe(2);

    $ids = $user->notifications()->pluck('id')->toArray();

    $this->actingAs($user)
        ->postJson('/api/notifications/mark-read', ['ids' => $ids])
        ->assertOk();

    expect($user->fresh()->unreadNotifications()->count())->toBe(0);
});

it('advances recurring reminder due date after dispatch', function () {
    Notification::fake();

    [$user, $household] = createOwnerWithHousehold();
    $household->members()->attach($user->id, ['role' => 'owner', 'joined_at' => now()]);

    $pet = Pet::factory()->create(['household_id' => $household->id]);
    $originalDueDate = now()->addDays(2)->toDateString();

    $reminder = Reminder::query()->withoutGlobalScopes()->create([
        'household_id' => $household->id,
        'pet_id' => $pet->id,
        'type' => ReminderType::Vaccination,
        'title' => 'Recurring vaccination',
        'due_date' => $originalDueDate,
        'is_recurring' => true,
        'recurrence_days' => 30,
        'status' => ReminderStatus::Pending,
    ]);

    $this->artisan('notifications:dispatch-reminders')->assertSuccessful();

    $reminder->refresh();
    expect($reminder->due_date->toDateString())
        ->toBe(now()->addDays(2 + 30)->toDateString());
    expect($reminder->status)->toBe(ReminderStatus::Pending);
});

it('marks non-recurring reminder as completed after due date passes', function () {
    Notification::fake();

    [$user, $household] = createOwnerWithHousehold();
    $household->members()->attach($user->id, ['role' => 'owner', 'joined_at' => now()]);

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $reminder = Reminder::query()->withoutGlobalScopes()->create([
        'household_id' => $household->id,
        'pet_id' => $pet->id,
        'type' => ReminderType::Vaccination,
        'title' => 'Past vaccination reminder',
        'due_date' => now()->subDay()->toDateString(),
        'is_recurring' => false,
        'status' => ReminderStatus::Pending,
    ]);

    $this->artisan('notifications:dispatch-reminders')->assertSuccessful();

    $reminder->refresh();
    expect($reminder->status)->toBe(ReminderStatus::Completed);
});
