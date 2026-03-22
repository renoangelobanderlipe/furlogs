<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToHouseholdViaFoodStockItem;
use Carbon\Carbon;
use Database\Factories\FoodConsumptionLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $food_stock_item_id
 * @property int $actual_duration_days
 * @property int $actual_daily_rate_grams
 * @property string $estimated_vs_actual_diff
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
#[Fillable(['food_stock_item_id', 'actual_duration_days', 'actual_daily_rate_grams', 'estimated_vs_actual_diff'])]
class FoodConsumptionLog extends Model
{
    /** @use HasFactory<FoodConsumptionLogFactory> */
    use BelongsToHouseholdViaFoodStockItem, HasFactory, HasUuids;

    /**
     * @return array<string, mixed>
     */
    protected function casts(): array
    {
        return [
            'actual_duration_days' => 'integer',
            'actual_daily_rate_grams' => 'integer',
            'estimated_vs_actual_diff' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<FoodStockItem, $this> */
    public function stockItem(): BelongsTo
    {
        return $this->belongsTo(FoodStockItem::class, 'food_stock_item_id');
    }
}
