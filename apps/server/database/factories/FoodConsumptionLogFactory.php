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
        $actualDailyRate = (float) fake()->randomElement([80, 100, 120, 150, 180, 200, 250, 300, 350]);
        $estimatedRate = $actualDailyRate + fake()->randomFloat(2, -50.0, 50.0);
        $diff = round($estimatedRate - $actualDailyRate, 2);

        return [
            'food_stock_item_id' => FoodStockItem::factory(),
            'actual_duration_days' => fake()->numberBetween(15, 45),
            'actual_daily_rate_grams' => (int) $actualDailyRate,
            'estimated_vs_actual_diff' => $diff,
        ];
    }
}
