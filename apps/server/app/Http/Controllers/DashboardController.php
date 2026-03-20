<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\ReminderStatus;
use App\Models\Pet;
use App\Models\Reminder;
use App\Models\VetVisit;
use App\Services\FoodStockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private readonly FoodStockService $foodStockService) {}

    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();
        $householdId = (int) $user->current_household_id;
        $petId = $request->filled('filter.pet') ? (int) $request->input('filter.pet') : null;

        // Pet summaries (1 query)
        $pets = Pet::query()
            ->with(['latestWeight'])
            ->when($petId, fn ($q) => $q->where('id', $petId))
            ->get();

        $petSummaries = $pets->map(fn (Pet $pet) => [
            'id' => $pet->id,
            'name' => $pet->name,
            'species' => $pet->species->value,
            'avatarUrl' => $pet->getFirstMediaUrl('avatar', 'thumb') ?: null,
            'latestWeight' => $pet->latestWeight ? [
                'weightKg' => (float) $pet->latestWeight->weight_kg,
                'recordedAt' => $pet->latestWeight->recorded_at->toDateString(),
            ] : null,
        ])->values()->all();

        // Upcoming reminders (1 query)
        $upcomingReminders = Reminder::query()
            ->with(['pet'])
            ->where('status', ReminderStatus::Pending)
            ->where('due_date', '>=', now()->toDateString())
            ->when($petId, fn ($q) => $q->where('pet_id', $petId))
            ->orderBy('due_date')
            ->get();

        $upcomingReminderItems = $upcomingReminders->take(4)->map(fn (Reminder $r) => [
            'id' => $r->id,
            'title' => $r->title,
            'type' => $r->type->value,
            'dueDate' => $r->due_date->toDateString(),
            'urgency' => $r->urgency(),
            'petName' => $r->pet?->name,
        ])->values()->all();

        // Vet visit stats: count this year + spend (1 aggregate query)
        $yearStart = now()->startOfYear()->toDateString();
        $ytdStats = VetVisit::query()
            ->when($petId, fn ($q) => $q->where('pet_id', $petId))
            ->where('visit_date', '>=', $yearStart)
            ->selectRaw('COUNT(*) as visit_count, COALESCE(SUM(cost), 0) as total_spend')
            ->first();

        // Last visit with pet name (1 query)
        $lastVisit = VetVisit::query()
            ->with('pet')
            ->when($petId, fn ($q) => $q->where('pet_id', $petId))
            ->orderBy('visit_date', 'desc')
            ->first();

        // Monthly spend: current + previous month (1 aggregate query)
        $thisMonthStart = now()->startOfMonth()->toDateString();
        $lastMonthStart = now()->subMonth()->startOfMonth()->toDateString();

        $spendRow = VetVisit::query()
            ->when($petId, fn ($q) => $q->where('pet_id', $petId))
            ->where('visit_date', '>=', $lastMonthStart)
            ->selectRaw(
                'COALESCE(SUM(CASE WHEN visit_date >= ? THEN cost ELSE 0 END), 0) AS current_month,'
                .' COALESCE(SUM(CASE WHEN visit_date < ? THEN cost ELSE 0 END), 0) AS last_month',
                [$thisMonthStart, $thisMonthStart],
            )
            ->first();

        $currentMonthSpend = (float) $spendRow->current_month;
        $lastMonthSpend = (float) $spendRow->last_month;
        $changePercent = $lastMonthSpend > 0
            ? round((($currentMonthSpend - $lastMonthSpend) / $lastMonthSpend) * 100, 1)
            : null;

        // Stock status via projections
        $projections = $this->foodStockService->getProjections($householdId);
        $projectionsCollection = collect($projections);

        $lowCount = $projectionsCollection->filter(fn ($p) => $p['projection']?->status === 'low')->count();
        $criticalCount = $projectionsCollection->filter(fn ($p) => $p['projection']?->status === 'critical')->count();

        $worstProjection = $projectionsCollection
            ->filter(fn ($p) => $p['projection'] !== null)
            ->sortBy(fn ($p) => $p['projection']->daysRemaining)
            ->first();

        if ($worstProjection !== null) {
            $worstProjection['item']->loadMissing('foodProduct');
        }

        $stockStatus = [
            'totalOpenItems' => count($projections),
            'lowCount' => $lowCount,
            'criticalCount' => $criticalCount,
            'worstItem' => $worstProjection !== null ? [
                'name' => $worstProjection['item']->foodProduct->name,
                'daysLeft' => (int) $worstProjection['projection']->daysRemaining,
                'status' => $worstProjection['projection']->status,
            ] : null,
        ];

        return response()->json([
            'data' => [
                'petSummaries' => $petSummaries,
                'upcomingReminders' => [
                    'count' => $upcomingReminders->count(),
                    'items' => $upcomingReminderItems,
                ],
                'stockStatus' => $stockStatus,
                'vetVisitStats' => [
                    'countThisYear' => (int) $ytdStats->visit_count,
                    'totalSpendThisYear' => (float) $ytdStats->total_spend,
                    'lastVisitDate' => $lastVisit?->visit_date->toDateString(),
                    'lastVisitPetName' => $lastVisit?->pet?->name,
                ],
                'monthlySpend' => [
                    'currentMonth' => $currentMonthSpend,
                    'previousMonth' => $lastMonthSpend,
                    'changePercent' => $changePercent,
                ],
            ],
        ]);
    }
}
