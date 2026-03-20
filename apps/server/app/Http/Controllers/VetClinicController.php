<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreVetClinicRequest;
use App\Http\Requests\UpdateVetClinicRequest;
use App\Http\Resources\VetClinicResource;
use App\Models\VetClinic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class VetClinicController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', VetClinic::class);

        $clinics = VetClinic::query()->orderBy('name')->paginate(20);

        return VetClinicResource::collection($clinics);
    }

    public function store(StoreVetClinicRequest $request): JsonResponse
    {
        $clinic = VetClinic::query()->create($request->validated());

        return (new VetClinicResource($clinic))->response()->setStatusCode(201);
    }

    public function show(VetClinic $vetClinic): VetClinicResource
    {
        $this->authorize('view', $vetClinic);

        return new VetClinicResource($vetClinic);
    }

    public function update(UpdateVetClinicRequest $request, VetClinic $vetClinic): VetClinicResource
    {
        $vetClinic->update($request->validated());

        return new VetClinicResource($vetClinic->fresh());
    }

    public function destroy(VetClinic $vetClinic): Response
    {
        $this->authorize('delete', $vetClinic);

        $vetClinic->delete();

        return response()->noContent();
    }
}
