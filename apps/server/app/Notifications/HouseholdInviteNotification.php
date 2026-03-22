<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

// TODO: Re-add `implements ShouldQueue` + `use Queueable` + `$this->onQueue('notifications')`
//       once Laravel Cloud supports queue workers. Removed temporarily because queued jobs
//       sit in the jobs table unprocessed without a running worker.
class HouseholdInviteNotification extends Notification
{
    public function __construct(
        public readonly string $token,
        public readonly string $householdName,
        public readonly string $inviterName,
    ) {}

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
                'inviteUrl' => $this->inviteUrl(),
                'householdName' => $this->householdName,
                'inviterName' => $this->inviterName,
            ]);
    }

    private function inviteUrl(): string
    {
        return config('app.frontend_url').'/invitations/'.$this->token;
    }
}
