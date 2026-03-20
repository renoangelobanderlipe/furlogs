<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Pet;
use App\Models\PetWeight;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PetWeight>
 */
class PetWeightFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'pet_id' => Pet::factory(),
            'weight_kg' => fake()->randomFloat(2, 1, 80),
            'recorded_at' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
        ];
    }
}
