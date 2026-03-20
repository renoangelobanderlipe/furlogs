<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\VisitType;
use App\Models\VetVisit;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVetVisitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', VetVisit::class);
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
            'pet_id' => [
                'required',
                'integer',
                Rule::exists('pets', 'id')->where('household_id', $this->user()->current_household_id),
            ],
            'clinic_id' => ['nullable', 'integer', 'exists:vet_clinics,id'],
            'vet_name' => ['nullable', 'string', 'max:255'],
            'visit_type' => ['required', 'string', Rule::enum(VisitType::class)],
            'visit_date' => ['required', 'date', 'before_or_equal:today'],
            'reason' => ['required', 'string', 'max:1000'],
            'diagnosis' => ['nullable', 'string', 'max:5000'],
            'treatment' => ['nullable', 'string', 'max:5000'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'weight_at_visit' => ['nullable', 'numeric', 'min:0'],
            'follow_up_date' => ['nullable', 'date', 'after_or_equal:visit_date'],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => ['file', 'mimes:jpeg,png,webp,pdf', 'max:10240'],
        ];
    }
}
