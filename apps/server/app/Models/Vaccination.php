<?php

declare(strict_types=1);

namespace App\Models;

use App\Observers\VaccinationObserver;
use App\Traits\BelongsToHouseholdViaPet;
use Carbon\Carbon;
use Database\Factories\VaccinationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * @property string $id
 * @property string $pet_id
 * @property string|null $clinic_id
 * @property string $vaccine_name
 * @property Carbon $administered_date
 * @property Carbon|null $next_due_date
 * @property string|null $vet_name
 * @property string|null $batch_number
 * @property string|null $notes
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
#[Fillable([
    'pet_id', 'clinic_id', 'vaccine_name', 'administered_date',
    'next_due_date', 'vet_name', 'batch_number', 'notes',
])]
#[ObservedBy(VaccinationObserver::class)]
class Vaccination extends Model
{
    /** @use HasFactory<VaccinationFactory> */
    use BelongsToHouseholdViaPet, HasFactory, HasUuids, LogsActivity, SoftDeletes;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['vaccine_name', 'administered_date', 'next_due_date', 'notes'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * @return array<string, mixed>
     */
    protected function casts(): array
    {
        return [
            'administered_date' => 'date',
            'next_due_date' => 'date',
        ];
    }

    /** @return BelongsTo<Pet, $this> */
    public function pet(): BelongsTo
    {
        return $this->belongsTo(Pet::class);
    }

    /** @return BelongsTo<VetClinic, $this> */
    public function clinic(): BelongsTo
    {
        return $this->belongsTo(VetClinic::class, 'clinic_id');
    }
}
