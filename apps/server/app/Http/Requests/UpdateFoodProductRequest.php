<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\FoodType;
use App\Enums\UnitType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFoodProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('food_product'));
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('name')) {
            $this->merge(['name' => strip_tags((string) $this->input('name'))]);
        }

        if ($this->has('brand')) {
            $this->merge(['brand' => strip_tags((string) $this->input('brand'))]);
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
            'name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'brand' => ['sometimes', 'nullable', 'string', 'max:255'],
            'type' => ['sometimes', 'nullable', Rule::enum(FoodType::class)],
            'unit_weight_grams' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'unit_type' => ['sometimes', 'nullable', Rule::enum(UnitType::class)],
            'alert_threshold_pct' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:100'],
            'notes' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
