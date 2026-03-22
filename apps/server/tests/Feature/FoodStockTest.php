<?php

declare(strict_types=1);

use App\Actions\FoodStock\CalculateProjection;
use App\Enums\FoodType;
use App\Enums\StockStatus;
use App\Enums\UnitType;
use App\Exceptions\StockProjectionException;
use App\Models\FoodConsumptionLog;
use App\Models\FoodConsumptionRate;
use App\Models\FoodProduct;
use App\Models\FoodStockItem;
use App\Models\Household;
use App\Models\Pet;
use App\Models\User;
use App\Services\FoodStockService;
use Illuminate\Foundation\Testing\WithFaker;
use Spatie\Permission\Models\Role;

uses(WithFaker::class);

/**
 * Helper: create a user who owns a household (with Spatie owner role).
 *
 * @return array{0: User, 1: Household}
 */
function createFoodOwnerWithHousehold(): array
{
    $household = Household::factory()->create();
    $user = User::factory()->create(['current_household_id' => $household->id]);

    setPermissionsTeamId($household->id);

    Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
    $user->assignRole('owner');

    return [$user, $household];
}

/**
 * Helper: create a member user for an existing household.
 */
function createFoodMemberWithHousehold(Household $household): User
{
    $user = User::factory()->create(['current_household_id' => $household->id]);

    setPermissionsTeamId($household->id);

    Role::firstOrCreate(['name' => 'member', 'guard_name' => 'web']);
    $user->assignRole('member');

    return $user;
}

// ─── Projection calculation ───────────────────────────────────────────────────

it('calculates projection correctly for an open item', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();

    $product = FoodProduct::factory()->create([
        'household_id' => $household->id,
        'unit_weight_grams' => 5000,
        'alert_threshold_pct' => 25,
    ]);

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    FoodConsumptionRate::factory()->create([
        'food_product_id' => $product->id,
        'pet_id' => $pet->id,
        'daily_amount_grams' => 250,
    ]);

    $item = FoodStockItem::factory()->create([
        'food_product_id' => $product->id,
        'status' => StockStatus::Open,
        'opened_at' => now()->subDays(5)->toDateString(),
        'purchased_at' => now()->subDays(5)->toDateString(),
    ]);

    $action = app(CalculateProjection::class);
    $dto = $action($item);

    expect($dto->remainingGrams)->toBe(3750)
        ->and($dto->daysRemaining)->toBe(15.0)
        ->and($dto->status)->toBe('good')
        ->and($dto->totalDailyRate)->toBe(250)
        ->and($dto->percentageRemaining)->toBe(75.0);
});

// ─── Bag lifecycle ────────────────────────────────────────────────────────────

it('handles full bag lifecycle: sealed → open → finished with log creation', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();

    $product = FoodProduct::factory()->create([
        'household_id' => $household->id,
        'unit_weight_grams' => 5000,
    ]);

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    FoodConsumptionRate::factory()->create([
        'food_product_id' => $product->id,
        'pet_id' => $pet->id,
        'daily_amount_grams' => 250,
    ]);

    // Create sealed item
    $response = $this->actingAs($owner)->postJson('/api/food-stock-items', [
        'food_product_id' => $product->id,
        'purchased_at' => now()->toDateString(),
    ]);

    $response->assertStatus(201);
    $itemId = $response->json('attributes.foodProductId') ? $response->json('id') : null;
    $itemId = $itemId ?? $response->json('id');

    $this->assertDatabaseHas('food_stock_items', [
        'food_product_id' => $product->id,
        'status' => 'sealed',
    ]);

    $item = FoodStockItem::query()->where('food_product_id', $product->id)->first();

    // Open the item
    $openResponse = $this->actingAs($owner)->patchJson("/api/food-stock-items/{$item->id}/open");
    $openResponse->assertOk();

    $item->refresh();
    expect($item->status)->toBe(StockStatus::Open)
        ->and($item->opened_at)->not->toBeNull();

    // Finish the item
    $finishResponse = $this->actingAs($owner)->patchJson("/api/food-stock-items/{$item->id}/finish");
    $finishResponse->assertOk();

    $item->refresh();
    expect($item->status)->toBe(StockStatus::Finished);

    // Assert consumption log was created by observer
    $this->assertDatabaseHas('food_consumption_logs', [
        'food_stock_item_id' => $item->id,
    ]);
});

