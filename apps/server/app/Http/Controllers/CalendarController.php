<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\ReminderStatus;
use App\Enums\ReminderType;
use App\Models\Medication;
use App\Models\Pet;
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
        $this->authorize('viewAny', Pet::class);

        $validated = $request->validate([
            'start' => ['required', 'date'],
            'end' => ['required', 'date', 'after_or_equal:start'],
        ]);

        $start = Carbon::parse($validated['start'])->startOfDay();
        $end = Carbon::parse($validated['end'])->endOfDay();

        abort_if($start->diffInDays($end) > 62, 422, 'Date range may not exceed 62 days.');

        $events = collect();

        // Vet visits — past visits in range
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
                    'url' => "/vet-visits/{$visit->id}",
                ]);
            });

        // Vaccinations — upcoming by next_due_date
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
                    'url' => "/vaccinations/{$vax->id}",
                ]);
            });

        // Medication reminders
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
                    'type' => 'reminder',
                    'url' => '/reminders',
                    'petName' => $reminder->pet?->name,
                ]);
            });

        // Active medication schedule events — one event per day per active medication
        Medication::query()
            ->with(['pet'])
            ->whereDate('start_date', '<=', $end->toDateString())
            ->where(function ($q) use ($start): void {
                $q->whereNull('end_date')
                    ->orWhereDate('end_date', '>=', $start->toDateString());
            })
            ->get()
            ->each(function (Medication $med) use ($events, $start, $end): void {
                $startDate = $med->start_date;
                $cursor = $startDate->copy()->max($start->copy()->startOfDay());
                $finish = $med->end_date
                    ? $med->end_date->copy()->min($end->copy()->startOfDay())
                    : $end->copy()->startOfDay();

                while ($cursor->lte($finish)) {
                    $events->push([
                        'id' => "med-{$med->id}-{$cursor->toDateString()}",
                        'title' => $med->name.' — '.$med->pet->name,
                        'start' => $cursor->toDateString(),
                        'type' => 'medication',
                        'url' => '/medications',
                        'petName' => $med->pet->name,
                        'medicationId' => $med->id,
                    ]);
                    $cursor->addDay();
                }
            });

        // Food stock alerts — projected run-out dates
        $householdId = (string) $request->user()->current_household_id;
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
                    'url' => '/stock',
                ]);
            }
        });

        return response()->json(['data' => $events->values()->all()]);
    }
}
