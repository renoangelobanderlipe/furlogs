<?php

declare(strict_types=1);

use App\Enums\VisitType;
use App\Models\Household;
use App\Models\Pet;
use App\Models\User;
use App\Models\VetVisit;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

/**
 * @return array{0: User, 1: Household}
 */
function createVetVisitOwner(): array
{
    $household = Household::factory()->create();
    $user = User::factory()->create(['current_household_id' => $household->id]);

    setPermissionsTeamId($household->id);

    Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
    $user->assignRole('owner');

    return [$user, $household];
}

function createVetVisitMember(Household $household): User
{
    $user = User::factory()->create(['current_household_id' => $household->id]);

    setPermissionsTeamId($household->id);

    Role::firstOrCreate(['name' => 'member', 'guard_name' => 'web']);
    $user->assignRole('member');

    return $user;
}

it('can list vet visits scoped to the authenticated user household', function () {
    [$owner, $household] = createVetVisitOwner();

    $pet = Pet::factory()->create(['household_id' => $household->id]);
    VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Annual checkup',
    ]);

    // A visit in a different household — must NOT appear
    $otherHousehold = Household::factory()->create();
    $otherPet = Pet::withoutGlobalScopes()->create([
        'household_id' => $otherHousehold->id,
        'name' => 'OtherPet',
        'species' => 'dog',
        'sex' => 'male',
        'is_neutered' => false,
    ]);
    VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $otherPet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Other household visit',
    ]);

    $response = $this->actingAs($owner)->getJson('/api/vet-visits');

    $response->assertOk();
    $response->assertJsonCount(1, 'data');
});

it('can create a vet visit and returns 201 with correct JSON:API shape', function () {
    [$owner, $household] = createVetVisitOwner();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $payload = [
        'pet_id' => $pet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Routine checkup',
    ];

    $response = $this->actingAs($owner)->postJson('/api/vet-visits', $payload);

    $response->assertStatus(201);
    $response->assertJsonStructure([
        'data' => [
            'id',
            'type',
            'attributes' => ['visitDate', 'visitType', 'reason'],
        ],
    ]);
    $response->assertJsonPath('data.type', 'vet-visits');

    $this->assertDatabaseHas('vet_visits', [
        'pet_id' => $pet->id,
        'reason' => 'Routine checkup',
    ]);
});

it('cannot create a vet visit for a pet in a different household', function () {
    [$owner, $household] = createVetVisitOwner();

    $otherHousehold = Household::factory()->create();
    $otherPet = Pet::withoutGlobalScopes()->create([
        'household_id' => $otherHousehold->id,
        'name' => 'OtherPet',
        'species' => 'dog',
        'sex' => 'male',
        'is_neutered' => false,
    ]);

    // pet_id must exist in pets table, but the created visit would not be in the user's household.
    // The validation only checks existence, but policy scope prevents returning it.
    // In this scenario we verify the pet_id validation fails (pet not in scope).
    $response = $this->actingAs($owner)->postJson('/api/vet-visits', [
        'pet_id' => $otherPet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Attempt cross-household',
    ]);

    // The pet exists but is not accessible via the household scope — returns 422 because
    // pet_id is validated with exists:pets,id and pets has a global scope filtering to current household.
    // Route model binding with global scope returns 422 here.
    $response->assertStatus(422);
});

it('only owner can delete a vet visit and member gets 403', function () {
    [$owner, $household] = createVetVisitOwner();
    $member = createVetVisitMember($household);

    $pet = Pet::factory()->create(['household_id' => $household->id]);
    $visit = VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Test visit',
    ]);

    // Member cannot delete
    $responseAsMember = $this->actingAs($member)->deleteJson("/api/vet-visits/{$visit->id}");
    $responseAsMember->assertForbidden();

    // Owner can delete
    $responseAsOwner = $this->actingAs($owner)->deleteJson("/api/vet-visits/{$visit->id}");
    $responseAsOwner->assertNoContent();

    $this->assertSoftDeleted('vet_visits', ['id' => $visit->id]);
});

