<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Notifications\DatabaseNotification;

/** @mixin DatabaseNotification */
class NotificationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var array<string, mixed> $data */
        $data = $this->getAttribute('data') ?? [];

        return [
            'id' => $this->getKey(),
            'type' => $data['type'] ?? null,
            'data' => $data,
            'readAt' => $this->getAttribute('read_at')?->toISOString(),
            'createdAt' => $this->getAttribute('created_at')?->toISOString(),
        ];
    }
}
