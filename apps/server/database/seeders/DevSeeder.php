<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\HouseholdRole;
use App\Enums\ReminderStatus;
use App\Models\FoodProduct;
use App\Models\FoodStockItem;
use App\Models\Household;
use App\Models\Medication;
use App\Models\Pet;
use App\Models\PetWeight;
use App\Models\Reminder;
use App\Models\User;
use App\Models\Vaccination;
use App\Models\VetClinic;
use App\Models\VetVisit;
use App\Services\HouseholdService;
use Illuminate\Database\Seeder;

class DevSeeder extends Seeder
{
    public function __construct(private readonly HouseholdService $householdService) {}

    public function run(): void
    {
        // ── Primary dev account ───────────────────────────────────────────────
        $devUser = User::factory()->create([
            'name' => 'Reno Banderlipe',
            'email' => 'dev@furlogs.test',
            'password' => bcrypt('password'),
        ]);

        $household = $this->householdService->create($devUser, 'Banderlipe Household');

        $this->seedHousehold($household);

        // Add a second member to the dev household
        $member = User::factory()->create([
            'name' => 'Maria Santos',
            'email' => 'member@furlogs.test',
            'password' => bcrypt('password'),
        ]);
        $this->addMember($member, $household);

        // ── Two additional households with random owners ──────────────────────
        foreach (range(1, 2) as $_) {
            $owner = User::factory()->create();
            $h = $this->householdService->create($owner, fake()->lastName().' Household');
            $this->seedHousehold($h);

            // 1–2 extra members each
            User::factory(fake()->numberBetween(1, 2))->create()->each(
                fn (User $u) => $this->addMember($u, $h),
            );
        }
    }

    // ─────────────────────────────────────────────────────────────────────────

    private function addMember(User $user, Household $household): void
    {
        $household->householdMembers()->create([
            'user_id' => $user->id,
            'role' => HouseholdRole::Member,
            'joined_at' => now(),
        ]);

        $user->update(['current_household_id' => $household->id]);

        setPermissionsTeamId($household->id);
        $user->assignRole('member');
    }

    private function seedHousehold(Household $household): void
    {
        // Vet clinics (2–3)
        $clinics = VetClinic::factory(fake()->numberBetween(2, 3))
            ->create(['household_id' => $household->id]);

        // Food products + stock
        $foodProducts = FoodProduct::factory(fake()->numberBetween(3, 5))
            ->create(['household_id' => $household->id]);

        foreach ($foodProducts as $product) {
            FoodStockItem::factory()->open()->create(['food_product_id' => $product->id]);
            FoodStockItem::factory(fake()->numberBetween(1, 2))->create(['food_product_id' => $product->id]);
            FoodStockItem::factory(fake()->numberBetween(1, 2))->finished()->create(['food_product_id' => $product->id]);
        }

        // Household-level reminders (pending + some completed for history)
        Reminder::factory(fake()->numberBetween(3, 5))->create([
            'household_id' => $household->id,
        ]);

        Reminder::factory(fake()->numberBetween(2, 4))->create([
            'household_id' => $household->id,
            'status' => ReminderStatus::Completed->value,
            'due_date' => fake()->dateTimeBetween('-3 months', 'yesterday')->format('Y-m-d'),
        ]);

        // Pets (3–6)
        $pets = Pet::factory(fake()->numberBetween(3, 6))
            ->create(['household_id' => $household->id]);

        foreach ($pets as $pet) {
            $this->seedPet($pet, $clinics->random(), $household);
        }
    }

    private function seedPet(Pet $pet, VetClinic $clinic, Household $household): void
    {
        // Weight history (6–18 entries over the past year)
        PetWeight::factory(fake()->numberBetween(6, 18))->create(['pet_id' => $pet->id]);

        // Vet visits (4–10), 70% linked to clinic
        VetVisit::factory(fake()->numberBetween(4, 10))->create([
            'pet_id' => $pet->id,
            'clinic_id' => fake()->boolean(70) ? $clinic->id : null,
        ]);

        // Vaccinations (3–6), 60% linked to clinic
        Vaccination::factory(fake()->numberBetween(3, 6))->create([
            'pet_id' => $pet->id,
            'clinic_id' => fake()->boolean(60) ? $clinic->id : null,
        ]);

        // Medications (1–3)
        Medication::factory(fake()->numberBetween(1, 3))->create([
            'pet_id' => $pet->id,
        ]);

        // Per-pet reminders (2–4)
        Reminder::factory(fake()->numberBetween(2, 4))->create([
            'household_id' => $household->id,
            'pet_id' => $pet->id,
        ]);
    }
}
