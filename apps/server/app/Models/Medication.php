<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\FrequencyType;
use App\Observers\MedicationObserver;
use App\Traits\BelongsToHouseholdViaPet;
use Carbon\Carbon;
use Database\Factories\MedicationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property string $id
 * @property string $pet_id
 * @property string|null $vet_visit_id
 * @property string $name
 * @property string|null $dosage
 * @property FrequencyType|null $frequency
 * @property Carbon $start_date
 * @property Carbon|null $end_date
 * @property string|null $notes
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
#[Fillable([
    'pet_id', 'vet_visit_id', 'name', 'dosage', 'frequency',
    'start_date', 'end_date', 'notes',
])]
#[ObservedBy(MedicationObserver::class)]
class Medication extends Model
{
    /** @use HasFactory<MedicationFactory> */
    use BelongsToHouseholdViaPet, HasFactory, HasUuids, SoftDeletes;

    /**
     * @return array<string, mixed>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'frequency' => FrequencyType::class,
        ];
    }

    /** @return BelongsTo<Pet, $this> */
    public function pet(): BelongsTo
    {
        return $this->belongsTo(Pet::class);
    }

    /** @return BelongsTo<VetVisit, $this> */
    public function vetVisit(): BelongsTo
    {
        return $this->belongsTo(VetVisit::class, 'vet_visit_id');
    }

    /** @return HasMany<MedicationAdministration, $this> */
    public function administrations(): HasMany
    {
        return $this->hasMany(MedicationAdministration::class);
    }
}
