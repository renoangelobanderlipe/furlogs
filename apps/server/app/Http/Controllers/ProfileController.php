<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Fortify\UpdateUserPassword;
use App\Http\Requests\UpdateNotificationPreferencesRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\Medication;
use App\Models\Pet;
use App\Models\PetWeight;
use App\Models\Vaccination;
use App\Models\VetVisit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(private readonly UpdateUserPassword $updateUserPassword) {}

    /**
     * Update the authenticated user's profile name.
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $request->user()->update([
            'name' => $request->string('name')->toString(),
        ]);

        return response()->json(['data' => $request->user()->fresh()]);
    }

    /**
     * Change the authenticated user's password.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $this->updateUserPassword->update($request->user(), $request->all());

        return response()->json(['message' => 'Password updated successfully.']);
    }

    /**
     * Return the authenticated user's notification preferences.
     */
    public function notificationPreferences(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()->notification_preferences]);
    }

    /**
     * Merge the given preferences into the authenticated user's notification preferences.
     */
    public function updateNotificationPreferences(UpdateNotificationPreferencesRequest $request): JsonResponse
    {
        $user = $request->user();
        $current = $user->notification_preferences ?? [];
        $user->update(['notification_preferences' => array_merge($current, $request->validated())]);

        return response()->json(['data' => $user->fresh()->notification_preferences]);
    }

    /**
     * Export all of the authenticated user's household data as a structured JSON payload.
     */
    public function export(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->loadMissing('currentHousehold');

        // Pet and all ViaPet-scoped models are auto-filtered to the current household.
        $pets = Pet::query()->with(['weights'])->get();
        $petIds = $pets->pluck('id');

        $vaccinations = Vaccination::query()
            ->whereIn('pet_id', $petIds)
            ->get()
            ->groupBy('pet_id');

        $medications = Medication::query()
            ->whereIn('pet_id', $petIds)
            ->get()
            ->groupBy('pet_id');

        $vetVisits = VetVisit::query()
            ->whereIn('pet_id', $petIds)
            ->get()
            ->groupBy('pet_id');

        $petsExport = array_map(function (Pet $pet) use ($vaccinations, $medications, $vetVisits): array {
            return [
                'id' => $pet->id,
                'name' => $pet->name,
                'species' => $pet->species->value,
                'breed' => $pet->breed,
                'sex' => $pet->sex->value,
                'birthday' => $pet->birthday?->toDateString(),
                'is_neutered' => $pet->is_neutered,
                'size' => $pet->size?->value,
                'notes' => $pet->notes,
                'weights' => array_map(fn (PetWeight $w): array => [
                    'weight_kg' => $w->weight_kg,
                    'recorded_at' => $w->recorded_at->toDateString(),
                ], $pet->weights->all()),
                'vaccinations' => array_map(fn (Vaccination $v): array => [
                    'vaccine_name' => $v->vaccine_name,
                    'administered_date' => $v->administered_date->toDateString(),
                    'next_due_date' => $v->next_due_date?->toDateString(),
                    'vet_name' => $v->vet_name,
                    'batch_number' => $v->batch_number,
                    'notes' => $v->notes,
                ], ($vaccinations->get($pet->id) ?? collect())->all()),
                'medications' => array_map(fn (Medication $m): array => [
                    'name' => $m->name,
                    'dosage' => $m->dosage,
                    'frequency' => $m->frequency,
                    'start_date' => $m->start_date->toDateString(),
                    'end_date' => $m->end_date?->toDateString(),
                    'notes' => $m->notes,
                ], ($medications->get($pet->id) ?? collect())->all()),
                'vet_visits' => array_map(fn (VetVisit $v): array => [
                    'visit_date' => $v->visit_date->toDateString(),
                    'visit_type' => $v->visit_type->value,
                    'reason' => $v->reason,
                    'diagnosis' => $v->diagnosis,
                    'treatment' => $v->treatment,
                    'cost' => $v->cost,
                    'vet_name' => $v->vet_name,
                    'follow_up_date' => $v->follow_up_date?->toDateString(),
                    'notes' => $v->notes,
                ], ($vetVisits->get($pet->id) ?? collect())->all()),
            ];
        }, $pets->all());

        return response()->json([
            'exported_at' => now()->toISOString(),
            'household' => [
                'id' => $user->currentHousehold?->id,
                'name' => $user->currentHousehold?->name,
            ],
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'pets' => $petsExport,
        ]);
    }
}
