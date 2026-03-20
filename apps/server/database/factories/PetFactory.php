<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\PetSize;
use App\Enums\Sex;
use App\Enums\Species;
use App\Models\Household;
use App\Models\Pet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pet>
 */
class PetFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'household_id' => Household::factory(),
            'name' => fake()->firstName(),
            'species' => fake()->randomElement(Species::cases())->value,
            'breed' => fake()->optional()->word(),
            'sex' => fake()->randomElement(Sex::cases())->value,
            'birthday' => fake()->optional()->dateTimeBetween('-15 years', '-1 month')?->format('Y-m-d'),
            'is_neutered' => fake()->boolean(),
            'size' => fake()->randomElement(PetSize::cases())->value,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
