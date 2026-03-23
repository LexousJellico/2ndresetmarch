<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserNotificationResource;
use App\Models\UserNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * JSON summary for bell polling.
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            abort(403);
        }

        $unread = $user->notifications()
            ->whereNull('read_at')
            ->count();

        $latest = $user->notifications()
            ->latest()
            ->limit(10)
            ->get();

        $latestPayload = UserNotificationResource::collection($latest)
            ->response()
            ->getData(true);

        return response()->json([
            'unread_count' => $unread,
            'latest'       => $latestPayload['data'] ?? [],
        ]);
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        if (! $user) {
            abort(403);
        }

        $perPage = (int) $request->integer('per_page', 20);

        $paginator = $user->notifications()
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('notifications/index', [
            'notificationFeed' => UserNotificationResource::collection($paginator)
                ->response()
                ->getData(true),
        ]);
    }

    public function open(Request $request, UserNotification $notification): RedirectResponse
    {
        $user = $request->user();

        if (! $user || (int) $notification->user_id !== (int) $user->id) {
            abort(403);
        }

        $notification->markAsRead();

        $redirectTo = $notification->link ?: route('notifications.index');

        return redirect()->to($redirectTo);
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user) {
            $user->notifications()
                ->whereNull('read_at')
                ->update(['read_at' => now()]);
        }

        return back();
    }
}
