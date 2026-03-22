<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreMedicationAdministrationRequest;
use App\Http\Requests\UpdateMedicationAdministrationRequest;
use App\Http\Resources\MedicationAdministrationResource;
use App\Models\Medication;
use App\Models\MedicationAdministration;
use App\Services\MedicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class MedicationAdministrationController extends Controller
{
    public function __construct(private readonly MedicationService $service) {}

    public function index(Request $request, Medication $medication): AnonymousResourceCollection
    {
        $this->authorize('view', $medication);

        $administrations = $medication->administrations()
            ->when($request->date('date'), fn ($q, $date) => $q->whereDate('administered_at', $date))
            ->orderBy('administered_at', 'desc')
            ->paginate(20);

        return MedicationAdministrationResource::collection($administrations);
    }

    public function store(StoreMedicationAdministrationRequest $request, Medication $medication): JsonResponse
    {
        $this->authorize('update', $medication);

        $administration = $this->service->recordAdministration($medication, $request->validated());

        return (new MedicationAdministrationResource($administration))
            ->response()
            ->setStatusCode(201);
    }

    public function show(MedicationAdministration $administration): MedicationAdministrationResource
    {
        $this->authorize('view', $administration);

        return new MedicationAdministrationResource($administration);
    }

    public function update(UpdateMedicationAdministrationRequest $request, MedicationAdministration $administration): MedicationAdministrationResource
    {
        $this->authorize('update', $administration);

        $administration = $this->service->updateAdministration($administration, $request->validated());

        return new MedicationAdministrationResource($administration);
    }

    public function destroy(MedicationAdministration $administration): Response
    {
        $this->authorize('delete', $administration);

        $this->service->deleteAdministration($administration);

        return response()->noContent();
    }
}
