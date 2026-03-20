<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Medication;
use App\Models\Pet;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMedicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Medication::class);
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
            'pet_id' => [
                'required',
                'integer',
                Rule::exists('pets', 'id')->where('household_id', $this->user()->current_household_id),
            ],
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
            'name' => ['required', 'string', 'max:255'],
            'dosage' => ['nullable', 'string', 'max:100'],
            'frequency' => ['nullable', 'string', 'max:100'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
