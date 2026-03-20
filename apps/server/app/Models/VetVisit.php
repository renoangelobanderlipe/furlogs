<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\VisitType;
use App\Observers\VetVisitObserver;
use App\Traits\BelongsToHouseholdViaPet;
use Carbon\Carbon;
use Database\Factories\VetVisitFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

/**
 * @property int $id
 * @property int $pet_id
 * @property int|null $clinic_id
 * @property string|null $vet_name
 * @property Carbon $visit_date
 * @property VisitType $visit_type
 * @property string $reason
 * @property string|null $diagnosis
 * @property string|null $treatment
 * @property string|null $cost
 * @property string|null $weight_at_visit
 * @property Carbon|null $follow_up_date
 * @property string|null $notes
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
#[Fillable([
    'pet_id', 'clinic_id', 'vet_name', 'visit_date', 'visit_type',
    'reason', 'diagnosis', 'treatment', 'cost', 'weight_at_visit',
    'follow_up_date', 'notes',
])]
#[ObservedBy(VetVisitObserver::class)]
class VetVisit extends Model implements HasMedia
{
    /** @use HasFactory<VetVisitFactory> */
    use BelongsToHouseholdViaPet, HasFactory, InteractsWithMedia, SoftDeletes;

    /**
     * @return array<string, mixed>
     */
    protected function casts(): array
    {
        return [
            'visit_type' => VisitType::class,
            'visit_date' => 'date',
            'follow_up_date' => 'date',
            'cost' => 'decimal:2',
            'weight_at_visit' => 'decimal:2',
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

    /** @return HasMany<Medication, $this> */
    public function medications(): HasMany
    {
        return $this->hasMany(Medication::class, 'vet_visit_id');
    }

    public function registerMediaCollections(): void
    {
        // Use local (private) disk — switch to a private cloud disk in production.
        $this->addMediaCollection('attachments')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
            ->useDisk('local');
    }
}
