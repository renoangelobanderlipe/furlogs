<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Medication;
use App\Models\MedicationAdministration;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<MedicationAdministration> */
class MedicationAdministrationFactory extends Factory
{
    protected $model = MedicationAdministration::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'medication_id' => Medication::factory(),
            'administered_by' => User::factory(),
            'administered_at' => now(),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }

    public function today(): static
    {
        return $this->state(['administered_at' => now()]);
    }

    public function yesterday(): static
    {
        return $this->state(['administered_at' => now()->subDay()]);
    }

    public function forMedication(Medication $medication): static
    {
        return $this->state(['medication_id' => $medication->id]);
    }
}
