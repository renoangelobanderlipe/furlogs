<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Household;
use App\Models\VetClinic;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VetClinic>
 */
class VetClinicFactory extends Factory
{
    /** @var array<string> */
    private static array $clinicNameTemplates = [
        '%s Veterinary Clinic',
        '%s Animal Hospital',
        '%s Pet Care Center',
        '%s Veterinary Practice',
        '%s Animal Wellness Clinic',
        '%s Small Animal Hospital',
    ];

    /** @var array<string> */
    private static array $locationPrefixes = [
        'City', 'Metro', 'Westside', 'Northside', 'Eastside', 'Southside',
        'Central', 'Bayside', 'Hillside', 'Lakeside', 'Riverside', 'Uptown',
        'Downtown', 'Village', 'Parkside', 'Greenfield',
    ];

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $prefix = fake()->randomElement(self::$locationPrefixes);
        $template = fake()->randomElement(self::$clinicNameTemplates);
        $name = sprintf($template, $prefix);

        return [
            'household_id' => Household::factory(),
            'name' => $name,
            'address' => fake()->optional(0.8)->streetAddress().', '.fake()->city().' '.fake()->postcode(),
            'phone' => fake()->optional(0.8)->phoneNumber(),
            'notes' => fake()->optional(0.2)->sentence(),
        ];
    }
}
