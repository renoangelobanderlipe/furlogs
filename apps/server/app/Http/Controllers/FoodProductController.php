<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreConsumptionRateRequest;
use App\Http\Requests\StoreFoodProductRequest;
use App\Http\Requests\UpdateFoodProductRequest;
use App\Http\Resources\FoodConsumptionRateResource;
use App\Http\Resources\FoodProductResource;
use App\Models\FoodConsumptionRate;
use App\Models\FoodProduct;
use App\Models\Pet;
use App\Services\FoodStockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class FoodProductController extends Controller
{
    public function __construct(private readonly FoodStockService $foodStockService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', FoodProduct::class);

        $products = FoodProduct::query()
            ->with('consumptionRates')
            ->paginate(20);

        return FoodProductResource::collection($products);
    }

    public function show(Request $request, FoodProduct $foodProduct): FoodProductResource
    {
        $this->authorize('view', $foodProduct);

        $foodProduct->load('consumptionRates');

        return new FoodProductResource($foodProduct);
    }

    public function store(StoreFoodProductRequest $request): JsonResponse
    {
        $product = $this->foodStockService->createProduct($request->validated());
        $product->load('consumptionRates');

        return (new FoodProductResource($product))->response()->setStatusCode(201);
    }

    public function update(UpdateFoodProductRequest $request, FoodProduct $foodProduct): FoodProductResource
    {
        $product = $this->foodStockService->updateProduct($foodProduct, $request->validated());
        $product->load('consumptionRates');

        return new FoodProductResource($product);
    }

    public function destroy(Request $request, FoodProduct $foodProduct): Response
    {
        $this->authorize('delete', $foodProduct);

        $this->foodStockService->deleteProduct($foodProduct);

        return response()->noContent();
    }

    public function storeConsumptionRate(StoreConsumptionRateRequest $request, FoodProduct $foodProduct): JsonResponse
    {
        // Authorization is handled in StoreConsumptionRateRequest::authorize()
        $pet = Pet::query()->findOrFail($request->validated('pet_id'));

        $rate = $this->foodStockService->updateConsumptionRate(
            $foodProduct,
            $pet,
            (int) $request->validated('daily_amount_grams'),
        );

        return response()->json(new FoodConsumptionRateResource($rate), 200);
    }

    public function destroyConsumptionRate(Request $request, FoodProduct $foodProduct, Pet $pet): Response
    {
        $this->authorize('update', $foodProduct);

        FoodConsumptionRate::query()
            ->where('food_product_id', $foodProduct->id)
            ->where('pet_id', $pet->id)
            ->delete();

        return response()->noContent();
    }
}