// ─── Stock status thresholds ──────────────────────────────────────────────────

it('returns good status when percentage remaining is above threshold', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();

    $product = FoodProduct::factory()->create([
        'household_id' => $household->id,
        'unit_weight_grams' => 5000,
        'alert_threshold_pct' => 25,
    ]);

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    FoodConsumptionRate::factory()->create([
        'food_product_id' => $product->id,
        'pet_id' => $pet->id,
        'daily_amount_grams' => 100,
    ]);

    // 5 days opened × 100g/day = 500g used, 4500g remaining = 90% → good
    $item = FoodStockItem::factory()->create([
        'food_product_id' => $product->id,
        'status' => StockStatus::Open,
        'opened_at' => now()->subDays(5)->toDateString(),
        'purchased_at' => now()->subDays(5)->toDateString(),
    ]);

    $dto = app(CalculateProjection::class)($item);

    expect($dto->status)->toBe('good')
        ->and($dto->percentageRemaining)->toBe(90.0);
});

it('returns low status when percentage remaining is at or below threshold but above 10%', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();

    $product = FoodProduct::factory()->create([
        'household_id' => $household->id,
        'unit_weight_grams' => 1000,
        'alert_threshold_pct' => 25,
    ]);

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    FoodConsumptionRate::factory()->create([
        'food_product_id' => $product->id,
        'pet_id' => $pet->id,
        'daily_amount_grams' => 100,
    ]);

    // 8 days × 100g/day = 800g used, 200g remaining = 20% → low (≤25% but >10%)
    $item = FoodStockItem::factory()->create([
        'food_product_id' => $product->id,
        'status' => StockStatus::Open,
        'opened_at' => now()->subDays(8)->toDateString(),
        'purchased_at' => now()->subDays(8)->toDateString(),
    ]);

    $dto = app(CalculateProjection::class)($item);

    expect($dto->status)->toBe('low')
        ->and($dto->percentageRemaining)->toBe(20.0);
});

it('returns critical status when percentage remaining is at or below 10%', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();

    $product = FoodProduct::factory()->create([
        'household_id' => $household->id,
        'unit_weight_grams' => 1000,
        'alert_threshold_pct' => 25,
    ]);

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    FoodConsumptionRate::factory()->create([
        'food_product_id' => $product->id,
        'pet_id' => $pet->id,
        'daily_amount_grams' => 100,
    ]);

    // 9 days × 100g/day = 900g used, 100g remaining = 10% → critical
    $item = FoodStockItem::factory()->create([
        'food_product_id' => $product->id,
        'status' => StockStatus::Open,
        'opened_at' => now()->subDays(9)->toDateString(),
        'purchased_at' => now()->subDays(9)->toDateString(),
    ]);

    $dto = app(CalculateProjection::class)($item);

    expect($dto->status)->toBe('critical')
        ->and($dto->percentageRemaining)->toBe(10.0);
});

// ─── Rate adjustment suggestion ───────────────────────────────────────────────

it('returns average actual daily rate when 3 or more completed logs exist', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();

    $product = FoodProduct::factory()->create([
        'household_id' => $household->id,
        'unit_weight_grams' => 5000,
    ]);

    // Create 3 finished items with consumption logs
    foreach ([200, 300, 400] as $actualRate) {
        $item = FoodStockItem::factory()->create([
            'food_product_id' => $product->id,
            'status' => StockStatus::Finished,
            'purchased_at' => now()->subDays(30)->toDateString(),
            'opened_at' => now()->subDays(20)->toDateString(),
            'finished_at' => now()->toDateString(),
        ]);

        FoodConsumptionLog::factory()->create([
            'food_stock_item_id' => $item->id,
            'actual_duration_days' => 20,
            'actual_daily_rate_grams' => $actualRate,
            'estimated_vs_actual_diff' => 0.00,
        ]);
    }

    $service = app(FoodStockService::class);
    $suggestion = $service->getSuggestedRateAdjustment($product);

    expect($suggestion)->toBe(300.0); // average of 200, 300, 400
});

