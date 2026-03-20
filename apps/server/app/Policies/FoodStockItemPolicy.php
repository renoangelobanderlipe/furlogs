<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\FoodStockItem;
use App\Models\User;

class FoodStockItemPolicy
{
    /**
     * Any authenticated member can view the stock item list.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * The user can view a stock item only if it belongs to their current household.
     */
    public function view(User $user, FoodStockItem $item): bool
    {
        $item->loadMissing('foodProduct');

        if ($item->foodProduct === null) {
            return false;
        }

        return $user->current_household_id === $item->foodProduct->household_id;
    }

    /**
     * Any authenticated user can create a stock item.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * The user can update a stock item only if it belongs to their current household.
     */
    public function update(User $user, FoodStockItem $item): bool
    {
        $item->loadMissing('foodProduct');

        if ($item->foodProduct === null) {
            return false;
        }

        return $user->current_household_id === $item->foodProduct->household_id;
    }

    /**
     * Only the household owner may delete a stock item.
     */
    public function delete(User $user, FoodStockItem $item): bool
    {
        $item->loadMissing('foodProduct');

        if ($item->foodProduct === null) {
            return false;
        }

        return $user->current_household_id === $item->foodProduct->household_id
            && $user->hasRole('owner');
    }

    public function forceDelete(User $user, FoodStockItem $item): bool
    {
        return false;
    }
}
