<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\PetSize;
use App\Enums\Sex;
use App\Enums\Species;
use App\Models\Pet;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Pet::class);
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
            'name' => ['required', 'string', 'max:50'],
            'species' => ['required', Rule::enum(Species::class)],
            'breed' => ['nullable', 'string', 'max:100'],
            'sex' => ['required', Rule::enum(Sex::class)],
            'birthday' => ['nullable', 'date', 'before_or_equal:today'],
            'is_neutered' => ['boolean'],
            'size' => ['nullable', Rule::enum(PetSize::class)],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
