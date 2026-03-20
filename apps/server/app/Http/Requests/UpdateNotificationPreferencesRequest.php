<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationPreferencesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'vaccination' => ['sometimes', 'boolean'],
            'medication' => ['sometimes', 'boolean'],
            'food' => ['sometimes', 'boolean'],
            'followup' => ['sometimes', 'boolean'],
        ];
    }
}
