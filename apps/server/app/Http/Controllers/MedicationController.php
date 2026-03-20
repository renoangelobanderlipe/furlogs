<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreMedicationRequest;
use App\Http\Requests\UpdateMedicationRequest;
use App\Http\Resources\MedicationResource;
use App\Models\Medication;
use App\Services\MedicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class MedicationController extends Controller
{
    public function __construct(private readonly MedicationService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Medication::class);

        $medications = Medication::query()
            ->with(['pet', 'vetVisit'])
            ->when($request->integer('pet_id'), fn ($q, $petId) => $q->where('pet_id', $petId))
            ->when($request->integer('vet_visit_id'), fn ($q, $visitId) => $q->where('vet_visit_id', $visitId))
            ->orderBy('start_date', 'desc')
            ->paginate((int) $request->query('per_page', 5));

        return MedicationResource::collection($medications);
    }

    public function show(Medication $medication): MedicationResource
    {
        $this->authorize('view', $medication);

        return new MedicationResource($medication->load('pet', 'vetVisit'));
    }

    public function store(StoreMedicationRequest $request): JsonResponse
    {
        $medication = $this->service->create($request->validated());

        return (new MedicationResource($medication->load('pet')))->response()->setStatusCode(201);
    }

    public function update(UpdateMedicationRequest $request, Medication $medication): MedicationResource
    {
        $medication = $this->service->update($medication, $request->validated());

        return new MedicationResource($medication);
    }

    public function destroy(Medication $medication): Response
    {
        $this->authorize('delete', $medication);

        $this->service->delete($medication);

        return response()->noContent();
    }
}
