<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Household;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateHouseholdRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Household $household */
        $household = $this->route('household');

        return $this->user()->can('update', $household);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('name')) {
            $this->merge(['name' => strip_tags((string) $this->input('name'))]);
        }
    }
}
