<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ReminderStatus;
use App\Enums\ReminderType;
use App\Models\Household;
use App\Models\Reminder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Reminder>
 */
class ReminderFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'household_id' => Household::factory(),
            'pet_id' => null,
            'type' => fake()->randomElement(ReminderType::cases())->value,
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->sentence(),
            'due_date' => fake()->dateTimeBetween('today', '+6 months')->format('Y-m-d'),
            'is_recurring' => false,
            'recurrence_days' => null,
            'status' => ReminderStatus::Pending->value,
            'source_id' => null,
            'source_type' => null,
        ];
    }
}
