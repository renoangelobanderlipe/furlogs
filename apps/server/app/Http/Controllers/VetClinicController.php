<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Resources\VetClinicResource;
use App\Models\VetClinic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class VetClinicController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $clinics = VetClinic::query()->orderBy('name')->paginate(20);

        return VetClinicResource::collection($clinics);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', VetClinic::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $clinic = VetClinic::query()->create($validated);

        return (new VetClinicResource($clinic))->response()->setStatusCode(201);
    }

    public function show(VetClinic $vetClinic): VetClinicResource
    {
        $this->authorize('view', $vetClinic);

        return new VetClinicResource($vetClinic);
    }

    public function update(Request $request, VetClinic $vetClinic): VetClinicResource
    {
        $this->authorize('update', $vetClinic);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ]);

        $vetClinic->update($validated);

        return new VetClinicResource($vetClinic->fresh());
    }

    public function destroy(VetClinic $vetClinic): Response
    {
        $this->authorize('delete', $vetClinic);

        $vetClinic->delete();

        return response()->noContent();
    }
}
