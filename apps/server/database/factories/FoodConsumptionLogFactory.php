<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\FoodConsumptionLog;
use App\Models\FoodStockItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FoodConsumptionLog>
 */
class FoodConsumptionLogFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'food_stock_item_id' => FoodStockItem::factory(),
            'actual_duration_days' => 20,
            'actual_daily_rate_grams' => 250,
            'estimated_vs_actual_diff' => 0.00,
        ];
    }
}
