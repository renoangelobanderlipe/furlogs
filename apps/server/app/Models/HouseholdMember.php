<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\HouseholdRole;
use Database\Factories\HouseholdMemberFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'household_id', 'role', 'invited_at', 'joined_at'])]
class HouseholdMember extends Model
{
    /** @use HasFactory<HouseholdMemberFactory> */
    use HasFactory;

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
