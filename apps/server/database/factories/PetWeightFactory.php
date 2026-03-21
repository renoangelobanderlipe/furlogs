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
        // Realistic weight range covering both cats and dogs (2–35 kg).
        // When created in context of a known pet the seeder overrides weight_kg directly.
        $baseWeight = fake()->randomFloat(1, 3.0, 28.0);
        $fluctuation = fake()->randomFloat(2, -($baseWeight * 0.08), $baseWeight * 0.08);
        $weightKg = round(max(1.5, $baseWeight + $fluctuation), 2);

        return [
            'pet_id' => Pet::factory(),
            'weight_kg' => $weightKg,
            'recorded_at' => fake()->dateTimeBetween('-18 months', 'now')->format('Y-m-d'),
        ];
    }

    /**
     * Weight record for a dog-sized pet (8–35 kg).
     */
    public function dogSized(): static
    {
        return $this->state(function (): array {
            $base = fake()->randomFloat(1, 8.0, 35.0);

            return ['weight_kg' => round($base, 2)];
        });
    }

    /**
     * Weight record for a cat-sized pet (2–7 kg).
     */
    public function catSized(): static
    {
        return $this->state(function (): array {
            $base = fake()->randomFloat(1, 2.0, 7.0);

            return ['weight_kg' => round($base, 2)];
        });
    }
}
