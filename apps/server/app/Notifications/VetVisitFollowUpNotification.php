<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Reminder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VetVisitFollowUpNotification extends Notification implements ShouldQueue
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
        $daysUntilDue = (int) now()->startOfDay()->diffInDays($this->reminder->due_date, false);

        return [
            'type' => 'vet_follow_up',
            'pet_id' => $this->reminder->pet_id,
            'pet_name' => $this->petName,
            'title' => $this->reminder->title,
            'due_date' => $this->reminder->due_date->format('Y-m-d'),
            'urgency' => match (true) {
                $daysUntilDue <= 3 => 'high',
                $daysUntilDue <= 7 => 'medium',
                default => 'low',
            },
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