it('returns null when fewer than 3 completed logs exist', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();

    $product = FoodProduct::factory()->create([
        'household_id' => $household->id,
        'unit_weight_grams' => 5000,
    ]);

    $item = FoodStockItem::factory()->create([
        'food_product_id' => $product->id,
        'status' => StockStatus::Finished,
        'purchased_at' => now()->subDays(20)->toDateString(),
        'opened_at' => now()->subDays(20)->toDateString(),
        'finished_at' => now()->toDateString(),
    ]);

    FoodConsumptionLog::factory()->create([
        'food_stock_item_id' => $item->id,
        'actual_daily_rate_grams' => 250,
        'actual_duration_days' => 20,
        'estimated_vs_actual_diff' => 0.00,
    ]);

    $service = app(FoodStockService::class);
    $suggestion = $service->getSuggestedRateAdjustment($product);

    expect($suggestion)->toBeNull();
});

// ─── Observer triggers ────────────────────────────────────────────────────────

it('creates consumption log when stock item status changes to finished', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();

    $product = FoodProduct::factory()->create([
        'household_id' => $household->id,
        'unit_weight_grams' => 5000,
    ]);

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    FoodConsumptionRate::factory()->create([
        'food_product_id' => $product->id,
        'pet_id' => $pet->id,
        'daily_amount_grams' => 250,
    ]);

    $item = FoodStockItem::factory()->create([
        'food_product_id' => $product->id,
        'status' => StockStatus::Open,
        'purchased_at' => now()->subDays(20)->toDateString(),
        'opened_at' => now()->subDays(20)->toDateString(),
    ]);

    expect(FoodConsumptionLog::query()->where('food_stock_item_id', $item->id)->count())->toBe(0);

    $item->update([
        'status' => StockStatus::Finished,
        'finished_at' => now()->toDateString(),
    ]);

    expect(FoodConsumptionLog::query()->where('food_stock_item_id', $item->id)->count())->toBe(1);
});

// ─── Household isolation ──────────────────────────────────────────────────────

it('cannot see food products from another household', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();

    $otherHousehold = Household::factory()->create();

    // Product in another household (bypass scope)
    FoodProduct::withoutGlobalScopes()->create([
        'household_id' => $otherHousehold->id,
        'name' => 'Other Product',
        'type' => FoodType::Dry->value,
        'unit_type' => UnitType::Kg->value,
        'alert_threshold_pct' => 25,
    ]);

    // Product in owner's household
    FoodProduct::factory()->create(['household_id' => $household->id]);

    $response = $this->actingAs($owner)->getJson('/api/food-products');

    $response->assertOk();
    $response->assertJsonCount(1, 'data');
});

it('returns 404 when accessing a food product from another household', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();

    $otherHousehold = Household::factory()->create();

    $product = FoodProduct::withoutGlobalScopes()->create([
        'household_id' => $otherHousehold->id,
        'name' => 'Other Product',
        'type' => FoodType::Dry->value,
        'unit_type' => UnitType::Kg->value,
        'alert_threshold_pct' => 25,
    ]);

    $response = $this->actingAs($owner)->getJson("/api/food-products/{$product->id}");

    $response->assertNotFound();
});

// ─── No consumption rates ─────────────────────────────────────────────────────

