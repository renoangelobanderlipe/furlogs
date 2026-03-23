<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PetSize;
use App\Enums\Sex;
use App\Enums\Species;
use App\Observers\PetObserver;
use App\Traits\BelongsToHousehold;
use Carbon\Carbon;
use Database\Factories\PetFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * @property string $id
 * @property string $household_id
 * @property string $name
 * @property Species $species
 * @property string|null $breed
 * @property Sex $sex
 * @property Carbon|null $birthday
 * @property bool $is_neutered
 * @property PetSize|null $size
 * @property string|null $notes
 * @property int|null $age
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
#[Fillable(['household_id', 'name', 'species', 'breed', 'sex', 'birthday', 'is_neutered', 'size', 'notes'])]
#[ObservedBy(PetObserver::class)]
class Pet extends Model implements HasMedia
{
    /** @use HasFactory<PetFactory> */
    use BelongsToHousehold, HasFactory, HasUuids, InteractsWithMedia, LogsActivity, SoftDeletes;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'species', 'breed', 'sex', 'birthday', 'is_neutered', 'size', 'notes'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * @return array<string, mixed>
     */
    protected function casts(): array
    {
        return [
            'species' => Species::class,
            'sex' => Sex::class,
            'size' => PetSize::class,
            'is_neutered' => 'boolean',
            'birthday' => 'date',
        ];
    }

    /** @param Builder<Pet> $query */
    #[Scope]
    protected function ofSpecies(Builder $query, string $species): void
    {
        $query->where('species', $species);
    }

    /** @return HasMany<PetWeight, $this> */
    public function weights(): HasMany
    {
        return $this->hasMany(PetWeight::class);
    }

    /** @return HasOne<PetWeight, $this> */
    public function latestWeight(): HasOne
    {
        return $this->hasOne(PetWeight::class)->orderByDesc('recorded_at')->orderByDesc('created_at');
    }

    /**
     * Get the pet's age in years, derived from birthday.
     *
     * @return Attribute<int|null, never>
     */
    protected function age(): Attribute
    {
        return Attribute::make(
            get: function (): ?int {
                $birthday = $this->getRawOriginal('birthday');

                if ($birthday === null) {
                    return null;
                }

                return (int) Carbon::parse($birthday)->diffInYears(now());
            },
        );
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp'])
            ->useDisk('public');
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->performOnCollections('avatar')
            ->width(150)
            ->height(150)
            ->crop(150, 150);

        $this->addMediaConversion('card')
            ->performOnCollections('avatar')
            ->width(400)
            ->height(400)
            ->fit(Fit::Contain, 400, 400);
    }
}
