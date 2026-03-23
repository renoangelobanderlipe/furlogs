<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Reminder;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

// TODO: Re-add `implements ShouldQueue` + `use Queueable` + `$this->onQueue('notifications')`
//       once Laravel Cloud supports queue workers. Removed temporarily because queued jobs
//       sit in the jobs table unprocessed without a running worker.
class VetVisitFollowUpNotification extends Notification
{
    public function __construct(
        public readonly Reminder $reminder,
        public readonly string $petName,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $prefs = $notifiable->notification_preferences ?? [];

        return ($prefs['followup'] ?? true) === false
            ? ['database']
            : ['database', 'mail'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'vet_follow_up',
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
            ->subject("Vet follow-up approaching for {$this->petName}")
            ->markdown('notifications.vet-follow-up', [
                'reminder' => $this->reminder,
                'petName' => $this->petName,
            ]);
    }
}
