<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\StockStatus;
use App\Observers\FoodStockItemObserver;
use App\Traits\BelongsToHouseholdViaFoodProduct;
use Carbon\Carbon;
use Database\Factories\FoodStockItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property string $id
 * @property string $food_product_id
 * @property StockStatus $status
 * @property Carbon $purchased_at
 * @property Carbon|null $opened_at
 * @property Carbon|null $finished_at
 * @property string|null $purchase_cost
 * @property string|null $purchase_source
 * @property int $quantity
 * @property string|null $notes
 * @property int|null $days_since_opened
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
#[Fillable(['food_product_id', 'status', 'purchased_at', 'opened_at', 'finished_at', 'purchase_cost', 'purchase_source', 'quantity', 'notes'])]
#[ObservedBy(FoodStockItemObserver::class)]
class FoodStockItem extends Model
{
    /** @use HasFactory<FoodStockItemFactory> */
    use BelongsToHouseholdViaFoodProduct, HasFactory, HasUuids;

    /**
     * @return array<string, mixed>
     */
    protected function casts(): array
    {
        return [
            'status' => StockStatus::class,
            'purchased_at' => 'date',
            'opened_at' => 'date',
            'finished_at' => 'date',
            'purchase_cost' => 'decimal:2',
            'quantity' => 'integer',
        ];
    }

    /** @return BelongsTo<FoodProduct, $this> */
    public function foodProduct(): BelongsTo
    {
        return $this->belongsTo(FoodProduct::class);
    }

    /** @return HasOne<FoodConsumptionLog, $this> */
    public function consumptionLog(): HasOne
    {
        return $this->hasOne(FoodConsumptionLog::class, 'food_stock_item_id');
    }

    /**
     * Get the number of days since the item was opened.
     *
     * @return Attribute<int|null, never>
     */
    protected function daysSinceOpened(): Attribute
    {
        return Attribute::make(
            get: function (): ?int {
                if ($this->opened_at === null) {
                    return null;
                }

                return (int) $this->opened_at->diffInDays(now());
            },
        );
    }
}
