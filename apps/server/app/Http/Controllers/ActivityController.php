<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Resources\ActivityResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityController extends Controller
{
    /**
     * Return paginated activity log entries scoped to the authenticated
     * user's current household (i.e. all actions taken by any member).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $memberIds = $user->currentHousehold->members()->pluck('users.id');

        $paginated = Activity::with('causer')
            ->whereIn('causer_id', $memberIds)
            ->latest()
            ->paginate(30);

        return response()->json([
            'data' => ActivityResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }
}
