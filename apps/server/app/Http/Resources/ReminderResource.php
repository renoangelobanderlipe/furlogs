<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Reminder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Reminder */
class ReminderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Reminder $reminder */
        $reminder = $this->resource;

        $daysUntilDue = (int) now()->startOfDay()->diffInDays($reminder->due_date, false);

        return [
            'id' => $reminder->id,
            'type' => 'reminders',
            'attributes' => [
                'reminderType' => $reminder->type->value,
                'title' => $reminder->title,
                'description' => $reminder->description,
                'dueDate' => $reminder->due_date->toDateString(),
                'isRecurring' => $reminder->is_recurring,
                'recurrenceDays' => $reminder->recurrence_days,
                'status' => $reminder->status->value,
                'daysUntilDue' => $daysUntilDue,
                'urgency' => match (true) {
                    $daysUntilDue <= 3 => 'high',
                    $daysUntilDue <= 7 => 'medium',
                    default => 'low',
                },
                'createdAt' => $reminder->created_at->toISOString(),
                'updatedAt' => $reminder->updated_at->toISOString(),
            ],
            'relationships' => [
                'pet' => $this->whenLoaded('pet', fn () => new PetResource($reminder->pet)),
            ],
        ];
    }
}
