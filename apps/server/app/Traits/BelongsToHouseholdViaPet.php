<?php

declare(strict_types=1);

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait BelongsToHouseholdViaPet
{
    public static function bootBelongsToHouseholdViaPet(): void
    {
        static::addGlobalScope('household_via_pet', function (Builder $builder): void {
            if (! auth()->check() || auth()->user()->current_household_id === null) {
                $builder->whereRaw('1 = 0');

                return;
            }

            $householdId = auth()->user()->current_household_id;

            $builder->whereHas('pet', function (Builder $q) use ($householdId): void {
                $q->where('pets.household_id', $householdId);
            });
        });
    }
}
