<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreVaccinationRequest;
use App\Http\Requests\UpdateVaccinationRequest;
use App\Http\Resources\VaccinationResource;
use App\Models\Vaccination;
use App\Services\VaccinationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class VaccinationController extends Controller
{
    public function __construct(private readonly VaccinationService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Vaccination::class);

        $vaccinations = Vaccination::query()
            ->with(['pet', 'clinic'])
            ->when($request->query('pet_id'), fn ($q, string $petId) => $q->where('pet_id', $petId))
            ->when($request->query('status'), function ($q, string $status) {
                $today = now()->toDateString();
                $soonThreshold = now()->addDays(30)->toDateString();

                return match ($status) {
                    'overdue' => $q->whereNotNull('next_due_date')->where('next_due_date', '<', $today),
                    'due_soon' => $q->whereNotNull('next_due_date')->whereBetween('next_due_date', [$today, $soonThreshold]),
                    'up_to_date' => $q->where(fn ($sub) => $sub->whereNull('next_due_date')->orWhere('next_due_date', '>', $soonThreshold)),
                    default => $q,
                };
            })
            ->orderBy('administered_date', 'desc')
            ->paginate((int) $request->query('per_page', 5));

        return VaccinationResource::collection($vaccinations);
    }

    public function show(Vaccination $vaccination): VaccinationResource
    {
        $this->authorize('view', $vaccination);

        return new VaccinationResource($vaccination->load('pet', 'clinic'));
    }

    public function store(StoreVaccinationRequest $request): JsonResponse
    {
        $vaccination = $this->service->create($request->validated());

        return (new VaccinationResource($vaccination->load('pet', 'clinic')))->response()->setStatusCode(201);
    }

    public function update(UpdateVaccinationRequest $request, Vaccination $vaccination): VaccinationResource
    {
        $vaccination = $this->service->update($vaccination, $request->validated());

        return new VaccinationResource($vaccination);
    }

    public function destroy(Vaccination $vaccination): Response
    {
        $this->authorize('delete', $vaccination);

        $this->service->delete($vaccination);

        return response()->noContent();
    }
}
