<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Pet;
use App\Models\Vaccination;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vaccination>
 */
class VaccinationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $administeredDate = fake()->dateTimeBetween('-2 years', 'today');

        return [
            'pet_id' => Pet::factory(),
            'clinic_id' => null,
            'vaccine_name' => fake()->randomElement(['Rabies', 'DHPP', 'Bordetella', 'Leptospirosis', 'Lyme']),
            'administered_date' => $administeredDate->format('Y-m-d'),
            'next_due_date' => fake()->optional()->dateTimeBetween('tomorrow', '+2 years')?->format('Y-m-d'),
            'vet_name' => fake()->optional()->name(),
            'batch_number' => fake()->optional()->bothify('??###???'),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
