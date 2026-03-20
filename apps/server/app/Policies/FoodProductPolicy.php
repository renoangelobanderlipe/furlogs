<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\FoodProduct;
use App\Models\User;

class FoodProductPolicy
{
    /**
     * Any authenticated member can view the product list (scoped by household).
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * The user can view a product only if it belongs to their current household.
     */
    public function view(User $user, FoodProduct $product): bool
    {
        return $user->current_household_id === $product->household_id;
    }

    /**
     * Any authenticated user can create a food product within their current household.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * The user can update a product only if it belongs to their current household.
     */
    public function update(User $user, FoodProduct $product): bool
    {
        return $user->current_household_id === $product->household_id;
    }

    /**
     * Only the household owner may delete a food product.
     */
    public function delete(User $user, FoodProduct $product): bool
    {
        return $user->current_household_id === $product->household_id
            && $user->hasRole('owner');
    }

    /**
     * Only the household owner may restore a soft-deleted food product.
     */
    public function restore(User $user, FoodProduct $product): bool
    {
        return $user->current_household_id === $product->household_id
            && $user->hasRole('owner');
    }

    public function forceDelete(User $user, FoodProduct $product): bool
    {
        return false;
    }
}
