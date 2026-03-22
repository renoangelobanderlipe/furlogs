<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\CreateHouseholdRequest;
use App\Http\Requests\InviteMemberRequest;
use App\Http\Requests\SwitchHouseholdRequest;
use App\Http\Requests\UpdateHouseholdRequest;
use App\Http\Resources\HouseholdResource;
use App\Http\Resources\UserHouseholdResource;
use App\Models\Household;
use App\Models\HouseholdInvitation;
use App\Models\User;
use App\Services\HouseholdService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

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
        $fresh = $this->householdService->rename(
            household: $household,
            name: $request->string('name')->toString(),
        );

        return response()->json(['data' => new HouseholdResource($fresh)]);
    }

    public function invite(InviteMemberRequest $request, Household $household): JsonResponse
    {
        $this->householdService->inviteByEmail(
            household: $household,
            email: $request->string('email')->toString(),
            actor: $request->user(),
        );

        return response()->json(['message' => 'Invitation sent.'], 201);
    }

    public function cancelInvitation(Request $request, Household $household, HouseholdInvitation $invitation): JsonResponse
    {
        $this->authorize('cancelInvitation', $household);

        abort_unless($invitation->household_id === $household->id, 404);

        if (! $invitation->isPending()) {
            throw ValidationException::withMessages([
                'invitation' => ['Only pending invitations can be cancelled.'],
            ]);
        }

        $invitation->delete();

        return response()->json(['message' => 'Invitation cancelled.']);
    }

    public function transferOwnership(Request $request, Household $household, User $user): JsonResponse
    {
        $this->authorize('transferOwnership', $household);

        $updated = $this->householdService->transferOwnership(
            household: $household,
            actor: $request->user(),
            newOwner: $user,
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

    public function userHouseholds(Request $request): JsonResponse
    {
        $households = $this->householdService->getUserHouseholds($request->user());

        return response()->json(['data' => UserHouseholdResource::collection($households)]);
    }

    public function switchHousehold(SwitchHouseholdRequest $request): JsonResponse
    {
        $household = $this->householdService->switchHousehold(
            user: $request->user(),
            householdId: $request->string('household_id')->toString(),
        );

        return response()->json(['data' => ['id' => $household->id, 'name' => $household->name]]);
    }

    public function destroy(Household $household): Response
    {
        $this->authorize('delete', $household);

        $this->householdService->delete($household);

        return response()->noContent();
    }
}
