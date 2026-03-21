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
    /** @var array<string> */
    private static array $purchaseSources = [
        'Pet Barn', 'PetSmart', 'Chewy', 'Amazon', 'Local Pet Store',
        'Vet Clinic', 'Costco',
    ];

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'food_product_id' => FoodProduct::factory(),
            'status' => StockStatus::Sealed,
            'purchased_at' => fake()->dateTimeBetween('-3 months', 'today')->format('Y-m-d'),
            'quantity' => fake()->numberBetween(1, 3),
            'opened_at' => null,
            'finished_at' => null,
            'purchase_cost' => fake()->optional(0.8)->randomFloat(2, 25.0, 150.0),
            'purchase_source' => fake()->optional(0.75)->randomElement(self::$purchaseSources),
            'notes' => null,
        ];
    }

    public function open(): static
    {
        return $this->state(function (): array {
            $openedDaysAgo = fake()->numberBetween(5, 20);

            return [
                'status' => StockStatus::Open,
                'purchased_at' => now()->subDays($openedDaysAgo + fake()->numberBetween(1, 7))->toDateString(),
                'opened_at' => now()->subDays($openedDaysAgo)->toDateString(),
                'finished_at' => null,
                'purchase_cost' => fake()->randomFloat(2, 25.0, 150.0),
                'purchase_source' => fake()->randomElement(self::$purchaseSources),
            ];
        });
    }

    public function finished(): static
    {
        return $this->state(function (): array {
            $openedDaysAgo = fake()->numberBetween(20, 60);
            $finishedDaysAgo = fake()->numberBetween(1, 30);

            return [
                'status' => StockStatus::Finished,
                'purchased_at' => now()->subDays($openedDaysAgo + fake()->numberBetween(1, 14))->toDateString(),
                'opened_at' => now()->subDays($openedDaysAgo)->toDateString(),
                'finished_at' => now()->subDays($finishedDaysAgo)->toDateString(),
                'purchase_cost' => fake()->randomFloat(2, 25.0, 150.0),
                'purchase_source' => fake()->randomElement(self::$purchaseSources),
            ];
        });
    }
}
