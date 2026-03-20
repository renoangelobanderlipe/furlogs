<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Household;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class InviteMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Household $household */
        $household = $this->route('household');

        return $this->user()->can('invite', $household);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
        ];
    }
}
