<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\FoodType;
use App\Enums\UnitType;
use App\Traits\BelongsToHousehold;
use Carbon\Carbon;
use Database\Factories\FoodProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int $household_id
 * @property string $name
 * @property string|null $brand
 * @property FoodType $type
 * @property int|null $unit_weight_grams
 * @property UnitType $unit_type
 * @property int $alert_threshold_pct
 * @property string|null $notes
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['household_id', 'name', 'brand', 'type', 'unit_weight_grams', 'unit_type', 'alert_threshold_pct', 'notes'])]
class FoodProduct extends Model
{
    /** @use HasFactory<FoodProductFactory> */
    use BelongsToHousehold, HasFactory, SoftDeletes;

    /**
     * @return array<string, mixed>
     */
    protected function casts(): array
    {
        return [
            'type' => FoodType::class,
            'unit_type' => UnitType::class,
            'unit_weight_grams' => 'integer',
            'alert_threshold_pct' => 'integer',
        ];
    }

    /** @return HasMany<FoodStockItem, $this> */
    public function stockItems(): HasMany
    {
        return $this->hasMany(FoodStockItem::class);
    }

    /** @return HasMany<FoodConsumptionRate, $this> */
    public function consumptionRates(): HasMany
    {
        return $this->hasMany(FoodConsumptionRate::class);
    }

    /** @return HasManyThrough<Pet, FoodConsumptionRate, $this> */
    public function pets(): HasManyThrough
    {
        return $this->hasManyThrough(Pet::class, FoodConsumptionRate::class, 'food_product_id', 'id', 'id', 'pet_id');
    }
}
