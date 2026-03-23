<?php

declare(strict_types=1);

namespace App\Observers;

use App\Enums\ReminderStatus;
use App\Models\Reminder;
use App\Models\VetVisit;
use App\Services\ReminderService;
use Illuminate\Support\Facades\Log;

class VetVisitObserver
{
    public function __construct(private readonly ReminderService $reminderService) {}

    /**
     * Auto-create a follow-up Reminder when a VetVisit with a follow_up_date is created.
     */
    public function created(VetVisit $vetVisit): void
    {
        if ($vetVisit->follow_up_date === null) {
            return;
        }

        try {
            $this->reminderService->generateFromVetVisit($vetVisit);
        } catch (\Throwable $e) {
            Log::error('Failed to generate follow-up reminder for vet visit', [
                'vet_visit_id' => $vetVisit->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Sync the follow-up reminder when follow_up_date changes on an existing VetVisit.
     */
    public function updated(VetVisit $vetVisit): void
    {
        if (! $vetVisit->wasChanged('follow_up_date')) {
            return;
        }

        try {
            $this->reminderService->generateFromVetVisit($vetVisit);
        } catch (\Throwable $e) {
            Log::error('Failed to update follow-up reminder for vet visit', [
                'vet_visit_id' => $vetVisit->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Clean up any pending follow-up reminders when the visit is soft-deleted.
     */
    public function deleted(VetVisit $vetVisit): void
    {
        Reminder::query()
            ->withoutGlobalScopes()
            ->where('source_type', VetVisit::class)
            ->where('source_id', $vetVisit->id)
            ->where('status', ReminderStatus::Pending)
            ->forceDelete();
    }
}
