<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        // Roles are team-scoped (household_id = team_id).
        // These are templates; actual role assignment uses setPermissionsTeamId().
        // Creating with team_id = null acts as a global template for Spatie to
        // reference when assigning roles scoped to a specific team at runtime.
        foreach (['owner', 'member'] as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }
    }
}
