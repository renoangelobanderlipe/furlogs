<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\ReminderStatus;
use App\Enums\ReminderType;
use App\Models\Medication;
use App\Models\Pet;
use App\Models\Reminder;
use App\Models\Vaccination;
use App\Models\VetVisit;

class ReminderService
{
    /**
     * Create a new Reminder record.
     * Defaults status to Pending if not explicitly provided.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Reminder
    {
        $data['status'] = ReminderStatus::Pending;

        return Reminder::query()->create($data);
    }

    /**
     * Delete a reminder record.
     */
    public function delete(Reminder $reminder): void
    {
        $reminder->delete();
    }

    /**
     * Update an existing Reminder record.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Reminder $reminder, array $data): Reminder
    {
        $reminder->update($data);

        return $reminder;
    }

    /**
     * Mark a reminder as completed. Spawns the next occurrence for recurring reminders.
     */
    public function complete(Reminder $reminder): Reminder
    {
        $reminder->update(['status' => ReminderStatus::Completed]);
        $this->spawnNextOccurrence($reminder);

        return $reminder;
    }

    /**
     * Snooze a reminder by advancing its due date and resetting status to Pending.
     */
    public function snooze(Reminder $reminder, int $days): Reminder
    {
        $reminder->update([
            'due_date' => $reminder->due_date->addDays($days),
            'status' => ReminderStatus::Snoozed,
        ]);

        return $reminder;
    }

    /**
     * Dismiss a reminder. Spawns the next occurrence for recurring reminders.
     */
    public function dismiss(Reminder $reminder): Reminder
    {
        $reminder->update(['status' => ReminderStatus::Dismissed]);
        $this->spawnNextOccurrence($reminder);

        return $reminder;
    }

    /**
     * If the reminder is recurring, create the next occurrence at due_date + recurrence_days.
     */
    private function spawnNextOccurrence(Reminder $reminder): void
    {
        if (! $reminder->is_recurring || ! $reminder->recurrence_days) {
            return;
        }

        $this->create([
            'household_id' => $reminder->household_id,
            'pet_id' => $reminder->pet_id,
            'source_id' => $reminder->source_id,
            'source_type' => $reminder->source_type,
            'title' => $reminder->title,
            'type' => $reminder->type,
            'due_date' => $reminder->due_date->addDays($reminder->recurrence_days),
            'is_recurring' => true,
            'recurrence_days' => $reminder->recurrence_days,
        ]);
    }

    /**
     * Create or update a Reminder for a given Vaccination.
     * Deletes any existing pending reminder before creating a new one when next_due_date is set.
     */
    public function generateFromVaccination(Vaccination $vaccination): ?Reminder
    {
        Reminder::query()
            ->withoutGlobalScopes()
            ->where('source_type', Vaccination::class)
            ->where('source_id', $vaccination->id)
            ->where('status', ReminderStatus::Pending)
            ->delete();

        if ($vaccination->next_due_date === null) {
            return null;
        }

        $householdId = Pet::query()
            ->withoutGlobalScopes()
            ->where('id', $vaccination->pet_id)
            ->value('household_id');

        return Reminder::query()->create([
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

    /**
     * Create or update a Reminder for a given VetVisit if follow_up_date is set.
     * Deletes any existing pending reminder before creating a new one.
     */
    public function generateFromVetVisit(VetVisit $vetVisit): ?Reminder
    {
        Reminder::query()
            ->withoutGlobalScopes()
            ->where('source_type', VetVisit::class)
            ->where('source_id', $vetVisit->id)
            ->where('status', ReminderStatus::Pending)
            ->delete();

        if ($vetVisit->follow_up_date === null) {
            return null;
        }

        $householdId = Pet::query()
            ->withoutGlobalScopes()
            ->where('id', $vetVisit->pet_id)
            ->value('household_id');

        return Reminder::query()->create([
            'household_id' => $householdId,
            'pet_id' => $vetVisit->pet_id,
            'type' => ReminderType::VetAppointment,
            'title' => 'Follow-up visit due',
            'due_date' => $vetVisit->follow_up_date,
            'is_recurring' => false,
            'status' => ReminderStatus::Pending,
            'source_id' => $vetVisit->id,
            'source_type' => VetVisit::class,
        ]);
    }

    /**
     * Create a Reminder for a given Medication if end_date is set.
     * Deletes any existing pending reminder before creating a new one.
     */
    public function generateFromMedication(Medication $medication): ?Reminder
    {
        Reminder::query()
            ->withoutGlobalScopes()
            ->where('source_type', Medication::class)
            ->where('source_id', $medication->id)
            ->where('status', ReminderStatus::Pending)
            ->delete();

        if ($medication->end_date === null) {
            return null;
        }

        $householdId = Pet::query()
            ->withoutGlobalScopes()
            ->where('id', $medication->pet_id)
            ->value('household_id');

        return Reminder::query()->create([
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
