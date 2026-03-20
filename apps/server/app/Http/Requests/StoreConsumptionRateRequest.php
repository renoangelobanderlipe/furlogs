<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreConsumptionRateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('food_product'));
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'pet_id' => [
                'required',
                Rule::exists('pets', 'id')->where(
                    'household_id',
                    $this->user()->current_household_id,
                ),
            ],
            'daily_amount_grams' => ['required', 'integer', 'min:1'],
        ];
    }
}
