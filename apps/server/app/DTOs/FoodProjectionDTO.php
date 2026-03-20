<?php

declare(strict_types=1);

namespace App\DTOs;

use Carbon\Carbon;

readonly class FoodProjectionDTO
{
    public function __construct(
        public int $remainingGrams,
        public float $daysRemaining,
        public Carbon $runsOutDate,
        public string $status,
        public int $totalDailyRate,
        public float $percentageRemaining,
    ) {}

    public static function fromCalculation(
        int $remainingGrams,
        float $daysRemaining,
        Carbon $runsOutDate,
        string $status,
        int $totalDailyRate,
        float $percentageRemaining,
    ): self {
        return new self(
            remainingGrams: $remainingGrams,
            daysRemaining: $daysRemaining,
            runsOutDate: $runsOutDate,
            status: $status,
            totalDailyRate: $totalDailyRate,
            percentageRemaining: $percentageRemaining,
        );
    }
}
