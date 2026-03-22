<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\VisitType;
use App\Models\VetVisit;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVetVisitRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var VetVisit $visit */
        $visit = $this->route('vet_visit');

        return $this->user()->can('update', $visit);
    }

    protected function prepareForValidation(): void
    {
        foreach (['reason', 'diagnosis', 'treatment', 'notes', 'vet_name'] as $field) {
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
            'clinic_id' => [
                'nullable',
                'uuid',
                Rule::exists('vet_clinics', 'id')
                    ->where('household_id', $this->user()->current_household_id),
            ],
            'vet_name' => ['nullable', 'string', 'max:255'],
            'visit_type' => ['sometimes', 'string', Rule::enum(VisitType::class)],
            'visit_date' => ['sometimes', 'date', 'before_or_equal:today'],
            'reason' => ['sometimes', 'string', 'max:1000'],
            'diagnosis' => ['nullable', 'string', 'max:5000'],
            'treatment' => ['nullable', 'string', 'max:5000'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'weight_at_visit' => ['nullable', 'numeric', 'min:0'],
            'follow_up_date' => ['nullable', 'date', 'after_or_equal:visit_date'],
        ];
    }
}
