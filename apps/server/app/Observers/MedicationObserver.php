<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Medication;
use App\Services\ReminderService;
use Illuminate\Support\Facades\Log;

class MedicationObserver
{
    public function __construct(private readonly ReminderService $reminderService) {}

    /**
     * Auto-create a Reminder when a Medication with an end_date is created.
     */
    public function created(Medication $medication): void
    {
        try {
            $this->reminderService->generateFromMedication($medication);
        } catch (\Throwable $e) {
            Log::error('Failed to create medication reminder', [
                'medication_id' => $medication->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Sync the reminder when end_date changes on an existing Medication.
     */
    public function updated(Medication $medication): void
    {
        if (! $medication->wasChanged('end_date')) {
            return;
        }

        try {
            $this->reminderService->generateFromMedication($medication);
        } catch (\Throwable $e) {
            Log::error('Failed to sync medication reminder', [
                'medication_id' => $medication->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
