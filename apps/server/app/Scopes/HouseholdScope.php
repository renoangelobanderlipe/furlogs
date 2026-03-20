<?php

declare(strict_types=1);

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class HouseholdScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     *
     * @param  Builder<Model>  $builder
     */
    public function apply(Builder $builder, Model $model): void
    {
        if (! auth()->check() || auth()->user()->current_household_id === null) {
            $builder->whereRaw('1 = 0');

            return;
        }

        $builder->where(
            $model->getTable().'.household_id',
            auth()->user()->current_household_id,
        );
    }
}
