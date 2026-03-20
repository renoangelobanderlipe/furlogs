<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\VisitType;
use App\Models\Pet;
use App\Models\VetVisit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VetVisit>
 */
class VetVisitFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'pet_id' => Pet::factory(),
            'clinic_id' => null,
            'vet_name' => fake()->optional()->name(),
            'visit_date' => fake()->dateTimeBetween('-2 years', 'today')->format('Y-m-d'),
            'visit_type' => fake()->randomElement(VisitType::cases())->value,
            'reason' => fake()->sentence(),
            'diagnosis' => fake()->optional()->paragraph(),
            'treatment' => fake()->optional()->paragraph(),
            'cost' => fake()->optional()->randomFloat(2, 10, 500),
            'weight_at_visit' => fake()->optional()->randomFloat(2, 1, 100),
            'follow_up_date' => null,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
