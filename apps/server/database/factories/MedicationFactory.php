<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Medication;
use App\Models\Pet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Medication>
 */
class MedicationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-6 months', 'today');

        return [
            'pet_id' => Pet::factory(),
            'vet_visit_id' => null,
            'name' => fake()->randomElement(['Amoxicillin', 'Metronidazole', 'Prednisolone', 'Enalapril', 'Furosemide']),
            'dosage' => fake()->optional()->randomElement(['10mg', '25mg', '50mg', '100mg']),
            'frequency' => fake()->optional()->randomElement(['Once daily', 'Twice daily', 'Every 8 hours']),
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => fake()->optional()->dateTimeBetween('tomorrow', '+3 months')?->format('Y-m-d'),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
