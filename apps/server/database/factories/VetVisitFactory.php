<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\VisitType;
use App\Models\Pet;
use App\Models\VetVisit;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VetVisit>
 */
class VetVisitFactory extends Factory
{
    /** @var array<string, array<string>> */
    private static array $reasonsByType = [
        'checkup' => [
            'Annual wellness exam',
            'Routine health check',
            'Follow-up wellness visit',
            'Bi-annual check-up',
            'Senior wellness screening',
        ],
        'treatment' => [
            'Vomiting and lethargy',
            'Loss of appetite for 3 days',
            'Skin irritation and scratching',
            'Ear infection — discharge and odour',
            'Limping on front left leg',
            'Diarrhea lasting 2 days',
            'Eye discharge and squinting',
            'Coughing and occasional wheezing',
            'Suspected urinary tract infection',
            'Hot spot on lower back',
        ],
        'emergency' => [
            'Suspected poisoning — ingested unknown plant',
            'Trauma from fall — possible fracture',
            'Difficulty breathing and open-mouth panting',
            'Seizure episode lasting 2 minutes',
            'Severe allergic reaction — facial swelling',
            'Uncontrolled bleeding from paw laceration',
        ],
        'vaccine' => [
            'Annual vaccination appointment',
            'Booster vaccination due',
            'Puppy/kitten vaccination series',
            'Rabies booster',
        ],
    ];

    /** @var array<string, array<string>> */
    private static array $diagnosesByType = [
        'treatment' => [
            'Bacterial skin infection (pyoderma)',
            'Otitis externa — yeast infection',
            'Mild gastrointestinal upset',
            'Sprain of the left carpus',
            'Conjunctivitis',
            'Upper respiratory infection',
            'Urinary tract infection',
            'Allergic dermatitis',
        ],
        'emergency' => [
            'Fractured radius — requires splinting',
            'Anaphylaxis — responded to epinephrine',
            'Ingested toxic substance — supportive care initiated',
            'Idiopathic epilepsy — monitor for recurrence',
        ],
    ];

    /** @var array<string, array<string>> */
    private static array $treatmentsByType = [
        'treatment' => [
            'Prescribed amoxicillin 250mg twice daily for 10 days',
            'Ear flush performed; prescribed Otomax drops',
            'Bland diet recommended; prescribed metronidazole',
            'Splint applied; rest advised; follow-up in 3 weeks',
            'Chloramphenicol eye drops prescribed',
            'Prescribed prednisolone 10mg once daily for 5 days',
        ],
        'emergency' => [
            'IV fluids administered; induced vomiting; activated charcoal given',
            'Epinephrine administered; observation for 4 hours',
            'Splinting and pain management; referred to orthopaedic specialist',
            'Phenobarbital prescribed; monitoring protocol initiated',
        ],
    ];

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(VisitType::cases());
        $reasons = self::$reasonsByType[$type->value] ?? ['General consultation'];
        $diagnoses = self::$diagnosesByType[$type->value] ?? [];
        $treatments = self::$treatmentsByType[$type->value] ?? [];

        $hasDiagnosis = $diagnoses !== [] && fake()->boolean(60);
        $hasTreatment = $treatments !== [] && fake()->boolean(60);

        $cost = match ($type) {
            VisitType::Checkup => fake()->randomFloat(2, 50, 150),
            VisitType::Treatment => fake()->randomFloat(2, 80, 500),
            VisitType::Emergency => fake()->randomFloat(2, 200, 800),
            VisitType::Vaccine => fake()->randomFloat(2, 40, 120),
        };

        return [
            'pet_id' => Pet::factory(),
            'clinic_id' => null,
            'vet_name' => fake()->optional(0.7)->name(),
            'visit_date' => fake()->dateTimeBetween('-2 years', 'today')->format('Y-m-d'),
            'visit_type' => $type->value,
            'reason' => fake()->randomElement($reasons),
            'diagnosis' => $hasDiagnosis ? fake()->randomElement($diagnoses) : null,
            'treatment' => $hasTreatment ? fake()->randomElement($treatments) : null,
            'cost' => $cost,
            'weight_at_visit' => fake()->optional(0.6)->randomFloat(2, 2.0, 35.0),
            'follow_up_date' => null,
            'notes' => fake()->optional(0.2)->sentence(),
        ];
    }

    /**
     * State: adds a follow-up date 2–4 weeks after the visit.
     */
    public function withFollowUp(): static
    {
        return $this->state(function (array $attributes): array {
            $visitDate = $attributes['visit_date'] ?? now()->toDateString();

            return [
                'follow_up_date' => Carbon::parse($visitDate)
                    ->addDays(fake()->numberBetween(14, 28))
                    ->toDateString(),
            ];
        });
    }

    /**
     * State: ensures a realistic weight is recorded at visit.
     */
    public function withWeight(float $weightKg): static
    {
        return $this->state(['weight_at_visit' => $weightKg]);
    }
}
