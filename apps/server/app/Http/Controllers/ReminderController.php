<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreReminderRequest;
use App\Http\Requests\UpdateReminderRequest;
use App\Http\Resources\ReminderResource;
use App\Models\Reminder;
use App\Services\ReminderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ReminderController extends Controller
{
    public function __construct(private readonly ReminderService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Reminder::class);

        $reminders = Reminder::query()
            ->with(['pet'])
            ->when($request->query('status'), fn ($q, string $status) => $q->where('status', $status))
            ->when($request->query('pet_id'), fn ($q, string $petId) => $q->where('pet_id', $petId))
            ->when($request->query('type'), fn ($q, string $type) => $q->where('type', $type))
            ->orderBy('due_date', 'asc')
            ->paginate(20);

        return ReminderResource::collection($reminders);
    }

    public function show(Request $request, Reminder $reminder): ReminderResource
    {
        $this->authorize('view', $reminder);

        return new ReminderResource($reminder->load('pet'));
    }

    public function store(StoreReminderRequest $request): JsonResponse
    {
        $reminder = $this->service->create($request->validated());

        return (new ReminderResource($reminder->load('pet')))->response()->setStatusCode(201);
    }

    public function update(UpdateReminderRequest $request, Reminder $reminder): ReminderResource
    {
        $reminder = $this->service->update($reminder, $request->validated());

        return new ReminderResource($reminder);
    }

    public function destroy(Reminder $reminder): Response
    {
        $this->authorize('delete', $reminder);

        $this->service->delete($reminder);

        return response()->noContent();
    }

    public function complete(Reminder $reminder): ReminderResource
    {
        $this->authorize('update', $reminder);

        $reminder = $this->service->complete($reminder);

        return new ReminderResource($reminder);
    }

    public function snooze(Request $request, Reminder $reminder): ReminderResource
    {
        $this->authorize('update', $reminder);

        $validated = $request->validate([
            'days' => ['required', 'integer', 'min:1', 'max:30'],
        ]);

        $reminder = $this->service->snooze($reminder, $validated['days']);

        return new ReminderResource($reminder);
    }

    public function dismiss(Reminder $reminder): ReminderResource
    {
        $this->authorize('update', $reminder);

        $reminder = $this->service->dismiss($reminder);

        return new ReminderResource($reminder);
    }
}
