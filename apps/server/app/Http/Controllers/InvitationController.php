<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Resources\HouseholdInvitationResource;
use App\Http\Resources\HouseholdResource;
use App\Services\InvitationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvitationController extends Controller
{
    public function __construct(private readonly InvitationService $invitationService) {}

    public function show(Request $request, string $token): JsonResponse
    {
        $invitation = $this->invitationService->getByToken($token, $request->user());

        return response()->json(['data' => new HouseholdInvitationResource($invitation)]);
    }

    public function accept(Request $request, string $token): JsonResponse
    {
        $invitation = $this->invitationService->getByToken($token, $request->user());
        $household = $this->invitationService->accept($invitation, $request->user());

        return response()->json(['data' => new HouseholdResource($household)]);
    }

    public function decline(Request $request, string $token): JsonResponse
    {
        $invitation = $this->invitationService->getByToken($token, $request->user());
        $this->invitationService->decline($invitation);

        return response()->json(['message' => 'Invitation declined.']);
    }
}
