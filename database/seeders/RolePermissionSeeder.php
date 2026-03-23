<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Make sure all permissions exist
        $permissions = [
            'dashboard.view',
            'bookings.view',
            'bookings.create',
            'bookings.update',
            'bookings.delete',
            'payments.manage',
            'services.manage',
            'service_types.manage',
            'users.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission, 'guard_name' => 'web'],
                ['name' => $permission, 'guard_name' => 'web'],
            );
        }

        // 2. Create roles
        $admin   = Role::firstOrCreate(['name' => 'admin',   'guard_name' => 'web']);
        $manager = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'web']);
        $staff   = Role::firstOrCreate(['name' => 'staff',   'guard_name' => 'web']);
        $userRole = Role::firstOrCreate(['name' => 'user',   'guard_name' => 'web']);

        // 3. Assign permissions to roles

        // Admin: everything
        $admin->syncPermissions(Permission::all());

        // Manager: everything except delete bookings and manage users
        $manager->syncPermissions([
            'dashboard.view',
            'bookings.view',
            'bookings.create',
            'bookings.update',
            'payments.manage',
            'services.manage',
            'service_types.manage',
        ]);

        // Staff: read-only dashboard + bookings
        $staff->syncPermissions([
            'dashboard.view',
            'bookings.view',
        ]);

        // ✅ NEW: front-end User role: dashboard + bookings (full, but no delete, no payments)
        $userRole->syncPermissions([
            'dashboard.view',
            'bookings.view',
            'bookings.create',
            'bookings.update',
        ]);

        // 4. Make sure the very first user is admin
        $firstUser = User::query()->orderBy('id')->first();
        if ($firstUser && ! $firstUser->hasRole('admin')) {
            $firstUser->assignRole('admin');
        }
    }
}
