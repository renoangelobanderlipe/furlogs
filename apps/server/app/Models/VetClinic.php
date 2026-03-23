<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToHousehold;
use Database\Factories\VetClinicFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

#[Fillable(['household_id', 'name', 'address', 'phone', 'notes'])]
class VetClinic extends Model
{
    /** @use HasFactory<VetClinicFactory> */
    use BelongsToHousehold, HasFactory, HasUuids, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'address', 'phone'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /** @return HasMany<Pet, $this> */
    public function vetVisits(): HasMany
    {
        // Phase 2
        return $this->hasMany(Pet::class);
    }
}
