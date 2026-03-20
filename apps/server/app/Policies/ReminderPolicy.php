<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Reminder;
use App\Models\User;

class ReminderPolicy
{
    /**
     * Any authenticated household member can view the reminder list.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * The user can view a reminder only if it belongs to their current household.
     */
    public function view(User $user, Reminder $reminder): bool
    {
        return $user->current_household_id === $reminder->household_id;
    }

    /**
     * Any authenticated user can create a reminder.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * The user can update a reminder only if it belongs to their current household.
     */
    public function update(User $user, Reminder $reminder): bool
    {
        return $user->current_household_id === $reminder->household_id;
    }

    /**
     * Only the household owner may delete a reminder.
     */
    public function delete(User $user, Reminder $reminder): bool
    {
        return $user->current_household_id === $reminder->household_id
            && $user->hasRole('owner');
    }
}
