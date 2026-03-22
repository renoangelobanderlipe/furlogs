<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Vaccination;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVaccinationRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Vaccination $vaccination */
        $vaccination = $this->route('vaccination');

        return $this->user()->can('update', $vaccination);
    }

    protected function prepareForValidation(): void
    {
        foreach (['vaccine_name', 'vet_name', 'batch_number', 'notes'] as $field) {
            if ($this->has($field)) {
                $this->merge([$field => strip_tags((string) $this->input($field))]);
            }
        }

        // When administered_date is not part of the PATCH body, inject the
        // existing model value so next_due_date's after: rule has a reference.
        if (! $this->has('administered_date')) {
            /** @var Vaccination $vaccination */
            $vaccination = $this->route('vaccination');
            if ($vaccination?->administered_date) {
                $this->merge(['administered_date' => $vaccination->administered_date->toDateString()]);
            }
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'clinic_id' => [
                'nullable',
                'uuid',
                Rule::exists('vet_clinics', 'id')
                    ->where('household_id', $this->user()->current_household_id),
            ],
            'vaccine_name' => ['sometimes', 'string', 'max:255'],
            'administered_date' => ['sometimes', 'date', 'before_or_equal:today'],
            'next_due_date' => ['nullable', 'date', 'after:administered_date'],
            'vet_name' => ['nullable', 'string', 'max:255'],
            'batch_number' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
