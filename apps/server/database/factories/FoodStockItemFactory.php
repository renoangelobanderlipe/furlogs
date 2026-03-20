<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\StockStatus;
use App\Models\FoodProduct;
use App\Models\FoodStockItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FoodStockItem>
 */
class FoodStockItemFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'food_product_id' => FoodProduct::factory(),
            'status' => StockStatus::Sealed,
            'purchased_at' => fake()->date(),
            'quantity' => 1,
            'opened_at' => null,
            'finished_at' => null,
            'purchase_cost' => null,
            'purchase_source' => null,
            'notes' => null,
        ];
    }

    public function open(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => StockStatus::Open,
            'opened_at' => now()->toDateString(),
        ]);
    }

    public function finished(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => StockStatus::Finished,
            'opened_at' => now()->subDays(20)->toDateString(),
            'finished_at' => now()->toDateString(),
        ]);
    }
}
