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
    /** @var array<string> */
    private static array $dogVaccines = [
        'Rabies', 'DHPP', 'Bordetella', 'Leptospirosis', 'Lyme', 'Canine Influenza',
    ];

    /** @var array<string> */
    private static array $catVaccines = [
        'Rabies', 'FVRCP', 'FeLV', 'Bordetella',
    ];

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $vaccineName = fake()->randomElement(array_merge(self::$dogVaccines, self::$catVaccines));
        $administeredDate = fake()->dateTimeBetween('-2 years', 'today');

        // Rabies is often 3-year; others are 1-year boosters.
        $isRabies = $vaccineName === 'Rabies';
        $dueYears = $isRabies && fake()->boolean(30) ? 3 : 1;
        $nextDue = (clone $administeredDate)->modify("+{$dueYears} years");

        return [
            'pet_id' => Pet::factory(),
            'clinic_id' => null,
            'vaccine_name' => $vaccineName,
            'administered_date' => $administeredDate->format('Y-m-d'),
            'next_due_date' => fake()->optional(0.85)->passthrough($nextDue->format('Y-m-d')),
            'vet_name' => fake()->optional(0.65)->name(),
            'batch_number' => fake()->optional(0.5)->bothify('??###???'),
            'notes' => fake()->optional(0.2)->sentence(),
        ];
    }

    /**
     * State: dog-appropriate vaccines only.
     */
    public function forDog(): static
    {
        return $this->state(function (): array {
            return ['vaccine_name' => fake()->randomElement(self::$dogVaccines)];
        });
    }

    /**
     * State: cat-appropriate vaccines only.
     */
    public function forCat(): static
    {
        return $this->state(function (): array {
            return ['vaccine_name' => fake()->randomElement(self::$catVaccines)];
        });
    }
}
