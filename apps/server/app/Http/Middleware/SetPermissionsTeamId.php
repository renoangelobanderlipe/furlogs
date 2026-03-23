<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetPermissionsTeamId
{
    /**
     * Set the Spatie Permission team context to the user's current household.
     * This must run on every authenticated request so that hasRole() and
     * hasPermissionTo() are scoped to the correct household.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user !== null) {
            /** @var string|null $householdId */
            $householdId = $user->getAttribute('current_household_id');

            if ($householdId !== null) {
                setPermissionsTeamId($householdId);
            }
        }

        return $next($request);
    }
}
