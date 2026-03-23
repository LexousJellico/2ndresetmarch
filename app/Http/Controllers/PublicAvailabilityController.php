<?php

namespace App\Http\Controllers;

use App\Models\CalendarBlock;
use App\Models\PublicEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicAvailabilityController extends Controller
{
    public function check(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'venue' => ['required', 'string', 'max:255'],
            'event_type' => ['nullable', 'string', 'max:255'],
            'guests' => ['nullable', 'integer', 'min:1'],
        ]);

        $date = $data['date'];
        $venue = trim((string) $data['venue']);
        $venueLower = mb_strtolower($venue);

        $blocks = CalendarBlock::query()
            ->whereDate('date_from', '<=', $date)
            ->whereDate('date_to', '>=', $date)
            ->where(function ($query) use ($venueLower) {
                $query
                    ->whereRaw('LOWER(area) = ?', [$venueLower])
                    ->orWhereRaw('LOWER(area) = ?', ['whole venue']);
            })
            ->orderBy('date_from')
            ->get();

        $events = PublicEvent::query()
            ->where('is_public', true)
            ->whereDate('event_date', $date)
            ->where(function ($query) use ($venueLower) {
                $query->whereRaw('LOWER(venue) = ?', [$venueLower]);
            })
            ->orderByDesc('is_highlighted')
            ->orderBy('sort_order')
            ->get();

        $hasGold = $blocks->contains(fn ($item) => ($item->public_status ?? 'red') === 'gold');
        $hasRed = $blocks->contains(fn ($item) => ($item->public_status ?? 'red') === 'red');
        $hasBlue = $blocks->contains(fn ($item) => ($item->public_status ?? 'red') === 'blue');

        if ($hasGold) {
            return response()->json([
                'status' => 'private_booked',
                'title' => 'Selected date appears fully booked for a private schedule',
                'description' => 'This date is currently reserved for a private booking window, so public details should remain hidden on the frontend.',
                'note' => 'Gold status means private and fully booked. Public users should not see the private event details.',
            ]);
        }

        if ($hasRed) {
            return response()->json([
                'status' => 'blocked',
                'title' => 'Selected date is unavailable',
                'description' => 'This date is currently blocked by the admin side for venue control, maintenance, or non-public restrictions.',
                'note' => 'Red status means the venue is unavailable and should not accept new public booking requests for the selected date.',
            ]);
        }

        if ($hasBlue || $events->isNotEmpty()) {
            $event = $events->first();

            return response()->json([
                'status' => 'public_booked',
                'title' => 'Selected date has a public event schedule',
                'description' => $event
                    ? 'This date already has a saved public event: ' . $event->title . '.'
                    : 'This date is currently marked as a public or government event schedule.',
                'note' => 'Blue status means the public event details can be shown to everyone on the public calendar.',
            ]);
        }

        return response()->json([
            'status' => 'available',
            'title' => 'Selected date is currently available',
            'description' => 'The selected venue and date currently have no saved public-event or blocked-status conflict on the public-side content layer.',
            'note' => 'This means the public checker can proceed as available, subject to final admin validation and full booking workflow rules.',
        ]);
    }
}