<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\InvitationStatus;
use App\Models\Household;
use App\Models\HouseholdInvitation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HouseholdInvitation>
 */
class HouseholdInvitationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'household_id' => Household::factory(),
            'inviter_id' => User::factory(),
            'invitee_id' => User::factory(),
            'token' => bin2hex(random_bytes(32)),
            'status' => InvitationStatus::Pending,
            'expires_at' => now()->addDays(7),
        ];
    }

    public function pending(): static
    {
        return $this->state([
            'status' => InvitationStatus::Pending,
            'expires_at' => now()->addDays(7),
            'accepted_at' => null,
            'declined_at' => null,
        ]);
    }

    public function accepted(): static
    {
        return $this->state([
            'status' => InvitationStatus::Accepted,
            'accepted_at' => now(),
            'declined_at' => null,
        ]);
    }

    public function declined(): static
    {
        return $this->state([
            'status' => InvitationStatus::Declined,
            'declined_at' => now(),
            'accepted_at' => null,
        ]);
    }

    public function expired(): static
    {
        return $this->state([
            'status' => InvitationStatus::Pending,
            'expires_at' => now()->subDay(),
            'accepted_at' => null,
            'declined_at' => null,
        ]);
    }
}
