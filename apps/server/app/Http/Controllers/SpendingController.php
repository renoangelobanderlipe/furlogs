<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\FoodStockItem;
use App\Models\VetVisit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SpendingController extends Controller
{
    /**
     * Return aggregated vet and food spending broken down by month for a given year.
     *
     * VetVisit uses BelongsToHouseholdViaPet global scope — household filtering is automatic.
     * FoodStockItem uses BelongsToHouseholdViaFoodProduct global scope — household filtering is automatic.
     * Production driver is PostgreSQL; SQLite is supported for test-environment compatibility only.
     */
    public function stats(Request $request): JsonResponse
    {
        $year = $request->integer('year', (int) now()->year);

        // Production uses PostgreSQL. SQLite expressions are kept for test-environment compatibility only.
        $isSqlite = DB::getDriverName() === 'sqlite';
        $vetMonthExpr = $isSqlite
            ? "CAST(strftime('%m', visit_date) AS INTEGER)"
            : 'EXTRACT(MONTH FROM visit_date)::integer';
        $foodMonthExpr = $isSqlite
            ? "CAST(strftime('%m', purchased_at) AS INTEGER)"
            : 'EXTRACT(MONTH FROM purchased_at)::integer';

        // Vet spending per month (scoped via BelongsToHouseholdViaPet global scope)
        $vetMonthly = VetVisit::query()
            ->selectRaw("{$vetMonthExpr} AS month, COALESCE(SUM(cost), 0) AS total")
            ->whereYear('visit_date', $year)
            ->groupByRaw($vetMonthExpr)
            ->pluck('total', 'month');

        // Food spending per month (scoped via BelongsToHouseholdViaFoodProduct global scope)
        $foodMonthly = FoodStockItem::query()
            ->selectRaw("{$foodMonthExpr} AS month, COALESCE(SUM(purchase_cost), 0) AS total")
            ->whereYear('purchased_at', $year)
            ->groupByRaw($foodMonthExpr)
            ->pluck('total', 'month');

        $monthly = collect(range(1, 12))->map(fn (int $m) => [
            'month' => $m,
            'vet' => (float) ($vetMonthly[$m] ?? 0),
            'food' => (float) ($foodMonthly[$m] ?? 0),
        ])->all();

        $vetYtdSpend = array_sum(array_column($monthly, 'vet'));
        $foodYtdSpend = array_sum(array_column($monthly, 'food'));

        return response()->json([
            'data' => [
                'year' => $year,
                'vetYtdSpend' => $vetYtdSpend,
                'foodYtdSpend' => $foodYtdSpend,
                'totalYtdSpend' => $vetYtdSpend + $foodYtdSpend,
                'monthly' => $monthly,
            ],
        ]);
    }
}
