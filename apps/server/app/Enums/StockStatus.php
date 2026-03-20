<?php

declare(strict_types=1);

namespace App\Enums;

enum StockStatus: string
{
    case Sealed = 'sealed';
    case Open = 'open';
    case Finished = 'finished';
}
