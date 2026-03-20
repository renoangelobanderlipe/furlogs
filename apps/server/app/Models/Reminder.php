<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ReminderStatus;
use App\Enums\ReminderType;
use App\Traits\BelongsToHousehold;
use Carbon\Carbon;
use Database\Factories\ReminderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * @property int $id
 * @property int $household_id
 * @property int|null $pet_id
 * @property ReminderType $type
 * @property string $title
 * @property string|null $description
 * @property Carbon $due_date
 * @property bool $is_recurring
 * @property int|null $recurrence_days
 * @property ReminderStatus $status
 * @property Carbon|null $last_notified_at
 * @property int|null $source_id
 * @property string|null $source_type
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
#[Fillable([
    'household_id', 'pet_id', 'type', 'title', 'description',
    'due_date', 'is_recurring', 'recurrence_days', 'status', 'last_notified_at',
    'source_id', 'source_type',
])]
class Reminder extends Model
{
    /** @use HasFactory<ReminderFactory> */
    use BelongsToHousehold, HasFactory;

    /**
     * @return array<string, mixed>
     */
    protected function casts(): array
    {
        return [
            'type' => ReminderType::class,
            'status' => ReminderStatus::class,
            'due_date' => 'date',
            'is_recurring' => 'boolean',
            'last_notified_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Household, $this> */
    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class);
    }

    /** @return BelongsTo<Pet, $this> */
    public function pet(): BelongsTo
    {
        return $this->belongsTo(Pet::class);
    }

    /** @return MorphTo<Model, $this> */
    public function source(): MorphTo
    {
        return $this->morphTo();
    }
}
