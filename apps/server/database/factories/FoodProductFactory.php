<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\FoodType;
use App\Enums\UnitType;
use App\Models\FoodProduct;
use App\Models\Household;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FoodProduct>
 */
class FoodProductFactory extends Factory
{
    /** @var array<string> */
    private static array $brands = [
        'Royal Canin', "Hill's Science Diet", 'Purina Pro Plan', 'Blue Buffalo',
        'Orijen', 'Acana', 'Taste of the Wild', 'Eukanuba', 'Iams', 'Wellness',
    ];

    /** @var array<string, array<string>> */
    private static array $typeDescriptors = [
        'dry' => ['Adult Dry', 'Senior Dry', 'Puppy Dry', 'Weight Management', 'Indoor Dry', 'Sensitive Stomach'],
        'wet' => ['Wet Chicken', 'Wet Beef & Gravy', 'Wet Salmon', 'Wet Turkey', 'Pate Adult', 'Chunks in Broth'],
        'treat' => ['Training Treats', 'Dental Chews', 'Soft Bites', 'Freeze-Dried Treats', 'Crunchy Biscuits'],
        'supplement' => ['Joint Support', 'Omega-3 Supplement', 'Probiotic Powder', 'Multivitamin', 'Skin & Coat Oil'],
    ];

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(FoodType::cases());
        $brand = fake()->randomElement(self::$brands);
        $descriptors = self::$typeDescriptors[$type->value] ?? ['Adult Formula'];
        $descriptor = fake()->randomElement($descriptors);

        return [
            'household_id' => Household::factory(),
            'name' => "{$brand} {$descriptor}",
            'brand' => $brand,
            'type' => $type,
            'unit_weight_grams' => fake()->randomElement([1500, 2000, 3000, 4000, 5000, 7000, 12000, 15000]),
            'unit_type' => fake()->randomElement(UnitType::cases()),
            'alert_threshold_pct' => fake()->randomElement([15, 20, 25, 30]),
            'notes' => fake()->optional(0.25)->sentence(),
        ];
    }

    public function dry(): static
    {
        return $this->state(function (): array {
            $brand = fake()->randomElement(self::$brands);
            $descriptor = fake()->randomElement(self::$typeDescriptors['dry']);

            return [
                'name' => "{$brand} {$descriptor}",
                'brand' => $brand,
                'type' => FoodType::Dry,
                'unit_type' => UnitType::Kg,
                'unit_weight_grams' => fake()->randomElement([3000, 5000, 7000, 12000, 15000]),
            ];
        });
    }

    public function wet(): static
    {
        return $this->state(function (): array {
            $brand = fake()->randomElement(self::$brands);
            $descriptor = fake()->randomElement(self::$typeDescriptors['wet']);

            return [
                'name' => "{$brand} {$descriptor}",
                'brand' => $brand,
                'type' => FoodType::Wet,
                'unit_type' => UnitType::Can,
                'unit_weight_grams' => fake()->randomElement([85, 156, 374, 400]),
            ];
        });
    }
}
