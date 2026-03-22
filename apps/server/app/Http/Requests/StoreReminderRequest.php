<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\ReminderType;
use App\Models\Reminder;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReminderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Reminder::class);
    }

    protected function prepareForValidation(): void
    {
        foreach (['title', 'description'] as $field) {
            if ($this->has($field)) {
                $this->merge([$field => strip_tags((string) $this->input($field))]);
            }
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'pet_id' => [
                'nullable',
                'uuid',
                Rule::exists('pets', 'id')->where('household_id', $this->user()->current_household_id),
            ],
            'type' => ['required', Rule::enum(ReminderType::class)],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'due_date' => ['required', 'date'],
            'is_recurring' => ['boolean'],
            'recurrence_days' => ['nullable', 'integer', 'min:1', 'max:365', 'required_if:is_recurring,true'],
        ];
    }
}
