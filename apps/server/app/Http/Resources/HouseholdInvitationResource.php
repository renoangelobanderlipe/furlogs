<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\HouseholdInvitation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin HouseholdInvitation */
class HouseholdInvitationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'token' => $this->token,
            'status' => $this->status,
            'expires_at' => $this->expires_at,
            'household_name' => $this->whenLoaded('household', fn () => $this->household->name),
            'inviter_name' => $this->whenLoaded('inviter', fn () => $this->inviter->name),
        ];
    }
}
