<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\HouseholdRole;
use Carbon\Carbon;
use Database\Factories\HouseholdMemberFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * @property HouseholdRole $role
 * @property Carbon|null $joined_at
 *
 * Note: LogsActivity is intentionally NOT applied here. This model extends Pivot,
 * and spatie/laravel-activitylog does not work reliably with Eloquent Pivot models
 * because they lack the standard primary-key / model-event lifecycle that the trait depends on.
 */
#[Fillable(['user_id', 'household_id', 'role', 'invited_at', 'joined_at'])]
class HouseholdMember extends Pivot
{
    /** @use HasFactory<HouseholdMemberFactory> */
    use HasFactory, HasUuids;

    protected $table = 'household_members';

    protected function casts(): array
    {
        return [
            'role' => HouseholdRole::class,
            'invited_at' => 'datetime',
            'joined_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Household, $this> */
    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class);
    }
}
