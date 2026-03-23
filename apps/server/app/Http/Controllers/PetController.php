<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StorePetRequest;
use App\Http\Requests\UpdatePetRequest;
use App\Http\Requests\UploadPetAvatarRequest;
use App\Http\Resources\PetResource;
use App\Models\Pet;
use App\Services\PetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class PetController extends Controller
{
    public function __construct(private readonly PetService $petService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Pet::class);

        $pets = Pet::query()
            ->with('latestWeight')
            ->when($request->query('species'), fn ($q, $s) => $q->where('species', $s))
            // PostgreSQL only — do not switch DB driver without updating this operator
            ->when($request->query('search'), fn ($q, $s) => $q->where('name', 'ilike', "%{$s}%"))
            ->orderBy('name')
            ->paginate((int) $request->query('per_page', 20));

        return PetResource::collection($pets);
    }

    public function show(Request $request, Pet $pet): PetResource
    {
        $this->authorize('view', $pet);

        $pet->loadMissing('latestWeight');

        if ($request->query('include') === 'weights') {
            $pet->load('weights');
        }

        return new PetResource($pet);
    }

    public function store(StorePetRequest $request): JsonResponse
    {
        $pet = $this->petService->create($request->validated());
        $pet->loadMissing('latestWeight');

        return (new PetResource($pet))->response()->setStatusCode(201);
    }

    public function update(UpdatePetRequest $request, Pet $pet): PetResource
    {
        $pet = $this->petService->update($pet, $request->validated());
        $pet->loadMissing('latestWeight');

        return new PetResource($pet);
    }

    public function uploadAvatar(UploadPetAvatarRequest $request, Pet $pet): JsonResponse
    {
        $this->authorize('update', $pet);

        $this->petService->uploadAvatar($pet, $request->file('avatar'));

        $freshPet = $pet->fresh(['latestWeight']);

        return response()->json(new PetResource($freshPet), 200);
    }

    public function destroy(Pet $pet): Response
    {
        $this->authorize('delete', $pet);

        $this->petService->delete($pet);

        return response()->noContent();
    }
}
