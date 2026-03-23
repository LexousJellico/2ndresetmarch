<?php

namespace App\Http\Controllers;

use App\Models\CalendarBlock;
use App\Services\BookingService;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CalendarBlockController extends Controller
{
    public function __construct(
        protected BookingService $bookings,
        protected NotificationService $notifications,
    ) {
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user || ! $user->hasAnyRole(['admin', 'manager'])) {
            abort(403);
        }

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'area' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'block' => ['required', Rule::in(['AM', 'PM', 'EVE', 'DAY'])],
            'public_status' => ['required', Rule::in(['red', 'gold', 'blue'])],
            'date_from' => ['required', 'date_format:Y-m-d'],
            'date_to' => ['required', 'date_format:Y-m-d', 'after_or_equal:date_from'],
        ]);

        $from = Carbon::createFromFormat('Y-m-d', $data['date_from'])->startOfDay();
        $to = Carbon::createFromFormat('Y-m-d', $data['date_to'])->startOfDay();

        if ($to->diffInDays($from) > 62) {
            return response()->json([
                'message' => 'Date range too large. Please block at most 62 days at a time.',
                'errors' => ['date_to' => ['Date range too large (max 62 days).']],
            ], 422);
        }

        $blockKeysToCheck = $data['block'] === 'DAY'
            ? ['AM', 'PM', 'EVE']
            : [$data['block']];

        $conflicts = [];
        $cursor = $from->copy();

        while ($cursor->lte($to)) {
            $dateKey = $cursor->format('Y-m-d');
            $availability = $this->bookings->getDailyAvailability($dateKey, null);
            $blocks = $availability['blocks'] ?? [];

            foreach ($blockKeysToCheck as $bk) {
                $isAvailable = data_get($blocks, $bk . '.is_available', null);

                if ($isAvailable !== true) {
                    $conflicts[] = $dateKey . ' ' . $bk;
                }
            }

            $cursor->addDay();
        }

        if (! empty($conflicts)) {
            return response()->json([
                'message' => 'Some selected dates/blocks are already unavailable.',
                'errors' => ['conflicts' => $conflicts],
            ], 422);
        }

        $block = CalendarBlock::create([
            'title' => $data['title'],
            'area' => $data['area'],
            'notes' => $data['notes'] ?? null,
            'block' => $data['block'],
            'public_status' => $data['public_status'],
            'date_from' => $data['date_from'],
            'date_to' => $data['date_to'],
            'created_by_user_id' => $user->id,
        ]);

        $this->notifications->calendarBlockCreated($block, $user);

        return response()->json([
            'ok' => true,
            'block' => $this->mapBlock($block),
        ]);
    }

    public function update(Request $request, CalendarBlock $calendarBlock): JsonResponse
    {
        $user = $request->user();

        if (! $user || ! $user->hasAnyRole(['admin', 'manager'])) {
            abort(403);
        }

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'area' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'block' => ['required', Rule::in(['AM', 'PM', 'EVE', 'DAY'])],
            'public_status' => ['required', Rule::in(['red', 'gold', 'blue'])],
            'date_from' => ['required', 'date_format:Y-m-d'],
            'date_to' => ['required', 'date_format:Y-m-d', 'after_or_equal:date_from'],
        ]);

        $from = Carbon::createFromFormat('Y-m-d', $data['date_from'])->startOfDay();
        $to = Carbon::createFromFormat('Y-m-d', $data['date_to'])->startOfDay();

        if ($to->diffInDays($from) > 62) {
            return response()->json([
                'message' => 'Date range too large. Please block at most 62 days at a time.',
                'errors' => ['date_to' => ['Date range too large (max 62 days).']],
            ], 422);
        }

        $calendarBlock->update([
            'title' => $data['title'],
            'area' => $data['area'],
            'notes' => $data['notes'] ?? null,
            'block' => $data['block'],
            'public_status' => $data['public_status'],
            'date_from' => $data['date_from'],
            'date_to' => $data['date_to'],
        ]);

        return response()->json([
            'ok' => true,
            'block' => $this->mapBlock($calendarBlock->fresh()),
        ]);
    }

    public function destroy(Request $request, CalendarBlock $calendarBlock): JsonResponse
    {
        $user = $request->user();

        if (! $user || ! $user->hasAnyRole(['admin', 'manager'])) {
            abort(403);
        }

        $this->notifications->calendarBlockDeleted($calendarBlock, $user);
        $calendarBlock->delete();

        return response()->json(['ok' => true]);
    }

    protected function mapBlock(CalendarBlock $block): array
    {
        return [
            'id' => $block->id,
            'title' => $block->title,
            'area' => $block->area,
            'note' => $block->notes ?? '',
            'block' => $block->block,
            'public_status' => $block->public_status ?? 'red',
            'date_from' => optional($block->date_from)->format('Y-m-d'),
            'date_to' => optional($block->date_to)->format('Y-m-d'),
        ];
    }
}