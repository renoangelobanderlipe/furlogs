<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreVetVisitAttachmentRequest;
use App\Http\Resources\VetVisitResource;
use App\Models\VetVisit;
use App\Services\VetVisitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class VetVisitAttachmentController extends Controller
{
    public function __construct(private readonly VetVisitService $service) {}

    public function store(StoreVetVisitAttachmentRequest $request, VetVisit $vetVisit): JsonResponse
    {
        $this->service->addAttachment($vetVisit, $request->file('attachment'));

        return (new VetVisitResource($vetVisit->load('media')))->response()->setStatusCode(201);
    }

    public function destroy(VetVisit $vetVisit, int $mediaId): Response
    {
        $this->authorize('update', $vetVisit);

        $media = Media::query()->where('model_type', VetVisit::class)
            ->where('model_id', $vetVisit->id)
            ->where('id', $mediaId)
            ->firstOrFail();

        $this->service->removeAttachment($vetVisit, $media);

        return response()->noContent();
    }
}
