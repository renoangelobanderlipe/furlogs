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
        return ['database', 'mail'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'household_invite',
            'title' => "{$this->inviterName} invited you to join {$this->householdName}",
            'invitation_token' => $this->token,
            'inviter_name' => $this->inviterName,
            'household_name' => $this->householdName,
            'invite_url' => $this->inviteUrl(),
        ];
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