it('throws StockProjectionException when no consumption rates are configured', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();

    $product = FoodProduct::factory()->create([
        'household_id' => $household->id,
        'unit_weight_grams' => 5000,
    ]);

    $item = FoodStockItem::factory()->create([
        'food_product_id' => $product->id,
        'status' => StockStatus::Open,
        'opened_at' => now()->subDays(5)->toDateString(),
        'purchased_at' => now()->subDays(5)->toDateString(),
    ]);

    expect(fn () => app(CalculateProjection::class)($item))
        ->toThrow(StockProjectionException::class, 'No consumption rates configured for this product.');
});

// ─── API endpoint tests ───────────────────────────────────────────────────────

it('can list food products', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();

    FoodProduct::factory()->count(3)->create(['household_id' => $household->id]);

    $response = $this->actingAs($owner)->getJson('/api/food-products');

    $response->assertOk();
    $response->assertJsonCount(3, 'data');
});

it('can create a food product', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();

    $response = $this->actingAs($owner)->postJson('/api/food-products', [
        'name' => 'Premium Dry Food',
        'brand' => 'Royal Canin',
        'type' => FoodType::Dry->value,
        'unit_weight_grams' => 5000,
        'unit_type' => UnitType::Kg->value,
        'alert_threshold_pct' => 20,
    ]);

    $response->assertStatus(201);

    $this->assertDatabaseHas('food_products', [
        'name' => 'Premium Dry Food',
        'household_id' => $household->id,
        'type' => 'dry',
    ]);
});

it('validates required fields when creating a food product', function () {
    [$owner] = createFoodOwnerWithHousehold();

    $response = $this->actingAs($owner)->postJson('/api/food-products', []);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['name', 'type', 'unit_type']);
});

it('owner can delete a food product', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();

    $product = FoodProduct::factory()->create(['household_id' => $household->id]);

    $response = $this->actingAs($owner)->deleteJson("/api/food-products/{$product->id}");

    $response->assertNoContent();
    $this->assertSoftDeleted('food_products', ['id' => $product->id]);
});

it('member cannot delete a food product', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();

    $member = createFoodMemberWithHousehold($household);

    $product = FoodProduct::factory()->create(['household_id' => $household->id]);

    $response = $this->actingAs($member)->deleteJson("/api/food-products/{$product->id}");

    $response->assertForbidden();
});

it('can set consumption rate for a pet on a product', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();

    $product = FoodProduct::factory()->create(['household_id' => $household->id]);
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $response = $this->actingAs($owner)->postJson("/api/food-products/{$product->id}/consumption-rates", [
        'pet_id' => $pet->id,
        'daily_amount_grams' => 300,
    ]);

    $response->assertOk();

    $this->assertDatabaseHas('food_consumption_rates', [
        'food_product_id' => $product->id,
        'pet_id' => $pet->id,
        'daily_amount_grams' => 300,
    ]);
});

// ─── Security: IDOR & cross-household ────────────────────────────────────────

