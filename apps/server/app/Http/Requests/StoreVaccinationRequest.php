<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Vaccination;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVaccinationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Vaccination::class);
    }

    protected function prepareForValidation(): void
    {
        foreach (['vaccine_name', 'vet_name', 'batch_number', 'notes'] as $field) {
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
            'pet_id' => [
                'required',
                'uuid',
                Rule::exists('pets', 'id')->where('household_id', $this->user()->current_household_id),
            ],
            'clinic_id' => [
                'nullable',
                'uuid',
                Rule::exists('vet_clinics', 'id')->where('household_id', $this->user()->current_household_id),
            ],
            'vaccine_name' => ['required', 'string', 'max:255'],
            'administered_date' => ['required', 'date', 'before_or_equal:today'],
            'next_due_date' => ['nullable', 'date', 'after:administered_date'],
            'vet_name' => ['nullable', 'string', 'max:255'],
            'batch_number' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
