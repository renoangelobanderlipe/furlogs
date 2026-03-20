<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\VetClinic;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreVetClinicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', VetClinic::class);
    }

    protected function prepareForValidation(): void
    {
        foreach (['name', 'address', 'phone', 'notes'] as $field) {
            if ($this->has($field) && $this->input($field) !== null) {
                $this->merge([$field => strip_tags((string) $this->input($field))]);
            }
        }
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
