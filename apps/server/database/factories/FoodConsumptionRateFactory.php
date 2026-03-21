<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\FoodConsumptionRate;
use App\Models\FoodProduct;
use App\Models\Pet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FoodConsumptionRate>
 */
class FoodConsumptionRateFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'food_product_id' => FoodProduct::factory(),
            'pet_id' => Pet::factory(),
            'daily_amount_grams' => fake()->randomElement([80, 100, 120, 150, 180, 200, 250, 300, 350]),
        ];
    }
}
