<?php

declare(strict_types=1);

namespace App\Enums;

enum UnitType: string
{
    case Kg = 'kg';
    case Can = 'can';
    case Pack = 'pack';
    case Piece = 'piece';
}
