<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\FoodType;
use App\Enums\UnitType;
use App\Models\FoodProduct;
use App\Models\Household;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FoodProduct>
 */
class FoodProductFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'household_id' => Household::factory(),
            'name' => fake()->words(3, true),
            'brand' => fake()->company(),
            'type' => FoodType::Dry,
            'unit_weight_grams' => 5000,
            'unit_type' => UnitType::Kg,
            'alert_threshold_pct' => 25,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
