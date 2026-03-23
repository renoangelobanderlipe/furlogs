<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\HouseholdFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

#[Fillable(['name'])]
class Household extends Model
{
    /** @use HasFactory<HouseholdFactory> */
    use HasFactory, HasUuids, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /** @return BelongsToMany<User, $this, HouseholdMember> */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'household_members')
            ->using(HouseholdMember::class)
            ->withPivot(['role', 'invited_at', 'joined_at'])
            ->withTimestamps();
    }

    /** @return HasMany<HouseholdMember, $this> */
    public function householdMembers(): HasMany
    {
        return $this->hasMany(HouseholdMember::class);
    }

    /** @return HasMany<HouseholdInvitation, $this> */
    public function invitations(): HasMany
    {
        return $this->hasMany(HouseholdInvitation::class);
    }

    /** @return HasMany<Pet, $this> */
    public function pets(): HasMany
    {
        return $this->hasMany(Pet::class);
    }

    /** @return HasMany<VetClinic, $this> */
    public function vetClinics(): HasMany
    {
        return $this->hasMany(VetClinic::class);
    }

    /** @return HasMany<Reminder, $this> */
    public function reminders(): HasMany
    {
        return $this->hasMany(Reminder::class);
    }

    /** @return HasMany<FoodProduct, $this> */
    public function foodProducts(): HasMany
    {
        return $this->hasMany(FoodProduct::class);
    }

    /** @return HasManyThrough<VetVisit, Pet, $this> */
    public function vetVisits(): HasManyThrough
    {
        return $this->hasManyThrough(VetVisit::class, Pet::class);
    }

    /** @return HasManyThrough<Medication, Pet, $this> */
    public function medications(): HasManyThrough
    {
        return $this->hasManyThrough(Medication::class, Pet::class);
    }

    /** @return HasManyThrough<Vaccination, Pet, $this> */
    public function vaccinations(): HasManyThrough
    {
        return $this->hasManyThrough(Vaccination::class, Pet::class);
    }
}
