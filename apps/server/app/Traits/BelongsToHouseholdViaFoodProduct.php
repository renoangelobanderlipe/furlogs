<?php

declare(strict_types=1);

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait BelongsToHouseholdViaFoodProduct
{
    public static function bootBelongsToHouseholdViaFoodProduct(): void
    {
        static::addGlobalScope('household_via_food_product', function (Builder $builder): void {
            if (! auth()->check() || auth()->user()->current_household_id === null) {
                $builder->whereRaw('1 = 0');

                return;
            }

            $householdId = auth()->user()->current_household_id;

            $builder->whereHas('foodProduct', function (Builder $q) use ($householdId): void {
                $q->where('food_products.household_id', $householdId);
            });
        });
    }
}
