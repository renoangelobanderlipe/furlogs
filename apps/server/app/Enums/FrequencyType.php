<?php

declare(strict_types=1);

namespace App\Enums;

enum FrequencyType: string
{
    case Daily = 'daily';
    case TwiceDaily = 'twice_daily';
    case Weekly = 'weekly';
    case Monthly = 'monthly';
    case AsNeeded = 'as_needed';

    public function dosesPerDay(): int
    {
        return match ($this) {
            self::TwiceDaily => 2,
            self::AsNeeded => 0,
            default => 1,
        };
    }
}
