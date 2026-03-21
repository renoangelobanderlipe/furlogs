<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\FoodStockItem;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFoodStockItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', FoodStockItem::class);
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('notes')) {
            $this->merge(['notes' => strip_tags((string) $this->input('notes'))]);
        }

        if ($this->has('purchase_source')) {
            $this->merge(['purchase_source' => strip_tags((string) $this->input('purchase_source'))]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'food_product_id' => [
                'required',
                'uuid',
                Rule::exists('food_products', 'id')->where(
                    'household_id',
                    $this->user()->current_household_id,
                ),
            ],
            'purchased_at' => ['required', 'date'],
            'purchase_cost' => ['nullable', 'numeric', 'min:0'],
            'purchase_source' => ['nullable', 'string', 'max:255'],
            'quantity' => ['nullable', 'integer', 'min:1'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
