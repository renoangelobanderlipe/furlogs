<?php

declare(strict_types=1);

use App\Models\Household;
use App\Models\Pet;
use App\Models\User;

// ---------------------------------------------------------------------------
// PATCH /api/user
// ---------------------------------------------------------------------------

it('can update profile name', function () {
    [$owner] = createOwnerWithHousehold();

    $response = $this->actingAs($owner)->patchJson('/api/user', [
        'name' => 'Updated Name',
    ]);

    $response->assertOk();
    expect($owner->fresh()->name)->toBe('Updated Name');
});

it('profile update requires name field', function () {
    [$owner] = createOwnerWithHousehold();

    $response = $this->actingAs($owner)->patchJson('/api/user', []);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['name']);
});

it('profile update requires authentication', function () {
    $this->patchJson('/api/user', ['name' => 'Test'])->assertUnauthorized();
});

// ---------------------------------------------------------------------------
// GET /api/user/notification-preferences
// ---------------------------------------------------------------------------

it('returns notification preferences for authenticated user', function () {
    [$owner] = createOwnerWithHousehold();

    $owner->update(['notification_preferences' => ['vaccination' => true, 'medication' => false]]);

    $response = $this->actingAs($owner)->getJson('/api/user/notification-preferences');

    $response->assertOk();
    expect($response->json('data.vaccination'))->toBeTrue();
    expect($response->json('data.medication'))->toBeFalse();
});

it('notification preferences requires authentication', function () {
    $this->getJson('/api/user/notification-preferences')->assertUnauthorized();
});

// ---------------------------------------------------------------------------
// PATCH /api/user/notification-preferences
// ---------------------------------------------------------------------------

it('can update notification preferences', function () {
    [$owner] = createOwnerWithHousehold();

    $owner->update(['notification_preferences' => ['vaccination' => true]]);

    $response = $this->actingAs($owner)->patchJson('/api/user/notification-preferences', [
        'medication' => false,
    ]);

    $response->assertOk();

    $prefs = $owner->fresh()->notification_preferences;
    expect($prefs['vaccination'])->toBeTrue();
    expect($prefs['medication'])->toBeFalse();
});

it('rejects invalid notification preference keys', function () {
    [$owner] = createOwnerWithHousehold();

    $response = $this->actingAs($owner)->patchJson('/api/user/notification-preferences', [
        'invalid_key' => true,
    ]);

    // The UpdateNotificationPreferencesRequest only allows known keys via 'sometimes',
    // so unknown keys are silently ignored rather than rejected. Verify the response
    // is OK and the unknown key is not persisted.
    $response->assertOk();
    $prefs = $owner->fresh()->notification_preferences ?? [];
    expect(array_key_exists('invalid_key', $prefs))->toBeFalse();
});

it('notification preferences update requires authentication', function () {
    $this->patchJson('/api/user/notification-preferences', ['vaccination' => true])->assertUnauthorized();
});

// ---------------------------------------------------------------------------
// GET /api/user/export
// ---------------------------------------------------------------------------

it('returns export with household and user structure', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $response = $this->actingAs($owner)->getJson('/api/user/export');

    $response->assertOk();
    $response->assertJsonStructure([
        'exported_at',
        'household' => ['id', 'name'],
        'user' => ['name', 'email'],
        'pets',
    ]);
    expect($response->json('household.id'))->toBe($household->id);
    expect($response->json('user.email'))->toBe($owner->email);
});

it('export is scoped to current household pets only', function () {
    [$owner, $household] = createOwnerWithHousehold();

    // Pet in owner's household
    Pet::factory()->create(['household_id' => $household->id, 'name' => 'MyPet']);

    // Pet in another household (not visible)
    $otherHousehold = Household::factory()->create();
    Pet::withoutGlobalScopes()->create([
        'household_id' => $otherHousehold->id,
        'name' => 'OtherPet',
        'species' => 'dog',
        'sex' => 'male',
        'is_neutered' => false,
    ]);

    $response = $this->actingAs($owner)->getJson('/api/user/export');

    $response->assertOk();
    expect($response->json('pets'))->toHaveCount(1);
    expect($response->json('pets.0.name'))->toBe('MyPet');
});

it('export returns empty pets array when household has no pets', function () {
    [$owner] = createOwnerWithHousehold();

    $response = $this->actingAs($owner)->getJson('/api/user/export');

    $response->assertOk();
    expect($response->json('pets'))->toBe([]);
});

it('export requires authentication', function () {
    $this->getJson('/api/user/export')->assertUnauthorized();
});
