<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\FoodStockItem;
use App\Models\Pet;
use App\Models\Reminder;
use App\Models\VetVisit;

class DashboardService
{
    public function __construct(private readonly FoodStockService $foodStockService) {}

    /**
     * Aggregate all dashboard summary data for a household, optionally filtered to one pet.
     *
     * Returns pet summaries, upcoming reminders, stock status, vet visit stats,
     * and a month-over-month spend delta.
     *
     * @return array<string, mixed>
     */
    public function getSummary(string $householdId, ?string $petId = null): array
    {
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

        // Include Snoozed so reminders re-surface after their snooze window.
        $upcomingReminderCount = Reminder::query()
            ->upcoming()
            ->when($petId, fn ($q) => $q->where('pet_id', $petId))
            ->count();

        $upcomingReminderItems = Reminder::query()
            ->with(['pet'])
            ->upcoming()
            ->when($petId, fn ($q) => $q->where('pet_id', $petId))
            ->orderBy('due_date')
            ->limit(4)
            ->get()
            ->map(fn (Reminder $r) => [
                'id' => $r->id,
                'title' => $r->title,
                'type' => $r->type->value,
                'dueDate' => $r->due_date->toDateString(),
                'urgency' => $r->urgency(),
                'petName' => $r->pet?->name,
            ])->values()->all();

        $yearStart = now()->startOfYear()->toDateString();
        $ytdBase = VetVisit::query()
            ->when($petId, fn ($q) => $q->where('pet_id', $petId))
            ->where('visit_date', '>=', $yearStart);

        /** @var array{count: int|string, total: int|string}|null $ytdStats */
        $ytdStats = (clone $ytdBase)
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(cost), 0) as total')
            ->first()
            ?->toArray();

        $ytdVisitCount = (int) ($ytdStats['count'] ?? 0);
        $ytdSpend = (float) ($ytdStats['total'] ?? 0);

        $lastVisit = VetVisit::query()
            ->with('pet')
            ->when($petId, fn ($q) => $q->where('pet_id', $petId))
            ->orderBy('visit_date', 'desc')
            ->first();

        $thisMonthStart = now()->startOfMonth()->toDateString();
        $lastMonthStart = now()->subMonth()->startOfMonth()->toDateString();
        $lastMonthEnd = now()->subMonth()->endOfMonth()->toDateString();

        $currentMonthVetSpend = (float) VetVisit::query()
            ->when($petId, fn ($q) => $q->where('pet_id', $petId))
            ->where('visit_date', '>=', $thisMonthStart)
            ->sum('cost');

        $currentMonthFoodSpend = (float) FoodStockItem::query()
            ->where('purchased_at', '>=', $thisMonthStart)
            ->sum('purchase_cost');

        $currentMonthSpend = $currentMonthVetSpend + $currentMonthFoodSpend;

        $lastMonthVetSpend = (float) VetVisit::query()
            ->when($petId, fn ($q) => $q->where('pet_id', $petId))
            ->whereBetween('visit_date', [$lastMonthStart, $lastMonthEnd])
            ->sum('cost');

        $lastMonthFoodSpend = (float) FoodStockItem::query()
            ->whereBetween('purchased_at', [$lastMonthStart, $lastMonthEnd])
            ->sum('purchase_cost');

        $lastMonthSpend = $lastMonthVetSpend + $lastMonthFoodSpend;
        $changePercent = $lastMonthSpend > 0
            ? round((($currentMonthSpend - $lastMonthSpend) / $lastMonthSpend) * 100, 1)
            : null;

        $projections = $this->foodStockService->getProjections($householdId);
        $projectionsCollection = collect($projections);

        $lowCount = $projectionsCollection->filter(fn ($p) => $p['projection']?->status === 'low')->count();
        $criticalCount = $projectionsCollection->filter(fn ($p) => $p['projection']?->status === 'critical')->count();

        $worstProjection = $projectionsCollection
            ->filter(fn ($p) => $p['projection'] !== null)
            ->sortBy(fn ($p) => $p['projection']->daysRemaining)
            ->first();

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

        return [
            'petSummaries' => $petSummaries,
            'upcomingReminders' => [
                'count' => $upcomingReminderCount,
                'items' => $upcomingReminderItems,
            ],
            'stockStatus' => $stockStatus,
            'vetVisitStats' => [
                'countThisYear' => $ytdVisitCount,
                'totalSpendThisYear' => $ytdSpend,
                'lastVisitDate' => $lastVisit?->visit_date->toDateString(),
                'lastVisitPetName' => $lastVisit?->pet?->name,
            ],
            'monthlySpend' => [
                'currentMonth' => $currentMonthSpend,
                'previousMonth' => $lastMonthSpend,
                'changePercent' => $changePercent,
            ],
        ];
    }
}
