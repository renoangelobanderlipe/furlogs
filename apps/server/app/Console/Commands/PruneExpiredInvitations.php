<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\InvitationStatus;
use App\Models\HouseholdInvitation;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('invitations:prune')]
#[Description('Delete pending household invitations that have passed their expiry date.')]
class PruneExpiredInvitations extends Command
{
    public function handle(): int
    {
        $deleted = HouseholdInvitation::query()
            ->where('status', InvitationStatus::Pending)
            ->where('expires_at', '<', now())
            ->delete();

        $this->info("Pruned {$deleted} expired invitation(s).");

        return Command::SUCCESS;
    }
}
