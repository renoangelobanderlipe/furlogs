<?php

declare(strict_types=1);

namespace App\Enums;

enum FoodType: string
{
    case Dry = 'dry';
    case Wet = 'wet';
    case Treat = 'treat';
    case Supplement = 'supplement';
}
