<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Reminder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MedicationReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Reminder $reminder,
        public readonly string $petName,
    ) {
        $this->onQueue('notifications');
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'medication_reminder',
            'pet_id' => $this->reminder->pet_id,
            'pet_name' => $this->petName,
            'title' => $this->reminder->title,
            'due_date' => $this->reminder->due_date->format('Y-m-d'),
            'urgency' => $this->reminder->urgency(),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Medication reminder for {$this->petName}")
            ->markdown('notifications.medication-reminder', [
                'reminder' => $this->reminder,
                'petName' => $this->petName,
            ]);
    }
}
