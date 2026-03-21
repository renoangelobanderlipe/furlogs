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
        $role = $this->pivot->role ?? HouseholdRole::Member;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'role' => $role->value,
        ];
    }
}
