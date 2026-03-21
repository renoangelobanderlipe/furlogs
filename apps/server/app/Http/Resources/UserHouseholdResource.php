<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Enums\HouseholdRole;
use App\Models\Household;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Household */
class UserHouseholdResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Household $household */
        $household = $this->resource;

        /** @var HouseholdRole|string $role */
        $role = $household->pivot->role ?? HouseholdRole::Member;

        return [
            'id' => $household->id,
            'name' => $household->name,
            'role' => $role instanceof HouseholdRole ? $role->value : $role,
        ];
    }
}
