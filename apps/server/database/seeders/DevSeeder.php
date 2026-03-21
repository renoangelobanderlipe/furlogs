<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\FoodType;
use App\Enums\FrequencyType;
use App\Enums\HouseholdRole;
use App\Enums\PetSize;
use App\Enums\ReminderType;
use App\Enums\Sex;
use App\Enums\Species;
use App\Enums\UnitType;
use App\Models\FoodConsumptionLog;
use App\Models\FoodConsumptionRate;
use App\Models\FoodProduct;
use App\Models\FoodStockItem;
use App\Models\Household;
use App\Models\Medication;
use App\Models\MedicationAdministration;
use App\Models\Pet;
use App\Models\PetWeight;
use App\Models\Reminder;
use App\Models\User;
use App\Models\Vaccination;
use App\Models\VetClinic;
use App\Models\VetVisit;
use App\Services\HouseholdService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

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

        $devHousehold = $this->householdService->create($devUser, 'Banderlipe Household');

        $member = User::factory()->create([
            'name' => 'Maria Santos',
            'email' => 'member@furlogs.test',
            'password' => bcrypt('password'),
        ]);
        $this->addMember($member, $devHousehold);

        $this->seedDevHousehold($devHousehold, $devUser);

        // ── Two additional households with random owners ──────────────────────
        foreach (range(1, 2) as $_) {
            $owner = User::factory()->create();
            $household = $this->householdService->create($owner, fake()->lastName().' Household');

            User::factory(fake()->numberBetween(1, 2))->create()->each(
                fn (User $u) => $this->addMember($u, $household),
            );

            $this->seedGenericHousehold($household, $owner);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Dev household: richest, specific pets, deep history
    // ─────────────────────────────────────────────────────────────────────────

    private function seedDevHousehold(Household $household, User $owner): void
    {
        // 3 vet clinics with realistic names
        $clinics = collect([
            VetClinic::factory()->create([
                'household_id' => $household->id,
                'name' => 'City Paws Veterinary Clinic',
                'address' => '12 Bark Street, Melbourne VIC 3000',
                'phone' => '(03) 9001 1234',
            ]),
            VetClinic::factory()->create([
                'household_id' => $household->id,
                'name' => 'Metro Animal Hospital',
                'address' => '88 Healey Road, Richmond VIC 3121',
                'phone' => '(03) 9002 5678',
            ]),
            VetClinic::factory()->create([
                'household_id' => $household->id,
                'name' => 'Westside Pet Care Center',
                'address' => '5 Paw Lane, Footscray VIC 3011',
                'phone' => '(03) 9003 9012',
            ]),
        ]);

        // 5 food products with realistic names
        $foodProducts = collect([
            FoodProduct::factory()->dry()->create([
                'household_id' => $household->id,
                'name' => 'Royal Canin Adult Dry',
                'brand' => 'Royal Canin',
            ]),
            FoodProduct::factory()->dry()->create([
                'household_id' => $household->id,
                'name' => 'Purina Pro Plan Puppy Dry',
                'brand' => 'Purina Pro Plan',
            ]),
            FoodProduct::factory()->wet()->create([
                'household_id' => $household->id,
                'name' => "Hill's Science Diet Wet Chicken",
                'brand' => "Hill's Science Diet",
            ]),
            FoodProduct::factory()->dry()->create([
                'household_id' => $household->id,
                'name' => 'Orijen Adult Dog Dry',
                'brand' => 'Orijen',
            ]),
            FoodProduct::factory()->create([
                'household_id' => $household->id,
                'name' => 'Blue Buffalo Dental Chews',
                'brand' => 'Blue Buffalo',
                'type' => FoodType::Treat,
                'unit_weight_grams' => 340,
                'unit_type' => UnitType::Pack,
            ]),
        ]);

        // Stock for each food product
        $finishedStockItems = collect();
        foreach ($foodProducts as $product) {
            // 1 open bag
            FoodStockItem::factory()->open()->create(['food_product_id' => $product->id]);

            // 1-2 sealed bags
            FoodStockItem::factory(fake()->numberBetween(1, 2))->create(['food_product_id' => $product->id]);

            // 1-2 finished bags with consumption logs
            $count = fake()->numberBetween(1, 2);
            for ($i = 0; $i < $count; $i++) {
                $finished = FoodStockItem::factory()->finished()->create(['food_product_id' => $product->id]);
                $finishedStockItems->push($finished);
                $this->createConsumptionLog($finished);
            }
        }

        // Hardcoded dev pets with specific realistic data
        $petMax = Pet::factory()->dog()->create([
            'household_id' => $household->id,
            'name' => 'Max',
            'breed' => 'Labrador Retriever',
            'sex' => Sex::Male->value,
            'birthday' => now()->subYears(3)->subMonths(2)->toDateString(),
            'is_neutered' => true,
            'size' => PetSize::Large->value,
            'notes' => 'Loves fetch and swimming. Allergic to chicken-based food.',
        ]);

        $petLuna = Pet::factory()->cat()->create([
            'household_id' => $household->id,
            'name' => 'Luna',
            'breed' => 'Persian',
            'sex' => Sex::Female->value,
            'birthday' => now()->subYears(5)->subMonths(4)->toDateString(),
            'is_neutered' => true,
            'size' => PetSize::Medium->value,
            'notes' => 'Indoor only. Requires daily coat brushing.',
        ]);

        $petBella = Pet::factory()->dog()->create([
            'household_id' => $household->id,
            'name' => 'Bella',
            'breed' => 'Golden Retriever',
            'sex' => Sex::Female->value,
            'birthday' => now()->subYears(2)->subMonths(6)->toDateString(),
            'is_neutered' => false,
            'size' => PetSize::Large->value,
            'notes' => 'Currently on puppy food. Next heat cycle expected in 2 months.',
        ]);

        $petMilo = Pet::factory()->cat()->create([
            'household_id' => $household->id,
            'name' => 'Milo',
            'breed' => 'Maine Coon',
            'sex' => Sex::Male->value,
            'birthday' => now()->subYears(1)->subMonths(8)->toDateString(),
            'is_neutered' => false,
            'size' => PetSize::Medium->value,
            'notes' => 'Very playful. Prone to hairballs.',
        ]);

        $devPets = collect([$petMax, $petLuna, $petBella, $petMilo]);

        // Assign food consumption rates (each pet uses 1-2 food products)
        $this->createConsumptionRates($petMax, $foodProducts, [0, 3]);       // Royal Canin + Orijen
        $this->createConsumptionRates($petLuna, $foodProducts, [0, 2]);      // Royal Canin + Hill's wet
        $this->createConsumptionRates($petBella, $foodProducts, [1, 3]);     // Pro Plan Puppy + Orijen
        $this->createConsumptionRates($petMilo, $foodProducts, [2]);         // Hill's wet

        // Seed full history for each dev pet
        $this->seedDevPet($petMax, 32.0, 'dog', $clinics, $household, $owner);
        $this->seedDevPet($petLuna, 4.5, 'cat', $clinics, $household, $owner);
        $this->seedDevPet($petBella, 28.0, 'dog', $clinics, $household, $owner);
        $this->seedDevPet($petMilo, 5.0, 'cat', $clinics, $household, $owner);

        // Household-level reminders
        $this->seedHouseholdReminders($household, $devPets);
    }

    /**
     * Seed a single dev pet with full realistic history.
     *
     * @param  Collection<int, VetClinic>  $clinics
     */
    private function seedDevPet(
        Pet $pet,
        float $baseWeightKg,
        string $speciesKey,
        Collection $clinics,
        Household $household,
        User $owner,
    ): void {
        // 18 weight records over 18 months
        $this->seedWeightHistory($pet, $baseWeightKg, 18);

        // 8-12 vet visits
        $visitCount = fake()->numberBetween(8, 12);
        $visits = collect();
        for ($i = 0; $i < $visitCount; $i++) {
            $clinic = fake()->boolean(75) ? $clinics->random() : null;
            $withFollowUp = fake()->boolean(30);
            $visit = VetVisit::factory()
                ->when($withFollowUp, fn ($f) => $f->withFollowUp())
                ->create([
                    'pet_id' => $pet->id,
                    'clinic_id' => $clinic?->id,
                    'weight_at_visit' => $baseWeightKg + fake()->randomFloat(1, -2.0, 2.0),
                ]);
            $visits->push($visit);
        }

        // 5-8 vaccinations
        $vaccinationCount = fake()->numberBetween(5, 8);
        $vaccineFactory = $speciesKey === 'cat'
            ? Vaccination::factory()->forCat()
            : Vaccination::factory()->forDog();
        for ($i = 0; $i < $vaccinationCount; $i++) {
            $vaccineFactory->create([
                'pet_id' => $pet->id,
                'clinic_id' => fake()->boolean(65) ? $clinics->random()->id : null,
            ]);
        }

        // 2-4 active medications (some linked to vet visits, some standalone)
        $activeMedCount = fake()->numberBetween(2, 4);
        for ($i = 0; $i < $activeMedCount; $i++) {
            $linkedVisit = $i === 0 && $visits->isNotEmpty() ? $visits->random() : null;
            $frequency = fake()->randomElement(FrequencyType::cases());
            $startDaysAgo = fake()->numberBetween(7, 30);

            $medication = Medication::factory()->active()->create([
                'pet_id' => $pet->id,
                'vet_visit_id' => $linkedVisit?->id,
                'frequency' => $frequency->value,
                'start_date' => now()->subDays($startDaysAgo)->toDateString(),
            ]);

            $this->seedAdministrationHistory($medication, $owner, $startDaysAgo);
        }

        // 1-2 completed/past medications
        $pastMedCount = fake()->numberBetween(1, 2);
        Medication::factory($pastMedCount)->completed()->create(['pet_id' => $pet->id]);

        // Pet-level reminders
        $this->seedPetReminders($pet, $household, 3, 5);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Generic households (additional 2)
    // ─────────────────────────────────────────────────────────────────────────

    private function seedGenericHousehold(Household $household, User $owner): void
    {
        $clinics = VetClinic::factory(fake()->numberBetween(2, 3))
            ->create(['household_id' => $household->id]);

        $foodProducts = FoodProduct::factory(fake()->numberBetween(3, 4))
            ->create(['household_id' => $household->id]);

        foreach ($foodProducts as $product) {
            FoodStockItem::factory()->open()->create(['food_product_id' => $product->id]);
            FoodStockItem::factory(fake()->numberBetween(1, 2))->create(['food_product_id' => $product->id]);

            $finishedCount = fake()->numberBetween(1, 2);
            for ($i = 0; $i < $finishedCount; $i++) {
                $finished = FoodStockItem::factory()->finished()->create(['food_product_id' => $product->id]);
                $this->createConsumptionLog($finished);
            }
        }

        $petCount = fake()->numberBetween(2, 4);
        $pets = Pet::factory($petCount)->create(['household_id' => $household->id]);

        foreach ($pets as $pet) {
            $baseWeight = $pet->species === Species::Cat
                ? fake()->randomFloat(1, 3.0, 6.5)
                : fake()->randomFloat(1, 8.0, 30.0);

            $this->seedGenericPet($pet, $baseWeight, $clinics, $household, $owner);

            // Link pet to 1-2 food products
            $productSample = $foodProducts->random(min(2, $foodProducts->count()));
            foreach ($productSample as $product) {
                FoodConsumptionRate::factory()->create([
                    'pet_id' => $pet->id,
                    'food_product_id' => $product->id,
                ]);
            }
        }

        $this->seedHouseholdReminders($household, $pets);
    }

    /**
     * @param  Collection<int, VetClinic>  $clinics
     */
    private function seedGenericPet(
        Pet $pet,
        float $baseWeightKg,
        Collection $clinics,
        Household $household,
        User $owner,
    ): void {
        $this->seedWeightHistory($pet, $baseWeightKg, 12);

        $visitCount = fake()->numberBetween(4, 8);
        for ($i = 0; $i < $visitCount; $i++) {
            VetVisit::factory()->create([
                'pet_id' => $pet->id,
                'clinic_id' => fake()->boolean(65) ? $clinics->random()->id : null,
            ]);
        }

        Vaccination::factory(fake()->numberBetween(3, 5))->create([
            'pet_id' => $pet->id,
            'clinic_id' => fake()->boolean(60) ? $clinics->random()->id : null,
        ]);

        $activeMedCount = fake()->numberBetween(1, 2);
        for ($i = 0; $i < $activeMedCount; $i++) {
            $frequency = fake()->randomElement(FrequencyType::cases());
            $startDaysAgo = fake()->numberBetween(7, 21);

            $medication = Medication::factory()->active()->create([
                'pet_id' => $pet->id,
                'frequency' => $frequency->value,
                'start_date' => now()->subDays($startDaysAgo)->toDateString(),
            ]);

            $this->seedAdministrationHistory($medication, $owner, $startDaysAgo);
        }

        Medication::factory(1)->completed()->create(['pet_id' => $pet->id]);

        $this->seedPetReminders($pet, $household, 2, 3);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Shared helpers
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

    /**
     * Seed realistic weight records spread over $months months with gradual changes.
     */
    private function seedWeightHistory(Pet $pet, float $baseWeightKg, int $months): void
    {
        $recordCount = (int) round($months * 1.2); // roughly 1.2 records per month
        $recordCount = max(6, $recordCount);
        $intervalDays = (int) floor(($months * 30) / $recordCount);

        $currentWeight = $baseWeightKg;

        for ($i = $recordCount; $i >= 0; $i--) {
            // Gradual fluctuation: ±4% per interval
            $fluctuation = $currentWeight * fake()->randomFloat(3, -0.04, 0.04);
            $currentWeight = round(max(1.0, $currentWeight + $fluctuation), 2);

            PetWeight::factory()->create([
                'pet_id' => $pet->id,
                'weight_kg' => $currentWeight,
                'recorded_at' => now()->subDays($i * $intervalDays)->toDateString(),
            ]);
        }
    }

    /**
     * Seed dose administration history based on medication frequency.
     */
    private function seedAdministrationHistory(
        Medication $medication,
        User $administeredBy,
        int $daysAgo,
    ): void {
        $frequency = FrequencyType::tryFrom($medication->frequency instanceof FrequencyType
            ? $medication->frequency->value
            : (string) $medication->frequency);

        if ($frequency === null) {
            return;
        }

        $administrationDays = match ($frequency) {
            FrequencyType::Daily => range(1, min($daysAgo, 30)),
            FrequencyType::TwiceDaily => range(1, min($daysAgo, 14)),
            FrequencyType::Weekly => $this->weeklyDays(min($daysAgo, 56), 8),
            FrequencyType::Monthly => $this->monthlyDays(min($daysAgo, 180), 6),
            FrequencyType::AsNeeded => $this->randomDays(min($daysAgo, 30), fake()->numberBetween(3, 7)),
        };

        foreach ($administrationDays as $dayOffset) {
            if ($frequency === FrequencyType::TwiceDaily) {
                // Morning dose
                MedicationAdministration::factory()->create([
                    'medication_id' => $medication->id,
                    'administered_by' => $administeredBy->id,
                    'administered_at' => now()->subDays($dayOffset)->setHour(8)->setMinute(0),
                    'notes' => fake()->boolean(20) ? fake()->sentence() : null,
                ]);
                // Evening dose
                MedicationAdministration::factory()->create([
                    'medication_id' => $medication->id,
                    'administered_by' => $administeredBy->id,
                    'administered_at' => now()->subDays($dayOffset)->setHour(20)->setMinute(0),
                    'notes' => null,
                ]);
            } else {
                $hour = $frequency === FrequencyType::AsNeeded
                    ? fake()->randomElement([8, 12, 18, 20])
                    : 8;

                MedicationAdministration::factory()->create([
                    'medication_id' => $medication->id,
                    'administered_by' => $administeredBy->id,
                    'administered_at' => now()->subDays($dayOffset)->setHour($hour)->setMinute(0),
                    'notes' => fake()->boolean(20) ? fake()->sentence() : null,
                ]);
            }
        }
    }

    /**
     * Seed pet-level reminders: upcoming, overdue, and completed.
     */
    private function seedPetReminders(Pet $pet, Household $household, int $min, int $max): void
    {
        $upcomingCount = fake()->numberBetween($min, $max);
        for ($i = 0; $i < $upcomingCount; $i++) {
            $isRecurring = fake()->boolean(35);
            Reminder::factory()
                ->upcoming()
                ->when($isRecurring, fn ($f) => $f->recurring())
                ->create([
                    'household_id' => $household->id,
                    'pet_id' => $pet->id,
                ]);
        }

        // 1-2 overdue
        Reminder::factory(fake()->numberBetween(1, 2))->overdue()->create([
            'household_id' => $household->id,
            'pet_id' => $pet->id,
        ]);

        // 2-3 completed past reminders
        Reminder::factory(fake()->numberBetween(2, 3))->completed()->create([
            'household_id' => $household->id,
            'pet_id' => $pet->id,
        ]);
    }

    /**
     * Seed household-level reminders (no pet attached).
     *
     * @param  Collection<int, Pet>  $pets
     */
    private function seedHouseholdReminders(Household $household, Collection $pets): void
    {
        // 2-3 upcoming one-off reminders
        Reminder::factory(fake()->numberBetween(2, 3))->upcoming()->create([
            'household_id' => $household->id,
            'pet_id' => null,
            'type' => ReminderType::Custom->value,
            'title' => fake()->randomElement([
                'Apply flea & tick prevention to all pets',
                'Schedule annual vet appointments',
                'Renew pet insurance',
                'Order food stock before running low',
                'Microchip registration renewal',
            ]),
        ]);

        // 1-2 recurring household reminders
        Reminder::factory(fake()->numberBetween(1, 2))->upcoming()->recurring()->create([
            'household_id' => $household->id,
            'pet_id' => null,
            'type' => fake()->randomElement([ReminderType::Medication->value, ReminderType::Custom->value]),
        ]);

        // 1-2 overdue
        Reminder::factory(fake()->numberBetween(1, 2))->overdue()->create([
            'household_id' => $household->id,
            'pet_id' => null,
        ]);

        // 3-4 completed
        Reminder::factory(fake()->numberBetween(3, 4))->completed()->create([
            'household_id' => $household->id,
            'pet_id' => null,
        ]);
    }

    /**
     * Create a FoodConsumptionLog for a finished stock item.
     */
    private function createConsumptionLog(FoodStockItem $stockItem): void
    {
        $actualDailyRate = fake()->randomElement([80, 100, 120, 150, 180, 200, 250, 300, 350]);
        $estimatedRate = $actualDailyRate + fake()->randomFloat(2, -50.0, 50.0);

        FoodConsumptionLog::factory()->create([
            'food_stock_item_id' => $stockItem->id,
            'actual_duration_days' => fake()->numberBetween(15, 45),
            'actual_daily_rate_grams' => $actualDailyRate,
            'estimated_vs_actual_diff' => round($estimatedRate - $actualDailyRate, 2),
        ]);
    }

    /**
     * Create FoodConsumptionRate records linking a pet to specific food products by index.
     *
     * @param  Collection<int, FoodProduct>  $foodProducts
     * @param  array<int>  $productIndexes
     */
    private function createConsumptionRates(Pet $pet, Collection $foodProducts, array $productIndexes): void
    {
        foreach ($productIndexes as $index) {
            $product = $foodProducts->values()->get($index);
            if ($product === null) {
                continue;
            }

            FoodConsumptionRate::factory()->create([
                'pet_id' => $pet->id,
                'food_product_id' => $product->id,
                'daily_amount_grams' => fake()->randomElement([80, 100, 120, 150, 180, 200, 250, 300, 350]),
            ]);
        }
    }

    /**
     * Generate day offsets for weekly administration (one per week).
     *
     * @return array<int>
     */
    private function weeklyDays(int $maxDaysAgo, int $count): array
    {
        $days = [];
        for ($i = 0; $i < $count; $i++) {
            $days[] = $i * 7 + 1;
            if (end($days) > $maxDaysAgo) {
                array_pop($days);
                break;
            }
        }

        return $days;
    }

    /**
     * Generate day offsets for monthly administration (one per ~30 days).
     *
     * @return array<int>
     */
    private function monthlyDays(int $maxDaysAgo, int $count): array
    {
        $days = [];
        for ($i = 0; $i < $count; $i++) {
            $day = $i * 30 + 1;
            if ($day > $maxDaysAgo) {
                break;
            }
            $days[] = $day;
        }

        return $days;
    }

    /**
     * Generate a random set of unique day offsets for as-needed administration.
     *
     * @return array<int>
     */
    private function randomDays(int $maxDaysAgo, int $count): array
    {
        $available = range(1, $maxDaysAgo);
        shuffle($available);

        return array_slice($available, 0, min($count, count($available)));
    }
}
