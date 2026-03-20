<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\CreateHouseholdRequest;
use App\Services\HouseholdService;
use Illuminate\Http\JsonResponse;

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
}
