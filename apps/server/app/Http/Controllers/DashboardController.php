<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Pet;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $service) {}

    public function summary(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Pet::class);

        $householdId = (string) $request->user()->current_household_id;
        $petId = $request->filled('filter.pet') ? (string) $request->input('filter.pet') : null;

        return response()->json([
            'data' => $this->service->getSummary($householdId, $petId),
        ]);
    }
}
