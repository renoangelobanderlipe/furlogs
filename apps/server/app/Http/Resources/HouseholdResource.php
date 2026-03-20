<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Household;
use App\Models\HouseholdMember;
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

        $members = $household->householdMembers->map(function (HouseholdMember $member): array {
            $role = $member->role;
            $joinedAt = $member->joined_at;
            $user = $member->user;

            return [
                'id' => $user?->id,
                'name' => $user?->name,
                'email' => $user?->email,
                'role' => $role->value,
                'joinedAt' => $joinedAt?->toDateString(),
            ];
        });

        return [
            'id' => $household->id,
            'name' => $household->name,
            'members' => $members,
        ];
    }
}
