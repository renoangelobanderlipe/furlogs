<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Spatie\Activitylog\Models\Activity;

/** @mixin Activity */
class ActivityResource extends JsonResource
{
    /**
     * Map a fully-qualified model class to a short slug for the API response.
     *
     * @var array<string, string>
     */
    private const SUBJECT_TYPE_MAP = [
        'App\\Models\\Pet' => 'pet',
        'App\\Models\\VetVisit' => 'vet_visit',
        'App\\Models\\VetClinic' => 'vet_clinic',
        'App\\Models\\Medication' => 'medication',
        'App\\Models\\MedicationAdministration' => 'medication_administration',
        'App\\Models\\Vaccination' => 'vaccination',
        'App\\Models\\Reminder' => 'reminder',
        'App\\Models\\FoodStockItem' => 'food_stock',
        'App\\Models\\FoodProduct' => 'food_product',
        'App\\Models\\HouseholdInvitation' => 'invitation',
        'App\\Models\\Household' => 'household',
        'App\\Models\\User' => 'user',
    ];

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $subjectType = $this->getAttribute('subject_type');

        return [
            'id' => $this->getKey(),
            'description' => $this->getAttribute('description'),
            'event' => $this->getAttribute('event'),
            'subject_type' => $this->resolveSubjectTypeSlug($subjectType),
            'causer_name' => $this->causer?->name ?? 'System',
            'causer_id' => $this->getAttribute('causer_id'),
            'created_at' => $this->getAttribute('created_at')?->toISOString(),
        ];
    }

    private function resolveSubjectTypeSlug(?string $subjectType): ?string
    {
        if ($subjectType === null) {
            return null;
        }

        return self::SUBJECT_TYPE_MAP[$subjectType] ?? $this->fallbackSlug($subjectType);
    }

    /**
     * Derive a slug from an unmapped class name by stripping the namespace
     * and converting to snake_case. e.g. "App\Models\FooBar" → "foo_bar".
     */
    private function fallbackSlug(string $subjectType): string
    {
        $basename = class_basename($subjectType);

        return (string) str($basename)->snake();
    }
}