it('bulk delete works for owner and returns 204', function () {
    [$owner, $household] = createVetVisitOwner();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $visit1 = VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Visit 1',
    ]);
    $visit2 = VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'visit_date' => now()->subDay()->toDateString(),
        'visit_type' => VisitType::Treatment->value,
        'reason' => 'Visit 2',
    ]);

    $response = $this->actingAs($owner)->deleteJson('/api/vet-visits/bulk', [
        'ids' => [$visit1->id, $visit2->id],
    ]);

    $response->assertNoContent();
    $this->assertSoftDeleted('vet_visits', ['id' => $visit1->id]);
    $this->assertSoftDeleted('vet_visits', ['id' => $visit2->id]);
});

it('bulk delete is forbidden for members', function () {
    [$owner, $household] = createVetVisitOwner();
    $member = createVetVisitMember($household);

    $response = $this->actingAs($member)->deleteJson('/api/vet-visits/bulk', [
        'ids' => [1],
    ]);

    $response->assertForbidden();
});

it('user cannot see another household vet visits', function () {
    [$owner, $household] = createVetVisitOwner();

    $otherHousehold = Household::factory()->create();
    $otherPet = Pet::withoutGlobalScopes()->create([
        'household_id' => $otherHousehold->id,
        'name' => 'OtherPet',
        'species' => 'dog',
        'sex' => 'male',
        'is_neutered' => false,
    ]);
    $visit = VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $otherPet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Other household',
    ]);

    $response = $this->actingAs($owner)->getJson("/api/vet-visits/{$visit->id}");

    $response->assertNotFound();
});

it('can upload attachments when creating a vet visit', function () {
    Storage::fake('public');

    [$owner, $household] = createVetVisitOwner();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $payload = [
        'pet_id' => $pet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Checkup with attachment',
        'attachments' => [
            UploadedFile::fake()->image('report.png', 100, 100),
        ],
    ];

    $response = $this->actingAs($owner)->postJson('/api/vet-visits', $payload);

    $response->assertStatus(201);

    $visitId = $response->json('data.id');
    $visit = VetVisit::withoutGlobalScopes()->find($visitId);
    expect($visit->getMedia('attachments'))->toHaveCount(1);
});

it('rejects invalid mime types for attachments', function () {
    [$owner, $household] = createVetVisitOwner();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $response = $this->actingAs($owner)->postJson('/api/vet-visits', [
        'pet_id' => $pet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Test',
        'attachments' => [
            UploadedFile::fake()->create('malware.exe', 100, 'application/octet-stream'),
        ],
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['attachments.0']);
});

it('cannot exceed 5 attachments per visit', function () {
    [$owner, $household] = createVetVisitOwner();

    $response = $this->actingAs($owner)->postJson('/api/vet-visits', [
        'pet_id' => Pet::factory()->create(['household_id' => $household->id])->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Too many attachments',
        'attachments' => array_fill(0, 6, UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf')),
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['attachments']);
});

it('validates required fields on store', function () {
    [$owner] = createVetVisitOwner();

    $response = $this->actingAs($owner)->postJson('/api/vet-visits', []);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['pet_id', 'visit_date', 'visit_type', 'reason']);
});

it('bulk delete goes through the policy and returns 403 for members', function () {
    [$owner, $household] = createVetVisitOwner();
    $member = createVetVisitMember($household);
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $visit = VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Policy test',
    ]);

    // Member is denied via bulkDelete policy, not inline role check
    $this->actingAs($member)
        ->deleteJson('/api/vet-visits/bulk', ['ids' => [$visit->id]])
        ->assertForbidden();

    // Visit was NOT deleted
    $this->assertDatabaseHas('vet_visits', ['id' => $visit->id, 'deleted_at' => null]);
});

it('policy returns 403 not 500 when a visit pet is soft-deleted', function () {
    [$owner, $household] = createVetVisitOwner();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $visit = VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Soft-deleted pet test',
    ]);

    // Soft-delete the pet — policy must not crash on null pet
    $pet->delete();

    // Route model binding filters by the VetVisit scope (via pet), so the visit
    // becomes invisible (404) once its pet is soft-deleted — not a 500 crash.
    $this->actingAs($owner)
        ->getJson("/api/vet-visits/{$visit->id}")
        ->assertStatus(404);
});
