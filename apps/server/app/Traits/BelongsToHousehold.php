<?php

declare(strict_types=1);

namespace App\Traits;

use App\Models\Household;
use App\Scopes\HouseholdScope;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToHousehold
{
    public static function bootBelongsToHousehold(): void
    {
        static::addGlobalScope(new HouseholdScope);

        static::creating(function (self $model): void {
            if (auth()->check() && empty($model->household_id)) {
                $model->household_id = auth()->user()->current_household_id;
            }
        });
    }

    /** @return BelongsTo<Household, $this> */
    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class);
    }
}
