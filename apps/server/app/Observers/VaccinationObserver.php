<?php

declare(strict_types=1);

namespace App\Observers;

use App\Enums\ReminderStatus;
use App\Enums\ReminderType;
use App\Models\Pet;
use App\Models\Reminder;
use App\Models\Vaccination;
use Illuminate\Support\Facades\Log;

class VaccinationObserver
{
    /**
     * Auto-create a Reminder when a Vaccination with a next_due_date is created.
     */
    public function created(Vaccination $vaccination): void
    {
        try {
            if ($vaccination->next_due_date !== null) {
                $this->createReminder($vaccination);
            }
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
        try {
            // Remove any existing pending reminder for this vaccination
            Reminder::query()
                ->where('source_type', Vaccination::class)
                ->where('source_id', $vaccination->id)
                ->where('status', ReminderStatus::Pending)
                ->delete();

            if ($vaccination->next_due_date !== null) {
                $this->createReminder($vaccination);
            }
        } catch (\Throwable $e) {
            Log::error('Failed to sync vaccination reminder', [
                'vaccination_id' => $vaccination->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create a new Pending reminder for the given vaccination.
     * Uses withoutGlobalScopes to resolve household_id even when the pet's
     * global scope would otherwise filter it out.
     */
    private function createReminder(Vaccination $vaccination): void
    {
        $householdId = Pet::query()
            ->withoutGlobalScopes()
            ->where('id', $vaccination->pet_id)
            ->value('household_id');

        Reminder::query()->create([
            'household_id' => $householdId,
            'pet_id' => $vaccination->pet_id,
            'type' => ReminderType::Vaccination,
            'title' => "Vaccination due: {$vaccination->vaccine_name}",
            'due_date' => $vaccination->next_due_date,
            'is_recurring' => false,
            'status' => ReminderStatus::Pending,
            'source_id' => $vaccination->id,
            'source_type' => Vaccination::class,
        ]);
    }
}
