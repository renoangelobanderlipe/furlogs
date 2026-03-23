<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Database\Factories\FoodConsumptionRateFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * @property string $id
 * @property string $food_product_id
 * @property string $pet_id
 * @property int $daily_amount_grams
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
#[Fillable(['food_product_id', 'pet_id', 'daily_amount_grams'])]
class FoodConsumptionRate extends Model
{
    /** @use HasFactory<FoodConsumptionRateFactory> */
    use HasFactory, HasUuids, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['daily_amount_grams'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * @return array<string, mixed>
     */
    protected function casts(): array
    {
        return [
            'daily_amount_grams' => 'integer',
        ];
    }

    /** @return BelongsTo<FoodProduct, $this> */
    public function foodProduct(): BelongsTo
    {
        return $this->belongsTo(FoodProduct::class);
    }

    /** @return BelongsTo<Pet, $this> */
    public function pet(): BelongsTo
    {
        return $this->belongsTo(Pet::class);
    }
}
