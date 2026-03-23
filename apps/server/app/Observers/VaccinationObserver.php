<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Vaccination;
use App\Services\ReminderService;
use Illuminate\Support\Facades\Log;

class VaccinationObserver
{
    public function __construct(private readonly ReminderService $reminderService) {}

    /**
     * Auto-create a Reminder when a Vaccination with a next_due_date is created.
     */
    public function created(Vaccination $vaccination): void
    {
        try {
            $this->reminderService->generateFromVaccination($vaccination);
        } catch (\Throwable $e) {
            Log::error('Failed to create vaccination reminder', [
                'vaccination_id' => $vaccination->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Sync the reminder when next_due_date changes on an existing Vaccination.
     */
    public function updated(Vaccination $vaccination): void
    {
        if (! $vaccination->wasChanged('next_due_date')) {
            return;
        }

        try {
            $this->reminderService->generateFromVaccination($vaccination);
        } catch (\Throwable $e) {
            Log::error('Failed to sync vaccination reminder', [
                'vaccination_id' => $vaccination->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
