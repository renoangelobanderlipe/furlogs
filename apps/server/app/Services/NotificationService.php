<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Notifications\DatabaseNotification;

class NotificationService
{
    /**
     * Get the count of unread notifications for the given user.
     */
    public function getUnreadCount(User $user): int
    {
        return $user->unreadNotifications()->count();
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(DatabaseNotification $notification): void
    {
        $notification->markAsRead();
    }

    /**
     * Mark all notifications as read for the given user.
     */
    public function markAllAsRead(User $user): void
    {
        $user->unreadNotifications()->update(['read_at' => now()]);
    }

    /**
     * Get paginated notifications for a user with optional filters.
     *
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, DatabaseNotification>
     */
    public function getPaginated(User $user, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $user->notifications()
            ->when(
                isset($filters['read']),
                function ($query) use ($filters) {
                    if ($filters['read']) {
                        return $query->whereNotNull('read_at');
                    }

                    return $query->whereNull('read_at');
                },
            )
            ->paginate($perPage);
    }
}
