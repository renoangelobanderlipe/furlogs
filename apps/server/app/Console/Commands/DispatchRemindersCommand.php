<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\ReminderStatus;
use App\Enums\ReminderType;
use App\Models\Reminder;
use App\Notifications\MedicationReminderNotification;
use App\Notifications\UpcomingVaccinationNotification;
use App\Notifications\VetVisitFollowUpNotification;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

#[Signature('notifications:dispatch-reminders')]
#[Description('Dispatch due reminder notifications to household members')]
class DispatchRemindersCommand extends Command
{
    public function handle(): int
    {
        $reminders = Reminder::query()
            ->withoutGlobalScopes()
            ->where('status', ReminderStatus::Pending)
            ->where('due_date', '<=', now()->addDays(7)->toDateString())
            ->with(['pet', 'household.members'])
            ->get();

        $dispatched = 0;
        $errors = 0;

        foreach ($reminders as $reminder) {
            try {
                $this->processReminder($reminder);
                $dispatched++;
            } catch (\Throwable $e) {
                $errors++;
                Log::error('Failed to dispatch reminder notification', [
                    'reminder_id' => $reminder->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info("Dispatched notifications for {$dispatched} reminder(s). Errors: {$errors}.");

        return self::SUCCESS;
    }

    private function processReminder(Reminder $reminder): void
    {
        $pet = $reminder->pet;
        $petName = $pet !== null ? $pet->name : 'your pet';
        $household = $reminder->household;
        $members = $household !== null ? $household->members : collect();

        $notification = match ($reminder->type) {
            ReminderType::Vaccination => new UpcomingVaccinationNotification($reminder, $petName),
            ReminderType::Medication => new MedicationReminderNotification($reminder, $petName),
            ReminderType::VetAppointment => new VetVisitFollowUpNotification($reminder, $petName),
            default => null,
        };

        if ($notification !== null) {
            foreach ($members as $member) {
                $member->notify($notification);
            }
        }

        // Advance recurring reminders
        if ($reminder->is_recurring && $reminder->recurrence_days !== null) {
            $reminder->update([
                'due_date' => $reminder->due_date->addDays($reminder->recurrence_days),
            ]);
        } elseif (! $reminder->is_recurring && $reminder->due_date->lte(now()->startOfDay())) {
            // Non-recurring reminders that are due today or overdue get completed
            $reminder->update(['status' => ReminderStatus::Completed]);
        }
    }
}
