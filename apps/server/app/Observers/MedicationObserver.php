<?php

declare(strict_types=1);

namespace App\Observers;

use App\Enums\ReminderStatus;
use App\Enums\ReminderType;
use App\Models\Medication;
use App\Models\Pet;
use App\Models\Reminder;
use Illuminate\Support\Facades\Log;

class MedicationObserver
{
    /**
     * Auto-create a Reminder when a Medication with an end_date is created.
     */
    public function created(Medication $medication): void
    {
        try {
            if ($medication->end_date !== null) {
                $this->createReminder($medication);
            }
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
        try {
            // Remove any existing pending reminder for this medication
            Reminder::query()
                ->where('source_type', Medication::class)
                ->where('source_id', $medication->id)
                ->where('status', ReminderStatus::Pending)
                ->delete();

            if ($medication->end_date !== null) {
                $this->createReminder($medication);
            }
        } catch (\Throwable $e) {
            Log::error('Failed to sync medication reminder', [
                'medication_id' => $medication->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create a new Pending reminder for the given medication.
     * Uses withoutGlobalScopes to resolve household_id even when the pet's
     * global scope would otherwise filter it out.
     */
    private function createReminder(Medication $medication): void
    {
        $householdId = Pet::query()
            ->withoutGlobalScopes()
            ->where('id', $medication->pet_id)
            ->value('household_id');

        Reminder::query()->create([
            'household_id' => $householdId,
            'pet_id' => $medication->pet_id,
            'type' => ReminderType::Medication,
            'title' => "Medication ends: {$medication->name}",
            'due_date' => $medication->end_date,
            'is_recurring' => false,
            'status' => ReminderStatus::Pending,
            'source_id' => $medication->id,
            'source_type' => Medication::class,
        ]);
    }
}
