<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\CreateHouseholdRequest;
use App\Http\Requests\InviteMemberRequest;
use App\Http\Requests\UpdateHouseholdRequest;
use App\Http\Resources\HouseholdResource;
use App\Models\Household;
use App\Models\User;
use App\Services\HouseholdService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HouseholdController extends Controller
{
    public function __construct(private readonly HouseholdService $householdService) {}

    public function store(CreateHouseholdRequest $request): JsonResponse
    {
        $household = $this->householdService->create(
            owner: $request->user(),
            name: $request->string('name')->toString(),
        );

        return response()->json($household, 201);
    }

    public function current(Request $request): JsonResponse
    {
        $household = $this->householdService->getCurrent($request->user());

        return response()->json(['data' => new HouseholdResource($household)]);
    }

    public function update(UpdateHouseholdRequest $request, Household $household): JsonResponse
    {
        $household->update(['name' => $request->string('name')->toString()]);

        $fresh = $this->householdService->getCurrent($request->user());

        return response()->json(['data' => new HouseholdResource($fresh)]);
    }

    public function invite(InviteMemberRequest $request, Household $household): JsonResponse
    {
        $updated = $this->householdService->inviteByEmail(
            household: $household,
            email: $request->string('email')->toString(),
        );

        return response()->json(['data' => new HouseholdResource($updated)]);
    }

    public function removeMember(Request $request, Household $household, User $user): JsonResponse
    {
        $this->authorize('removeMember', [$household, $user]);

        $updated = $this->householdService->removeMember(
            household: $household,
            actor: $request->user(),
            target: $user,
        );

        return response()->json(['data' => new HouseholdResource($updated)]);
    }
}
