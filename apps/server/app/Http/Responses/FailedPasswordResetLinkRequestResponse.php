<?php

declare(strict_types=1);

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\FailedPasswordResetLinkRequestResponse as Contract;

class FailedPasswordResetLinkRequestResponse implements Contract
{
    public function __construct(protected string $status) {}

    public function toResponse($request): JsonResponse
    {
        return response()->json([
            'message' => __('passwords.sent'),
        ]);
    }
}
