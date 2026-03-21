<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\PetSize;
use App\Enums\Sex;
use App\Enums\Species;
use App\Models\Household;
use App\Models\Pet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pet>
 */
class PetFactory extends Factory
{
    /** @var array<string> */
    private static array $petNames = [
        'Max', 'Bella', 'Luna', 'Charlie', 'Cooper', 'Daisy', 'Milo', 'Sadie',
        'Buddy', 'Molly', 'Rocky', 'Lola', 'Bear', 'Maggie', 'Zoe', 'Oliver',
        'Sophie', 'Duke', 'Chloe', 'Buster', 'Nala', 'Tucker', 'Penny', 'Leo',
        'Rosie', 'Simba', 'Willow', 'Thor',
    ];

    /** @var array<string, array<string>> */
    private static array $breedsBySpecies = [
        'dog' => [
            'Labrador Retriever', 'Golden Retriever', 'French Bulldog', 'German Shepherd',
            'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Boxer',
            'Dachshund', 'Shih Tzu', 'Siberian Husky', 'Pembroke Welsh Corgi',
        ],
        'cat' => [
            'Persian', 'Maine Coon', 'Ragdoll', 'British Shorthair', 'Siamese',
            'Abyssinian', 'Birman', 'Scottish Fold', 'Bengal', 'Sphynx', 'Russian Blue',
        ],
    ];

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $species = fake()->randomElement(Species::cases());
        $breeds = self::$breedsBySpecies[$species->value] ?? [];
        $breed = $breeds !== [] ? fake()->randomElement($breeds) : fake()->word();

        return [
            'household_id' => Household::factory(),
            'name' => fake()->randomElement(self::$petNames),
            'species' => $species->value,
            'breed' => fake()->optional(0.85)->passthrough($breed),
            'sex' => fake()->randomElement(Sex::cases())->value,
            'birthday' => fake()->optional(0.9)->dateTimeBetween('-12 years', '-6 months')?->format('Y-m-d'),
            'is_neutered' => fake()->boolean(65),
            'size' => fake()->randomElement(PetSize::cases())->value,
            'notes' => fake()->optional(0.3)->sentence(),
        ];
    }

    public function dog(): static
    {
        return $this->state(function (): array {
            $breed = fake()->randomElement(self::$breedsBySpecies['dog']);

            return [
                'species' => Species::Dog->value,
                'breed' => $breed,
                'size' => fake()->randomElement([PetSize::Small, PetSize::Medium, PetSize::Large])->value,
            ];
        });
    }

    public function cat(): static
    {
        return $this->state(function (): array {
            $breed = fake()->randomElement(self::$breedsBySpecies['cat']);

            return [
                'species' => Species::Cat->value,
                'breed' => $breed,
                'size' => fake()->randomElement([PetSize::Small, PetSize::Medium])->value,
            ];
        });
    }
}
