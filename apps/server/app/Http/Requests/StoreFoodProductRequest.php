<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\FoodType;
use App\Enums\UnitType;
use App\Models\FoodProduct;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFoodProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', FoodProduct::class);
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

        // The column is NOT NULL with a default of 25. A null payload value
        // means "use the default" — replace it so the DB constraint is not violated.
        if ($this->has('alert_threshold_pct') && is_null($this->input('alert_threshold_pct'))) {
            $this->merge(['alert_threshold_pct' => 25]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:255'],
            'type' => ['required', Rule::enum(FoodType::class)],
            'unit_weight_grams' => ['nullable', 'integer', 'min:1'],
            'unit_type' => ['required', Rule::enum(UnitType::class)],
            'alert_threshold_pct' => ['nullable', 'integer', 'min:1', 'max:100'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
