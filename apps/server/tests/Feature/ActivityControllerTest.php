<?php

declare(strict_types=1);

use App\Models\Household;
use App\Models\Pet;
use App\Models\User;
use Spatie\Activitylog\Models\Activity;

it('returns 401 for unauthenticated requests', function () {
    $this->getJson('/api/activity')->assertUnauthorized();
});

it('returns paginated activity for the authenticated user\'s household', function () {
    [$owner, $household] = createOwnerWithHousehold();

    $household->members()->attach($owner->id, ['role' => 'owner', 'joined_at' => now()]);

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    activity()
        ->causedBy($owner)
        ->performedOn($pet)
        ->event('created')
        ->log('Added pet Luna to the household');

    $response = $this->actingAs($owner)->getJson('/api/activity');

    $response->assertOk();
    $response->assertJsonStructure([
        'data' => [
            '*' => [
                'id',
                'description',
                'event',
                'subject_type',
                'causer_name',
                'causer_id',
                'created_at',
            ],
        ],
        'meta' => [
            'current_page',
            'last_page',
            'per_page',
            'total',
        ],
    ]);

    $response->assertJsonCount(1, 'data');
    $response->assertJsonPath('data.0.causer_name', $owner->name);
    $response->assertJsonPath('data.0.subject_type', 'pet');
    $response->assertJsonPath('data.0.event', 'created');
    $response->assertJsonPath('meta.total', 1);
});

it('does not expose activity from a different household', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $household->members()->attach($owner->id, ['role' => 'owner', 'joined_at' => now()]);

    // Second household with its own owner and activity
    $otherHousehold = Household::factory()->create();
    $otherOwner = User::factory()->create(['current_household_id' => $otherHousehold->id]);
    $otherHousehold->members()->attach($otherOwner->id, ['role' => 'owner', 'joined_at' => now()]);

    $pet = Pet::factory()->create(['household_id' => $otherHousehold->id]);

    activity()
        ->causedBy($otherOwner)
        ->performedOn($pet)
        ->event('created')
        ->log('Added pet in other household');

    // Authenticated as first household owner — should see zero entries
    $response = $this->actingAs($owner)->getJson('/api/activity');

    $response->assertOk();
    $response->assertJsonCount(0, 'data');
    $response->assertJsonPath('meta.total', 0);
});

it('includes activity from all members of the same household', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $household->members()->attach($owner->id, ['role' => 'owner', 'joined_at' => now()]);

    $member = createMemberWithHousehold($household);
    $household->members()->attach($member->id, ['role' => 'member', 'joined_at' => now()]);

    $pet = Pet::factory()->create(['household_id' => $household->id]);

    activity()->causedBy($owner)->performedOn($pet)->event('created')->log('Owner added pet');
    activity()->causedBy($member)->performedOn($pet)->event('updated')->log('Member updated pet');

    $response = $this->actingAs($owner)->getJson('/api/activity');

    $response->assertOk();
    $response->assertJsonCount(2, 'data');
    $response->assertJsonPath('meta.total', 2);
});

it('returns causer_name as System when causer is null', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $household->members()->attach($owner->id, ['role' => 'owner', 'joined_at' => now()]);

    // Log activity without a causer, but set causer_id to the owner's id
    // so it appears in the household query, then manually null the causer_type
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    activity()
        ->causedBy($owner)
        ->performedOn($pet)
        ->event('created')
        ->log('System-like entry');

    // Forcefully clear the causer fields to simulate a system-generated entry
    // that is still visible because we scope on causer_id matching a member
    Activity::query()->update(['causer_type' => null, 'causer_id' => $owner->id]);

    $response = $this->actingAs($owner)->getJson('/api/activity');

    $response->assertOk();
    $response->assertJsonPath('data.0.causer_name', 'System');
});
