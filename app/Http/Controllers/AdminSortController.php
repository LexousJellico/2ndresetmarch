<?php

namespace App\Http\Controllers;

use App\Models\FeaturePackage;
use App\Models\HomepageStat;
use App\Models\PublicEvent;
use App\Models\VenueSpace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminSortController extends Controller
{
    public function events(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'scope' => ['required', Rule::in(['bccc', 'city'])],
            'ordered_ids' => ['required', 'array', 'min:1'],
            'ordered_ids.*' => ['integer'],
        ]);

        $ids = array_values($data['ordered_ids']);

        $records = PublicEvent::query()
            ->where('scope', $data['scope'])
            ->whereIn('id', $ids)
            ->pluck('id')
            ->all();

        if (count($records) !== count($ids)) {
            return response()->json([
                'message' => 'Some events could not be found for the selected scope.',
            ], 422);
        }

        DB::transaction(function () use ($ids) {
            foreach ($ids as $index => $id) {
                PublicEvent::query()
                    ->whereKey($id)
                    ->update(['sort_order' => $index + 1]);
            }
        });

        return response()->json(['ok' => true]);
    }

    public function packages(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);
        $this->applySort($request, FeaturePackage::class);

        return response()->json(['ok' => true]);
    }

    public function spaces(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);
        $this->applySort($request, VenueSpace::class);

        return response()->json(['ok' => true]);
    }

    public function stats(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);
        $this->applySort($request, HomepageStat::class);

        return response()->json(['ok' => true]);
    }

    protected function applySort(Request $request, string $modelClass): void
    {
        $data = $request->validate([
            'ordered_ids' => ['required', 'array', 'min:1'],
            'ordered_ids.*' => ['integer'],
        ]);

        $ids = array_values($data['ordered_ids']);

        $records = $modelClass::query()
            ->whereIn('id', $ids)
            ->pluck('id')
            ->all();

        if (count($records) !== count($ids)) {
            abort(422, 'Some sortable items could not be found.');
        }

        DB::transaction(function () use ($ids, $modelClass) {
            foreach ($ids as $index => $id) {
                $modelClass::query()
                    ->whereKey($id)
                    ->update(['sort_order' => $index + 1]);
            }
        });
    }

    protected function ensureAdmin(Request $request): void
    {
        $user = $request->user();

        if (! $user || ! $user->hasAnyRole(['admin', 'manager'])) {
            abort(403);
        }
    }
}