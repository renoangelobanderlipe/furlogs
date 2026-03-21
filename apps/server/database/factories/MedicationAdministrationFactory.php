<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Medication;
use App\Models\MedicationAdministration;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MedicationAdministration>
 */
class MedicationAdministrationFactory extends Factory
{
    protected $model = MedicationAdministration::class;

    /** @var array<int> Realistic administration hours */
    private static array $administrationHours = [8, 12, 20];

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $hour = fake()->randomElement(self::$administrationHours);
        $date = fake()->dateTimeBetween('-30 days', 'now');
        $administeredAt = Carbon::parse($date->format('Y-m-d'))
            ->setHour($hour)
            ->setMinute(fake()->numberBetween(0, 15));

        return [
            'medication_id' => Medication::factory(),
            'administered_by' => User::factory(),
            'administered_at' => $administeredAt,
            'notes' => $this->faker->optional(0.2)->sentence(),
        ];
    }

    public function today(): static
    {
        return $this->state(['administered_at' => now()->setHour(8)->setMinute(0)]);
    }

    public function yesterday(): static
    {
        return $this->state(['administered_at' => now()->subDay()->setHour(8)->setMinute(0)]);
    }

    public function forMedication(Medication $medication): static
    {
        return $this->state(['medication_id' => $medication->id]);
    }

    /**
     * Administration at a specific date and hour.
     */
    public function atDateTime(Carbon $dateTime): static
    {
        return $this->state(['administered_at' => $dateTime]);
    }
}
