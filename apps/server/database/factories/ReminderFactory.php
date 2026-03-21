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
    /** @var array<string, array<string>> */
    private static array $titlesByType = [
        'vaccination' => [
            'Rabies booster due',
            'DHPP vaccination reminder',
            'Bordetella vaccine renewal',
            'Annual FVRCP booster',
            'Leptospirosis vaccination due',
            'FeLV booster appointment',
        ],
        'medication' => [
            'Refill flea & tick medication',
            'Monthly heartworm prevention dose',
            'Administer joint supplement',
            'Pick up prescription refill',
            'Reorder prescription food',
        ],
        'vet_appointment' => [
            'Schedule annual wellness exam',
            'Follow-up vet appointment',
            'Book dental cleaning',
            'Post-surgery check-up',
            'Lab results review appointment',
        ],
        'food_stock' => [
            'Order more dry food',
            'Restock wet food supply',
            'Buy more dental treats',
            'Pick up prescription diet bags',
        ],
        'custom' => [
            'Apply flea & tick prevention',
            'Trim nails',
            'Groom coat',
            'Clean ears',
            'Monthly weigh-in',
            'Renew pet insurance',
            'Update microchip address',
        ],
    ];

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(ReminderType::cases());
        $titles = self::$titlesByType[$type->value] ?? ['Pet care reminder'];

        return [
            'household_id' => Household::factory(),
            'pet_id' => null,
            'type' => $type->value,
            'title' => fake()->randomElement($titles),
            'description' => fake()->optional(0.4)->sentence(),
            'due_date' => fake()->dateTimeBetween('today', '+6 months')->format('Y-m-d'),
            'is_recurring' => false,
            'recurrence_days' => null,
            'status' => ReminderStatus::Pending->value,
            'source_id' => null,
            'source_type' => null,
        ];
    }

    /**
     * State: upcoming one-off reminder (1–60 days out).
     */
    public function upcoming(): static
    {
        return $this->state(function (): array {
            return [
                'due_date' => fake()->dateTimeBetween('tomorrow', '+60 days')->format('Y-m-d'),
                'status' => ReminderStatus::Pending->value,
            ];
        });
    }

    /**
     * State: overdue reminder (past due date, still pending).
     */
    public function overdue(): static
    {
        return $this->state(function (): array {
            return [
                'due_date' => fake()->dateTimeBetween('-3 months', 'yesterday')->format('Y-m-d'),
                'status' => ReminderStatus::Pending->value,
            ];
        });
    }

    /**
     * State: completed reminder in the past.
     */
    public function completed(): static
    {
        return $this->state(function (): array {
            return [
                'due_date' => fake()->dateTimeBetween('-6 months', 'yesterday')->format('Y-m-d'),
                'status' => ReminderStatus::Completed->value,
            ];
        });
    }

    /**
     * State: snoozed reminder.
     */
    public function snoozed(): static
    {
        return $this->state(function (): array {
            return [
                'due_date' => fake()->dateTimeBetween('-7 days', '+7 days')->format('Y-m-d'),
                'status' => ReminderStatus::Snoozed->value,
            ];
        });
    }

    /**
     * State: recurring reminder.
     */
    public function recurring(): static
    {
        return $this->state(function (): array {
            return [
                'is_recurring' => true,
                'recurrence_days' => fake()->randomElement([7, 14, 30, 90, 180, 365]),
            ];
        });
    }
}
