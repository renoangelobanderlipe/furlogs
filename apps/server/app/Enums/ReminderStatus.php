<?php

declare(strict_types=1);

namespace App\Enums;

enum ReminderStatus: string
{
    case Pending = 'pending';
    case Snoozed = 'snoozed';
    case Completed = 'completed';
    case Dismissed = 'dismissed';
}