it('cannot log a purchase against another households product (IDOR)', function () {
    [$owner] = createFoodOwnerWithHousehold();

    $otherHousehold = Household::factory()->create();
    $foreignProduct = FoodProduct::withoutGlobalScopes()->create([
        'household_id' => $otherHousehold->id,
        'name' => 'Foreign Product',
        'type' => FoodType::Dry->value,
        'unit_type' => UnitType::Kg->value,
        'alert_threshold_pct' => 25,
    ]);

    $response = $this->actingAs($owner)->postJson('/api/food-stock-items', [
        'food_product_id' => $foreignProduct->id,
        'purchased_at' => now()->toDateString(),
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['food_product_id']);
});

it('cannot link a pet from another household to a consumption rate', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();
    $product = FoodProduct::factory()->create(['household_id' => $household->id]);

    $otherHousehold = Household::factory()->create();
    $foreignPet = Pet::withoutGlobalScopes()->create([
        'household_id' => $otherHousehold->id,
        'name' => 'ForeignPet',
        'species' => 'dog',
        'sex' => 'male',
        'is_neutered' => false,
    ]);

    $response = $this->actingAs($owner)->postJson("/api/food-products/{$product->id}/consumption-rates", [
        'pet_id' => $foreignPet->id,
        'daily_amount_grams' => 200,
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['pet_id']);
});

it('cannot open a stock item from another household', function () {
    [$owner] = createFoodOwnerWithHousehold();

    $otherHousehold = Household::factory()->create();
    $foreignProduct = FoodProduct::withoutGlobalScopes()->create([
        'household_id' => $otherHousehold->id,
        'name' => 'Foreign',
        'type' => FoodType::Dry->value,
        'unit_type' => UnitType::Kg->value,
        'alert_threshold_pct' => 25,
    ]);
    $foreignItem = FoodStockItem::withoutGlobalScopes()->create([
        'food_product_id' => $foreignProduct->id,
        'status' => 'sealed',
        'purchased_at' => now()->toDateString(),
        'quantity' => 1,
    ]);

    $response = $this->actingAs($owner)->patchJson("/api/food-stock-items/{$foreignItem->id}/open");

    // Global scope hides cross-household items entirely, so the route returns 404 (not 403).
    // This is more secure: it does not confirm the existence of the resource.
    $response->assertNotFound();
});

it('cannot mark finished a stock item from another household', function () {
    [$owner] = createFoodOwnerWithHousehold();

    $otherHousehold = Household::factory()->create();
    $foreignProduct = FoodProduct::withoutGlobalScopes()->create([
        'household_id' => $otherHousehold->id,
        'name' => 'Foreign',
        'type' => FoodType::Dry->value,
        'unit_type' => UnitType::Kg->value,
        'alert_threshold_pct' => 25,
    ]);
    $foreignItem = FoodStockItem::withoutGlobalScopes()->create([
        'food_product_id' => $foreignProduct->id,
        'status' => 'open',
        'purchased_at' => now()->toDateString(),
        'opened_at' => now()->toDateString(),
        'quantity' => 1,
    ]);

    $response = $this->actingAs($owner)->patchJson("/api/food-stock-items/{$foreignItem->id}/finish");

    // Global scope hides cross-household items entirely, so the route returns 404 (not 403).
    // This is more secure: it does not confirm the existence of the resource.
    $response->assertNotFound();
});

it('projections endpoint only returns items for the users household', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();

    $product = FoodProduct::factory()->create([
        'household_id' => $household->id,
        'unit_weight_grams' => 5000,
    ]);
    $pet = Pet::factory()->create(['household_id' => $household->id]);
    FoodConsumptionRate::factory()->create([
        'food_product_id' => $product->id,
        'pet_id' => $pet->id,
        'daily_amount_grams' => 250,
    ]);
    FoodStockItem::factory()->create([
        'food_product_id' => $product->id,
        'status' => StockStatus::Open,
        'opened_at' => now()->subDays(5)->toDateString(),
        'purchased_at' => now()->subDays(5)->toDateString(),
    ]);

    // Item in foreign household
    $otherHousehold = Household::factory()->create();
    $foreignProduct = FoodProduct::withoutGlobalScopes()->create([
        'household_id' => $otherHousehold->id,
        'name' => 'Foreign',
        'type' => FoodType::Dry->value,
        'unit_type' => UnitType::Kg->value,
        'unit_weight_grams' => 5000,
        'alert_threshold_pct' => 25,
    ]);
    FoodStockItem::withoutGlobalScopes()->create([
        'food_product_id' => $foreignProduct->id,
        'status' => 'open',
        'purchased_at' => now()->toDateString(),
        'opened_at' => now()->toDateString(),
        'quantity' => 1,
    ]);

    $response = $this->actingAs($owner)->getJson('/api/food-stock/projections');

    $response->assertOk();
    $response->assertJsonCount(1, 'data');
});

