<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\MarkAllReadRequest;
use App\Http\Resources\NotificationResource;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function __construct(private readonly NotificationService $service) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $filters = [];

        if ($request->has('filter.read')) {
            $filters['read'] = filter_var($request->input('filter.read'), FILTER_VALIDATE_BOOLEAN);
        }

        $paginated = $this->service->getPaginated($user, $filters);

        return response()->json([
            'data' => NotificationResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'unread_count' => $this->service->getUnreadCount($user),
            ],
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'data' => ['count' => $this->service->getUnreadCount($request->user())],
        ]);
    }

    public function markRead(Request $request, DatabaseNotification $notification): JsonResponse
    {
        abort_unless(
            $notification->getAttribute('notifiable_id') === $request->user()->id
            && $notification->getAttribute('notifiable_type') === get_class($request->user()),
            403,
            'This notification does not belong to you.',
        );

        $this->service->markAsRead($notification);

        return response()->json(['message' => 'Notification marked as read.']);
    }

    public function markAllRead(MarkAllReadRequest $request): JsonResponse
    {
        $user = $request->user();
        $ids = $request->validated('ids');

        if (! empty($ids)) {
            $user->notifications()
                ->whereIn('id', $ids)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);
        } else {
            $this->service->markAllAsRead($user);
        }

        return response()->json(['message' => 'Notifications marked as read.']);
    }
}
