<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserRoleController extends Controller
{
    public function __construct(private readonly NotificationService $notifications)
    {
    }

    public function index(): Response
    {
        $users = User::query()->orderBy('id')->get()->map(function (User $u) {
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'roles' => $u->roles->pluck('name')->all(),
            ];
        });

        $availableRoles = Role::query()->pluck('name')->all();

        return Inertia::render('users/roles', [
            'users' => $users,
            'availableRoles' => $availableRoles,
        ]);
    }

    public function update(User $user, Request $request): RedirectResponse
    {
        $actor = $request->user();
        $oldRoles = $user->roles->pluck('name')->all();

        $data = $request->validate([
            'roles' => ['array'],
            'roles.*' => ['string'],
        ]);

        $requestedRoles = collect($data['roles'] ?? [])
            ->filter(fn ($r) => Role::where('name', $r)->exists())
            ->values()
            ->all();

        $user->syncRoles($requestedRoles);

        $newRoles = $user->roles->pluck('name')->all();

        if ($actor) {
            $oldSorted = $oldRoles;
            $newSorted = $newRoles;
            sort($oldSorted);
            sort($newSorted);

            if ($oldSorted !== $newSorted) {
                $this->notifications->userRolesUpdated($user, $actor, $oldRoles, $newRoles);
            }
        }

        return back()->with('success', 'Roles updated for user: ' . $user->email);
    }
}
