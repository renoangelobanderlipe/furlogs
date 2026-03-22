<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Medication;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreMedicationAdministrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Medication|null $medication */
        $medication = $this->route('medication');

        return $medication !== null && ($this->user()?->can('update', $medication) ?? false);
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('notes')) {
            $this->merge(['notes' => strip_tags((string) $this->input('notes'))]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Medication|null $medication */
        $medication = $this->route('medication');

        $administeredAtRules = ['nullable', 'date', 'before_or_equal:now'];

        if ($medication) {
            $administeredAtRules[] = 'after_or_equal:'.$medication->start_date->toDateString();
            if ($medication->end_date) {
                $administeredAtRules[] = 'before_or_equal:'.$medication->end_date->toDateString();
            }
        }

        return [
            'administered_at' => $administeredAtRules,
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
