<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\FrequencyType;
use App\Models\Medication;
use App\Models\Pet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Medication>
 */
class MedicationFactory extends Factory
{
    /** @var array<string> */
    private static array $medicationNames = [
        'Amoxicillin', 'Metronidazole', 'Prednisolone', 'Enalapril', 'Furosemide',
        'Meloxicam', 'Gabapentin', 'Tramadol', 'Doxycycline', 'Cephalexin',
        'Apoquel', 'Cytopoint', 'Vetmedin', 'Atenolol', 'Phenobarbital',
    ];

    /** @var array<string> */
    private static array $dosages = [
        '5mg', '10mg', '25mg', '50mg', '100mg', '200mg', '0.5mg/kg', '1mg/kg',
    ];

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-6 months', 'today');

        return [
            'pet_id' => Pet::factory(),
            'vet_visit_id' => null,
            'name' => fake()->randomElement(self::$medicationNames),
            'dosage' => fake()->optional(0.85)->randomElement(self::$dosages),
            'frequency' => fake()->randomElement(FrequencyType::cases())->value,
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => fake()->optional(0.5)->dateTimeBetween('tomorrow', '+3 months')?->format('Y-m-d'),
            'notes' => fake()->optional(0.3)->sentence(),
        ];
    }

    /**
     * State: active medication (no end date).
     */
    public function active(): static
    {
        return $this->state(function (): array {
            return [
                'start_date' => fake()->dateTimeBetween('-3 months', '-7 days')->format('Y-m-d'),
                'end_date' => null,
            ];
        });
    }

    /**
     * State: completed/past medication.
     */
    public function completed(): static
    {
        return $this->state(function (): array {
            $startDate = fake()->dateTimeBetween('-12 months', '-3 months');
            $endDate = fake()->dateTimeBetween($startDate, '-1 month');

            return [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ];
        });
    }
}
