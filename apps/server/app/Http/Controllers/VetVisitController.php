<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreVetVisitRequest;
use App\Http\Requests\UpdateVetVisitRequest;
use App\Http\Resources\VetVisitResource;
use App\Models\VetVisit;
use App\Services\VetVisitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class VetVisitController extends Controller
{
    public function __construct(private readonly VetVisitService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', VetVisit::class);

        $visits = VetVisit::query()
            ->with(['pet', 'clinic', 'media'])
            ->when($request->query('pet_id'), fn ($q, string $petId) => $q->where('pet_id', $petId))
            ->when($request->query('visit_type'), fn ($q, $type) => $q->where('visit_type', $type))
            ->when(
                $request->query('search'),
                // PostgreSQL ILIKE — do not switch DB driver without updating this operator
                fn ($q, $s) => $q->where(fn ($sub) => $sub
                    ->where('reason', 'ilike', "%{$s}%")
                    ->orWhere('diagnosis', 'ilike', "%{$s}%"),
                ),
            )
            ->orderBy('visit_date', 'desc')
            ->paginate((int) $request->query('per_page', 5));

        return VetVisitResource::collection($visits);
    }

    public function show(Request $request, VetVisit $vetVisit): VetVisitResource
    {
        $this->authorize('view', $vetVisit);

        $includes = explode(',', (string) $request->query('include', ''));

        $vetVisit->load('clinic');

        if (in_array('medications', $includes, true)) {
            $vetVisit->load('medications');
        }

        if (in_array('attachments', $includes, true)) {
            $vetVisit->load('media');
        }

        return new VetVisitResource($vetVisit);
    }

    public function store(StoreVetVisitRequest $request): JsonResponse
    {
        $data = $request->safe()->except('attachments');
        $attachments = $request->file('attachments', []);

        $visit = $this->service->create($data, $attachments);

        return (new VetVisitResource($visit->load('pet', 'clinic')))->response()->setStatusCode(201);
    }

    public function update(UpdateVetVisitRequest $request, VetVisit $vetVisit): VetVisitResource
    {
        $visit = $this->service->update($vetVisit, $request->validated());

        return new VetVisitResource($visit);
    }

    public function destroy(VetVisit $vetVisit): Response
    {
        $this->authorize('delete', $vetVisit);

        $this->service->delete($vetVisit);

        return response()->noContent();
    }

    public function bulkDestroy(Request $request): Response
    {
        $this->authorize('bulkDelete', VetVisit::class);

        $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['string', 'uuid'],
        ]);

        $this->service->bulkDelete($request->input('ids'));

        return response()->noContent();
    }

    public function stats(Request $request): JsonResponse
    {
        $this->authorize('viewAny', VetVisit::class);

        $yearStart = now()->startOfYear()->toDateString();

        $ytdVisits = VetVisit::query()
            ->where('visit_date', '>=', $yearStart)
            ->count();

        $ytdSpend = VetVisit::query()
            ->where('visit_date', '>=', $yearStart)
            ->whereNotNull('cost')
            ->sum('cost');

        $lastVisit = VetVisit::query()
            ->orderBy('visit_date', 'desc')
            ->value('visit_date');

        $topClinic = VetVisit::query()
            ->with('clinic')
            ->whereNotNull('clinic_id')
            ->select('clinic_id', DB::raw('count(*) as visit_count'))
            ->groupBy('clinic_id')
            ->orderByDesc('visit_count')
            ->first()?->clinic?->name;

        return response()->json([
            'data' => [
                'ytdVisits' => $ytdVisits,
                'ytdSpend' => (float) $ytdSpend,
                'lastVisitDate' => $lastVisit,
                'topClinic' => $topClinic,
            ],
        ]);
    }
}
