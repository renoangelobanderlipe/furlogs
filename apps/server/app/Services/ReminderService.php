<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\ReminderStatus;
use App\Enums\ReminderType;
use App\Models\Medication;
use App\Models\Pet;
use App\Models\Reminder;
use App\Models\Vaccination;

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
        $data['status'] ??= ReminderStatus::Pending;

        return Reminder::query()->create($data);
    }

    /**
     * Update an existing Reminder record.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Reminder $reminder, array $data): Reminder
    {
        $reminder->update($data);

        return $reminder->fresh();
    }

    /**
     * Mark a reminder as completed.
     */
    public function complete(Reminder $reminder): Reminder
    {
        $reminder->update(['status' => ReminderStatus::Completed]);

        return $reminder->fresh();
    }

    /**
     * Snooze a reminder by advancing its due date and resetting status to Pending.
     */
    public function snooze(Reminder $reminder, int $days): Reminder
    {
        $reminder->update([
            'due_date' => $reminder->due_date->addDays($days),
            'status' => ReminderStatus::Pending,
        ]);

        return $reminder->fresh();
    }

    /**
     * Dismiss a reminder permanently.
     */
    public function dismiss(Reminder $reminder): Reminder
    {
        $reminder->update(['status' => ReminderStatus::Dismissed]);

        return $reminder->fresh();
    }

    /**
     * Create or update a Reminder for a given Vaccination.
     * Deletes any existing pending reminder before creating a new one when next_due_date is set.
     */
    public function generateFromVaccination(Vaccination $vaccination): ?Reminder
    {
        Reminder::query()
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
     * Create a Reminder for a given Medication if end_date is set.
     * Deletes any existing pending reminder before creating a new one.
     */
    public function generateFromMedication(Medication $medication): ?Reminder
    {
        Reminder::query()
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
