<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreFoodStockItemRequest;
use App\Http\Requests\UpdateFoodStockItemRequest;
use App\Http\Resources\FoodProjectionResource;
use App\Http\Resources\FoodStockItemResource;
use App\Models\FoodProduct;
use App\Models\FoodStockItem;
use App\Services\FoodStockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class FoodStockItemController extends Controller
{
    public function __construct(private readonly FoodStockService $foodStockService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', FoodStockItem::class);

        $items = FoodStockItem::query()
            ->whereHas('foodProduct', fn ($q) => $q->where('household_id', $request->user()->current_household_id))
            ->with(['foodProduct', 'consumptionLog'])
            ->orderByRaw("CASE status WHEN 'open' THEN 0 WHEN 'sealed' THEN 1 WHEN 'finished' THEN 2 ELSE 3 END")
            ->paginate(20);

        return FoodStockItemResource::collection($items);
    }

    public function show(Request $request, FoodStockItem $foodStockItem): FoodStockItemResource
    {
        $this->authorize('view', $foodStockItem);

        $foodStockItem->load(['foodProduct', 'consumptionLog']);

        return new FoodStockItemResource($foodStockItem);
    }

    public function store(StoreFoodStockItemRequest $request): JsonResponse
    {
        $product = FoodProduct::query()->findOrFail($request->validated('food_product_id'));

        $item = $this->foodStockService->logPurchase($product, $request->validated());

        return (new FoodStockItemResource($item))->response()->setStatusCode(201);
    }

    public function update(UpdateFoodStockItemRequest $request, FoodStockItem $foodStockItem): FoodStockItemResource
    {
        $foodStockItem->update($request->validated());

        return new FoodStockItemResource($foodStockItem->fresh());
    }

    public function destroy(FoodStockItem $foodStockItem): Response
    {
        $this->authorize('delete', $foodStockItem);

        $foodStockItem->delete();

        return response()->noContent();
    }

    public function open(FoodStockItem $foodStockItem): FoodStockItemResource
    {
        $this->authorize('update', $foodStockItem);

        $item = $this->foodStockService->openItem($foodStockItem);

        return new FoodStockItemResource($item);
    }

    public function markFinished(FoodStockItem $foodStockItem): FoodStockItemResource
    {
        $this->authorize('update', $foodStockItem);

        $item = $this->foodStockService->markFinished($foodStockItem);

        return new FoodStockItemResource($item);
    }

    public function projections(Request $request): AnonymousResourceCollection
    {
        $householdId = $request->user()->current_household_id;

        $projections = $this->foodStockService->getProjections($householdId);

        $order = ['critical' => 0, 'low' => 1, 'good' => 2];
        usort($projections, fn (array $a, array $b): int => ($order[$a['projection']->status ?? 'none'] ?? 3) <=> ($order[$b['projection']->status ?? 'none'] ?? 3),
        );

        return FoodProjectionResource::collection($projections);
    }
}
