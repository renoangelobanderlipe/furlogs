<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StorePetWeightRequest;
use App\Http\Resources\PetWeightResource;
use App\Models\Pet;
use App\Services\PetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PetWeightController extends Controller
{
    public function __construct(private readonly PetService $petService) {}

    public function index(Pet $pet): AnonymousResourceCollection
    {
        $this->authorize('view', $pet);

        $weights = $pet->weights()->orderByDesc('recorded_at')->get();

        return PetWeightResource::collection($weights);
    }

    public function store(StorePetWeightRequest $request, Pet $pet): JsonResponse
    {
        $weight = $this->petService->recordWeight(
            pet: $pet,
            weight: (float) $request->validated('weight_kg'),
            date: (string) $request->validated('recorded_at'),
        );

        return (new PetWeightResource($weight))->response()->setStatusCode(201);
    }
}
