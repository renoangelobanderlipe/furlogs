<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\MedicationAdministration;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMedicationAdministrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var MedicationAdministration|null $administration */
        $administration = $this->route('administration');

        return $administration !== null && ($this->user()?->can('update', $administration) ?? false);
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
        return [
            'administered_at' => ['nullable', 'date', 'before_or_equal:now'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
