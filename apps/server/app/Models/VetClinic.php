<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToHousehold;
use Database\Factories\VetClinicFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['household_id', 'name', 'address', 'phone', 'notes'])]
class VetClinic extends Model
{
    /** @use HasFactory<VetClinicFactory> */
    use BelongsToHousehold, HasFactory;

    /** @return HasMany<Pet, $this> */
    public function vetVisits(): HasMany
    {
        // Phase 2
        return $this->hasMany(Pet::class);
    }
}
