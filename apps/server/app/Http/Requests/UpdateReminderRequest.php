<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\ReminderStatus;
use App\Enums\ReminderType;
use App\Models\Reminder;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateReminderRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Reminder $reminder */
        $reminder = $this->route('reminder');

        return $this->user()->can('update', $reminder);
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
                'integer',
                Rule::exists('pets', 'id')->where('household_id', $this->user()->current_household_id),
            ],
            'type' => ['sometimes', Rule::enum(ReminderType::class)],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'due_date' => ['sometimes', 'date'],
            'is_recurring' => ['boolean'],
            'recurrence_days' => ['nullable', 'integer', 'min:1', 'max:365'],
            'status' => ['nullable', Rule::enum(ReminderStatus::class)],
        ];
    }
}
