<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Database\Factories\PetWeightFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * @property string $id
 * @property string $pet_id
 * @property string $weight_kg
 * @property Carbon $recorded_at
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
#[Fillable(['pet_id', 'weight_kg', 'recorded_at'])]
class PetWeight extends Model
{
    /** @use HasFactory<PetWeightFactory> */
    use HasFactory, HasUuids, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['weight_kg', 'recorded_at'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'recorded_at' => 'date',
            'weight_kg' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<Pet, $this> */
    public function pet(): BelongsTo
    {
        return $this->belongsTo(Pet::class);
    }
}
