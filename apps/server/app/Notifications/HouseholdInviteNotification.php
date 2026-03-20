<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class HouseholdInviteNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $inviteUrl,
        public readonly string $householdName,
        public readonly string $inviterName,
    ) {
        $this->onQueue('notifications');
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("You're invited to join {$this->householdName} on FurLog")
            ->markdown('notifications.household-invite', [
                'inviteUrl' => $this->inviteUrl,
                'householdName' => $this->householdName,
                'inviterName' => $this->inviterName,
            ]);
    }
}
