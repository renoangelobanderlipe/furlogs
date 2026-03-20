<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Household;
use App\Models\VetClinic;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VetClinic>
 */
class VetClinicFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'household_id' => Household::factory(),
            'name' => fake()->company().' Vet Clinic',
            'address' => fake()->optional()->address(),
            'phone' => fake()->optional()->phoneNumber(),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
