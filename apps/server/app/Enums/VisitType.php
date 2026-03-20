<?php

declare(strict_types=1);

namespace App\Enums;

enum VisitType: string
{
    case Checkup = 'checkup';
    case Treatment = 'treatment';
    case Vaccine = 'vaccine';
    case Emergency = 'emergency';
}
