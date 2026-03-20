<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\PetSize;
use App\Enums\Sex;
use App\Enums\Species;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('pet'));
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('name')) {
            $this->merge(['name' => strip_tags((string) $this->input('name'))]);
        }

        if ($this->has('breed')) {
            $this->merge(['breed' => strip_tags((string) $this->input('breed'))]);
        }

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
            'name' => ['sometimes', 'required', 'string', 'max:50'],
            'species' => ['sometimes', Rule::enum(Species::class)],
            'breed' => ['sometimes', 'nullable', 'string', 'max:100'],
            'sex' => ['sometimes', Rule::enum(Sex::class)],
            'birthday' => ['sometimes', 'nullable', 'date', 'before_or_equal:today'],
            'is_neutered' => ['sometimes', 'boolean'],
            'size' => ['sometimes', 'nullable', Rule::enum(PetSize::class)],
            'notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }
}
