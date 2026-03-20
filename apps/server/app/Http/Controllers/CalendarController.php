<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\ReminderStatus;
use App\Enums\ReminderType;
use App\Models\Reminder;
use App\Models\Vaccination;
use App\Models\VetVisit;
use App\Services\FoodStockService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    public function __construct(private readonly FoodStockService $foodStockService) {}

    public function events(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start' => ['required', 'date'],
            'end' => ['required', 'date'],
        ]);

        $start = Carbon::parse($validated['start'])->startOfDay();
        $end = Carbon::parse($validated['end'])->endOfDay();

        $events = collect();

        // Vet visits (blue) — past visits in range
        VetVisit::query()
            ->with(['pet'])
            ->whereBetween('visit_date', [$start->toDateString(), $end->toDateString()])
            ->get()
            ->each(function (VetVisit $visit) use ($events): void {
                $events->push([
                    'id' => "vet-{$visit->id}",
                    'title' => ucfirst($visit->visit_type->value).' — '.$visit->pet->name,
                    'start' => $visit->visit_date->toDateString(),
                    'type' => 'vet_visit',
                    'color' => '#2196f3',
                    'url' => "/vet-visits/{$visit->id}",
                ]);
            });

        // Vaccinations (red) — upcoming by next_due_date
        Vaccination::query()
            ->with(['pet'])
            ->whereNotNull('next_due_date')
            ->whereBetween('next_due_date', [$start->toDateString(), $end->toDateString()])
            ->get()
            ->each(function (Vaccination $vax) use ($events): void {
                $events->push([
                    'id' => "vax-{$vax->id}",
                    'title' => $vax->vaccine_name.' — '.$vax->pet->name,
                    'start' => $vax->next_due_date->toDateString(),
                    'type' => 'vaccination',
                    'color' => '#f44336',
                    'url' => "/vaccinations/{$vax->id}",
                ]);
            });

        // Medication reminders (yellow)
        Reminder::query()
            ->with(['pet'])
            ->where('type', ReminderType::Medication)
            ->where('status', ReminderStatus::Pending)
            ->whereBetween('due_date', [$start->toDateString(), $end->toDateString()])
            ->get()
            ->each(function (Reminder $reminder) use ($events): void {
                $events->push([
                    'id' => "reminder-{$reminder->id}",
                    'title' => $reminder->title,
                    'start' => $reminder->due_date->toDateString(),
                    'type' => 'medication',
                    'color' => '#ff9800',
                    'url' => '/reminders',
                    'petName' => $reminder->pet?->name,
                ]);
            });

        // Food stock alerts (orange) — projected run-out dates
        $householdId = (int) $request->user()->current_household_id;
        $projections = $this->foodStockService->getProjections($householdId);

        $itemsWithProjections = collect($projections)->filter(fn ($p) => $p['projection'] !== null);

        $itemsWithProjections->each(function (array $p) use ($events, $start, $end): void {
            $runsOutDate = $p['projection']->runsOutDate;
            if ($runsOutDate->between($start, $end)) {
                $item = $p['item'];
                $item->loadMissing('foodProduct');
                $events->push([
                    'id' => "stock-{$item->id}",
                    'title' => 'Running low: '.$item->foodProduct->name,
                    'start' => $runsOutDate->toDateString(),
                    'type' => 'stock_alert',
                    'color' => '#ff5722',
                    'url' => '/stock',
                ]);
            }
        });

        return response()->json(['data' => $events->values()->all()]);
    }
}
