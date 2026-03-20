<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Actions\FoodStock\CheckStockAlerts;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('notifications:check-stock-alerts')]
#[Description('Check food stock levels and dispatch low/critical stock notifications')]
class CheckStockAlertsCommand extends Command
{
    public function __construct(private readonly CheckStockAlerts $checkStockAlerts)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        ($this->checkStockAlerts)();

        $this->info('Stock alert check completed.');

        return self::SUCCESS;
    }
}