it('stock item is invisible when its product is soft-deleted', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();

    $product = FoodProduct::factory()->create(['household_id' => $household->id]);
    $item = FoodStockItem::factory()->create([
        'food_product_id' => $product->id,
        'status' => StockStatus::Sealed,
        'purchased_at' => now()->toDateString(),
    ]);

    // Soft-delete the product — the global scope (BelongsToHouseholdViaFoodProduct) uses
    // whereHas('foodProduct'), which excludes soft-deleted products. The item becomes
    // invisible via 404 rather than a 403, which is intentionally more secure.
    $product->delete();

    $response = $this->actingAs($owner)->patchJson("/api/food-stock-items/{$item->id}/open");

    $response->assertNotFound();
});

it('member cannot delete a stock item', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();
    $member = createFoodMemberWithHousehold($household);

    $product = FoodProduct::factory()->create(['household_id' => $household->id]);
    $item = FoodStockItem::factory()->create([
        'food_product_id' => $product->id,
        'status' => StockStatus::Sealed,
        'purchased_at' => now()->toDateString(),
    ]);

    $response = $this->actingAs($member)->deleteJson("/api/food-stock-items/{$item->id}");

    $response->assertForbidden();
});

it('throws StockProjectionException when unit_weight_grams is zero', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();

    $product = FoodProduct::factory()->create([
        'household_id' => $household->id,
        'unit_weight_grams' => 0,
    ]);
    $pet = Pet::factory()->create(['household_id' => $household->id]);
    FoodConsumptionRate::factory()->create([
        'food_product_id' => $product->id,
        'pet_id' => $pet->id,
        'daily_amount_grams' => 250,
    ]);
    $item = FoodStockItem::factory()->create([
        'food_product_id' => $product->id,
        'status' => StockStatus::Open,
        'opened_at' => now()->subDays(5)->toDateString(),
        'purchased_at' => now()->subDays(5)->toDateString(),
    ]);

    expect(fn () => app(CalculateProjection::class)($item))
        ->toThrow(StockProjectionException::class, 'Product has no valid unit weight configured.');
});

it('does not create a duplicate consumption log when finish is called twice', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();

    $product = FoodProduct::factory()->create([
        'household_id' => $household->id,
        'unit_weight_grams' => 5000,
    ]);
    $pet = Pet::factory()->create(['household_id' => $household->id]);
    FoodConsumptionRate::factory()->create([
        'food_product_id' => $product->id,
        'pet_id' => $pet->id,
        'daily_amount_grams' => 250,
    ]);
    $item = FoodStockItem::factory()->create([
        'food_product_id' => $product->id,
        'status' => StockStatus::Open,
        'purchased_at' => now()->subDays(20)->toDateString(),
        'opened_at' => now()->subDays(20)->toDateString(),
    ]);

    $this->actingAs($owner)->patchJson("/api/food-stock-items/{$item->id}/finish")->assertOk();
    $this->actingAs($owner)->patchJson("/api/food-stock-items/{$item->id}/finish")->assertOk();

    expect(FoodConsumptionLog::query()->where('food_stock_item_id', $item->id)->count())->toBe(1);
});

// ─── Existing API tests ───────────────────────────────────────────────────────

it('can retrieve projections endpoint', function () {
    [$owner, $household] = createFoodOwnerWithHousehold();

    $product = FoodProduct::factory()->create([
        'household_id' => $household->id,
        'unit_weight_grams' => 5000,
    ]);

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    FoodConsumptionRate::factory()->create([
        'food_product_id' => $product->id,
        'pet_id' => $pet->id,
        'daily_amount_grams' => 250,
    ]);

    FoodStockItem::factory()->create([
        'food_product_id' => $product->id,
        'status' => StockStatus::Open,
        'opened_at' => now()->subDays(5)->toDateString(),
        'purchased_at' => now()->subDays(5)->toDateString(),
    ]);

    $response = $this->actingAs($owner)->getJson('/api/food-stock/projections');

    $response->assertOk();
    $response->assertJsonCount(1, 'data');
    $response->assertJsonPath('data.0.projection.status', 'good');
});
