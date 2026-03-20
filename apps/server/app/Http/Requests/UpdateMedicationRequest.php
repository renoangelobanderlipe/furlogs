<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Medication;
use App\Models\Pet;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMedicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Medication $medication */
        $medication = $this->route('medication');

        return $this->user()->can('update', $medication);
    }

    protected function prepareForValidation(): void
    {
        foreach (['name', 'dosage', 'frequency', 'notes'] as $field) {
            if ($this->has($field)) {
                $this->merge([$field => strip_tags((string) $this->input($field))]);
            }
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'vet_visit_id' => [
                'nullable',
                'integer',
                Rule::exists('vet_visits', 'id')->whereIn(
                    'pet_id',
                    Pet::query()
                        ->where('household_id', $this->user()->current_household_id)
                        ->pluck('id'),
                ),
            ],
            'name' => ['sometimes', 'string', 'max:255'],
            'dosage' => ['nullable', 'string', 'max:100'],
            'frequency' => ['nullable', 'string', 'max:100'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
