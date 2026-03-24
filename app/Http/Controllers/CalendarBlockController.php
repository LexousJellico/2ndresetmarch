<?php

namespace App\Http\Controllers;

use App\Models\CalendarBlock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CalendarBlockController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'area' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'block' => ['required', Rule::in(['AM', 'PM', 'EVE', 'DAY'])],
            'public_status' => ['required', Rule::in(['red', 'gold', 'blue'])],
            'date_from' => ['required', 'date'],
            'date_to' => ['required', 'date', 'after_or_equal:date_from'],
        ]);

        $calendarBlock = CalendarBlock::query()->create([
            'title' => $data['title'],
            'area' => $data['area'] ?? null,
            'notes' => $data['notes'] ?? null,
            'block' => $data['block'],
            'public_status' => $data['public_status'],
            'date_from' => $data['date_from'],
            'date_to' => $data['date_to'],
            'created_by_user_id' => $request->user()?->id,
        ]);

        return response()->json([
            'message' => 'Calendar block created successfully.',
            'item' => $this->row($calendarBlock->fresh()),
        ]);
    }

    public function update(Request $request, CalendarBlock $calendarBlock): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'area' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'block' => ['required', Rule::in(['AM', 'PM', 'EVE', 'DAY'])],
            'public_status' => ['required', Rule::in(['red', 'gold', 'blue'])],
            'date_from' => ['required', 'date'],
            'date_to' => ['required', 'date', 'after_or_equal:date_from'],
        ]);

        $calendarBlock->update([
            'title' => $data['title'],
            'area' => $data['area'] ?? null,
            'notes' => $data['notes'] ?? null,
            'block' => $data['block'],
            'public_status' => $data['public_status'],
            'date_from' => $data['date_from'],
            'date_to' => $data['date_to'],
        ]);

        return response()->json([
            'message' => 'Calendar block updated successfully.',
            'item' => $this->row($calendarBlock->fresh()),
        ]);
    }

    public function destroy(Request $request, CalendarBlock $calendarBlock): JsonResponse
    {
        $this->ensureAdmin($request);

        $id = $calendarBlock->id;
        $calendarBlock->delete();

        return response()->json([
            'message' => 'Calendar block deleted successfully.',
            'id' => $id,
        ]);
    }

    protected function row(CalendarBlock $calendarBlock): array
    {
        return [
            'id' => $calendarBlock->id,
            'title' => $calendarBlock->title,
            'area' => $calendarBlock->area ?? '',
            'block' => $calendarBlock->block,
            'dateFrom' => $calendarBlock->date_from,
            'dateTo' => $calendarBlock->date_to,
            'note' => $calendarBlock->notes ?? '',
            'statusColor' => $calendarBlock->public_status ?? 'red',
        ];
    }

    protected function ensureAdmin(Request $request): void
    {
        $user = $request->user();

        if (! $user || ! $user->hasAnyRole(['admin', 'manager'])) {
            abort(403);
        }
    }
}
