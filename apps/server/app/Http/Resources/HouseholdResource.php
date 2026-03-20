<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Enums\HouseholdRole;
use App\Models\Household;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Household */
class HouseholdResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Household $household */
        $household = $this->resource;

        $members = $household->members->map(function ($user): array {
            $role = $user->pivot->role;
            $joinedAt = $user->pivot->joined_at;

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role instanceof HouseholdRole ? $role->value : (string) $role,
                'joinedAt' => $joinedAt instanceof Carbon
                    ? $joinedAt->toDateString()
                    : (is_string($joinedAt) ? substr($joinedAt, 0, 10) : null),
            ];
        });

        return [
            'id' => $household->id,
            'name' => $household->name,
            'members' => $members,
        ];
    }
}
