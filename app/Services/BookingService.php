<?php

namespace App\Services;

use App\Models\Booking;
use App\Services\Contracts\BookingServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Schema;
use App\Models\CalendarBlock;

class BookingService implements BookingServiceInterface
{
    protected function bookingSelectColumns(): array
    {
        static $columns = null;
        if ($columns !== null) {
            return $columns;
        }

        if (!Schema::hasColumn('bookings', 'survey_proof_image')) {
            $columns = ['bookings.*'];
            return $columns;
        }

        $all = Schema::getColumnListing('bookings');

        $exclude = ['survey_proof_image'];

        $columns = array_map(
            fn (string $col) => 'bookings.' . $col,
            array_values(array_diff($all, $exclude))
        );

        return $columns;
    }

    /**
     * Base query with client scoping.
     *
     * ✅ Client sees their bookings by:
     * - client_email == user email OR
     * - created_by_user_id == user id (prevents losing access if they edit booking email)
     */
    protected function baseBookingQuery(): Builder
    {
        $query = Booking::query()->select($this->bookingSelectColumns());

        if (auth()->check() && auth()->user()->hasRole('user')) {
            $user = auth()->user();
            $email = (string) ($user->email ?? '');
            $userId = (int) ($user->id ?? 0);

            $hasCreatorCol = Schema::hasColumn('bookings', 'created_by_user_id');

            $query->where(function ($q) use ($email, $userId, $hasCreatorCol) {
                $q->where('client_email', $email);

                if ($hasCreatorCol && $userId > 0) {
                    $q->orWhere('created_by_user_id', $userId);
                }
            });
        }

        return $query;
    }

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $base = $this->baseBookingQuery()->with(['service', 'createdBy']);

        if (Schema::hasTable('booking_views')) {
            $base->with(['views']);
        }

        $query = $this->applyFilters($base, $filters);
        $query = $this->applySort($query, $filters);

        return $query->paginate($perPage)->withQueryString();
    }

    protected function applySort(Builder $query, array $filters): Builder
    {
        $sort = strtolower((string)($filters['sort'] ?? ''));

        if ($sort === '') {
            $user = auth()->user();
            $sort = ($user && method_exists($user, 'hasRole') && $user->hasRole('user'))
                ? 'newest'
                : 'upcoming';
        }

        $now = Carbon::now();

        $bucketSql = "
            CASE
                WHEN bookings.booking_date_from <= ? AND bookings.booking_date_to > ? THEN 0
                WHEN bookings.booking_date_from > ? THEN 1
                ELSE 2
            END
        ";

        $applyUnviewedFirst = function () use ($query) {
            $userId = auth()->id();
            if (!$userId) return;

            if (!Schema::hasTable('booking_views')) return;

            $query->leftJoin('booking_views as bv', function ($join) use ($userId) {
                $join->on('bv.booking_id', '=', 'bookings.id')
                    ->where('bv.user_id', '=', $userId);
            });

            $query->select($this->bookingSelectColumns());

            $trackingStartedAt = auth()->user()->bookings_view_tracking_started_at ?? null;
            if ($trackingStartedAt) {
                $query->orderByRaw(
                    "CASE WHEN bv.id IS NULL AND bookings.created_at >= ? THEN 0 ELSE 1 END ASC",
                    [$trackingStartedAt]
                );
            } else {
                $query->orderByRaw("CASE WHEN bv.id IS NULL THEN 0 ELSE 1 END ASC");
            }
        };

        switch ($sort) {
            case 'newest':
                return $query
                    ->orderByDesc('bookings.created_at')
                    ->orderByDesc('bookings.id');

            case 'oldest':
                return $query
                    ->orderBy('bookings.created_at')
                    ->orderBy('bookings.id');

            case 'farthest':
                return $query
                    ->orderByDesc('bookings.booking_date_from')
                    ->orderByDesc('bookings.created_at')
                    ->orderByDesc('bookings.id');

            case 'guests_desc':
                return $query
                    ->orderByDesc('bookings.number_of_guests')
                    ->orderBy('bookings.booking_date_from')
                    ->orderByDesc('bookings.created_at')
                    ->orderByDesc('bookings.id');

            case 'ending_soon':
                return $query
                    ->orderByRaw($bucketSql . " ASC", [$now, $now, $now])
                    ->orderByRaw(
                        "CASE WHEN bookings.booking_date_from <= ? AND bookings.booking_date_to > ? THEN bookings.booking_date_to END ASC",
                        [$now, $now]
                    )
                    ->orderByRaw(
                        "CASE WHEN bookings.booking_date_from > ? THEN bookings.booking_date_to END ASC",
                        [$now]
                    )
                    ->orderByRaw(
                        "CASE WHEN bookings.booking_date_to <= ? THEN bookings.booking_date_to END DESC",
                        [$now]
                    )
                    ->orderByDesc('bookings.created_at')
                    ->orderByDesc('bookings.id');

            case 'priority':
                $applyUnviewedFirst();

                return $query
                    ->orderByRaw("
                        CASE bookings.booking_status
                            WHEN 'pending' THEN 0
                            WHEN 'active' THEN 1
                            WHEN 'confirmed' THEN 2
                            WHEN 'completed' THEN 3
                            WHEN 'cancelled' THEN 4
                            WHEN 'declined' THEN 5
                            ELSE 99
                        END ASC
                    ")
                    ->orderByRaw($bucketSql . " ASC", [$now, $now, $now])
                    ->orderByRaw(
                        "CASE WHEN bookings.booking_date_from <= ? AND bookings.booking_date_to > ? THEN bookings.booking_date_to END ASC",
                        [$now, $now]
                    )
                    ->orderByRaw(
                        "CASE WHEN bookings.booking_date_from > ? THEN bookings.booking_date_from END ASC",
                        [$now]
                    )
                    ->orderByRaw(
                        "CASE WHEN bookings.booking_date_to <= ? THEN bookings.booking_date_from END DESC",
                        [$now]
                    )
                    ->orderByDesc('bookings.created_at')
                    ->orderByDesc('bookings.id');

            case 'unviewed_first':
                $applyUnviewedFirst();

                return $query
                    ->orderByRaw($bucketSql . " ASC", [$now, $now, $now])
                    ->orderByRaw(
                        "CASE WHEN bookings.booking_date_from <= ? AND bookings.booking_date_to > ? THEN bookings.booking_date_to END ASC",
                        [$now, $now]
                    )
                    ->orderByRaw(
                        "CASE WHEN bookings.booking_date_from > ? THEN bookings.booking_date_from END ASC",
                        [$now]
                    )
                    ->orderByRaw(
                        "CASE WHEN bookings.booking_date_to <= ? THEN bookings.booking_date_from END DESC",
                        [$now]
                    )
                    ->orderByDesc('bookings.created_at')
                    ->orderByDesc('bookings.id');

            case 'upcoming':
            default:
                return $query
                    ->orderByRaw($bucketSql . " ASC", [$now, $now, $now])
                    ->orderByRaw(
                        "CASE WHEN bookings.booking_date_from <= ? AND bookings.booking_date_to > ? THEN bookings.booking_date_to END ASC",
                        [$now, $now]
                    )
                    ->orderByRaw(
                        "CASE WHEN bookings.booking_date_from > ? THEN bookings.booking_date_from END ASC",
                        [$now]
                    )
                    ->orderByRaw(
                        "CASE WHEN bookings.booking_date_to <= ? THEN bookings.booking_date_from END DESC",
                        [$now]
                    )
                    ->orderByDesc('bookings.created_at')
                    ->orderByDesc('bookings.id');
        }
    }

    public function create(array $data): Booking
    {
        return DB::transaction(function () use ($data) {
            $items          = $data['items'] ?? null;
            $extraSchedules = (array)($data['extra_schedules'] ?? []);
            unset($data['items'], $data['extra_schedules']);

            unset($data['created_by_user_id']);

            if (isset($data['booking_date_from'], $data['booking_date_to'])) {
                [$from, $to] = $this->normalizeRangeToPreferred(
                    (string) $data['booking_date_from'],
                    (string) $data['booking_date_to']
                );
                $data['booking_date_from'] = $from;
                $data['booking_date_to']   = $to;

                $this->assertTimeSlotAvailable($from, $to, null);
            }

            $user = auth()->user();

            if ($user) {
                $data['created_by_user_id'] = $user->id;
            }

            if ($user && $user->hasRole('user')) {
                $data['client_email']   = $user->email;
                $data['booking_status'] = 'pending';
                $data['payment_status'] = 'unpaid';
            } else {
                if (!isset($data['payment_status'])) {
                    $data['payment_status'] = 'unpaid';
                }
            }

            $booking = Booking::create($data);

            if (is_array($items)) {
                $this->syncItems($booking, $items);
            }

            $this->recalculatePaymentStatus($booking);

            $this->createExtraSchedules($booking, $extraSchedules);

            return $booking->refresh()->loadMissing(['createdBy']);
        });
    }

    public function update(Booking $booking, array $data): Booking
    {
        return DB::transaction(function () use ($booking, $data) {
            $items = $data['items'] ?? null;
            unset($data['items'], $data['extra_schedules']);

            unset($data['created_by_user_id']);

            $user = auth()->user();

            if ($user && $user->hasRole('user')) {
                // ✅ CLIENT CAN EDIT EVERYTHING EXCEPT schedule/status/items/payment_status
                $allowed = [
                    'client_name',
                    'company_name',
                    'client_contact_number',
                    'client_email',
                    'survey_email',
                    'survey_proof_image_path',
                    'survey_proof_image',
                    'survey_proof_image_mime',
                    'survey_proof_image_name',
                    'client_address',
                    'head_of_organization',

                    // ✅ now allowed for client (your request)
                    'type_of_event',
                    'number_of_guests',
                ];

                $data = array_intersect_key($data, array_flip($allowed));
                $items = null; // clients cannot edit items
            }

            if (isset($data['booking_date_from'], $data['booking_date_to'])) {
                [$from, $to] = $this->normalizeRangeToPreferred(
                    (string) $data['booking_date_from'],
                    (string) $data['booking_date_to']
                );

                $this->assertTimeSlotAvailable($from, $to, $booking->id);

                $data['booking_date_from'] = $from;
                $data['booking_date_to']   = $to;
            }

            $booking->update($data);

            if (is_array($items)) {
                $this->syncItems($booking, $items);
            }

            $this->recalculatePaymentStatus($booking);

            return $booking->refresh();
        });
    }

    public function delete(Booking $booking): void
    {
        $booking->delete();
    }

    public function getStatusCounts(array $filters = []): array
    {
        $filtersNoStatus = $filters;
        unset($filtersNoStatus['booking_status']);

        $base = $this->applyFilters($this->baseBookingQuery(), $filtersNoStatus);

        $all = (clone $base)->count();

        $statuses = ['pending', 'active', 'confirmed', 'cancelled', 'declined', 'completed'];
        $result = [
            'all'       => $all,
            'pending'   => 0,
            'active'    => 0,
            'confirmed' => 0,
            'cancelled' => 0,
            'declined'  => 0,
            'completed' => 0,
        ];

        foreach ($statuses as $status) {
            $result[$status] = (clone $base)->where('booking_status', $status)->count();
        }

        return $result;
    }

    protected function applyFilters($query, array $filters)
    {
        return $query
            ->when(!empty($filters['booking_status']), function ($q) use ($filters) {
                $q->where('booking_status', $filters['booking_status']);
            })
            ->when(!empty($filters['payment_status']), function ($q) use ($filters) {
                $q->where('payment_status', $filters['payment_status']);
            })
            ->when(!empty($filters['service_id']), function ($q) use ($filters) {
                $q->where('service_id', $filters['service_id']);
            })
            ->when(!empty($filters['q']), function ($q) use ($filters) {
                $term = '%' . $filters['q'] . '%';
                $q->where(function ($q2) use ($term) {
                    $q2->where('client_name', 'like', $term)
                        ->orWhere('company_name', 'like', $term)
                        ->orWhere('client_email', 'like', $term);
                });
            })
            ->when(!empty($filters['date_from']), function ($q) use ($filters) {
                $q->whereDate('booking_date_from', '>=', $filters['date_from']);
            })
            ->when(!empty($filters['date_to']), function ($q) use ($filters) {
                $q->whereDate('booking_date_to', '<=', $filters['date_to']);
            });
    }

    protected function syncItems(Booking $booking, array $items): void
    {
        $booking->bookingServices()->delete();

        $lines = [];
        foreach ($items as $i) {
            if (!isset($i['service_id'])) continue;

            $lines[] = [
                'service_id' => (int) $i['service_id'],
                'quantity'   => max(1, (int) ($i['quantity'] ?? 1)),
            ];
        }

        if (!empty($lines)) {
            $booking->bookingServices()->createMany($lines);
        }
    }

    public function recalculatePaymentStatus(Booking $booking): void
    {
        $booking->loadMissing(['bookingServices.service', 'payments']);

        $itemsTotal = $booking->bookingServices->reduce(function ($carry, $item) {
            $price = $item->service->price ?? 0;
            return $carry + ($price * (int) $item->quantity);
        }, 0);

        $completedPaid = $booking->payments
            ->where('status', 'confirmed')
            ->reduce(fn ($sum, $p) => $sum + (float) $p->amount, 0.0);

        $newStatus = 'unpaid';
        if ($itemsTotal <= 0) {
            $newStatus = $completedPaid > 0 ? 'paid' : 'unpaid';
        } else {
            if ($completedPaid <= 0) $newStatus = 'unpaid';
            elseif ($completedPaid + 0.00001 >= $itemsTotal) $newStatus = 'paid';
            else $newStatus = 'partial';
        }

        if ($booking->payment_status !== $newStatus) {
            $booking->update(['payment_status' => $newStatus]);
        }
    }

    protected function createExtraSchedules(Booking $baseBooking, array $extraSchedules): void
    {
        if (empty($extraSchedules)) return;

        $baseBooking->loadMissing('bookingServices');

        foreach ($extraSchedules as $slot) {
            $fromRaw = $slot['from'] ?? null;
            $toRaw   = $slot['to'] ?? null;

            if (empty($fromRaw) || empty($toRaw)) continue;

            try {
                [$from, $to] = $this->normalizeRangeToPreferred((string)$fromRaw, (string)$toRaw);
            } catch (\Throwable $e) {
                continue;
            }

            if ($to->lessThanOrEqualTo($from)) continue;

            $this->assertTimeSlotAvailable($from, $to, null);

            $clone = $baseBooking->replicate();
            $clone->booking_date_from = $from;
            $clone->booking_date_to   = $to;
            $clone->payment_status    = 'unpaid';
            $clone->save();

            foreach ($baseBooking->bookingServices as $item) {
                $clone->bookingServices()->create([
                    'service_id' => $item->service_id,
                    'quantity'   => $item->quantity,
                ]);
            }

            $this->recalculatePaymentStatus($clone);
        }
    }

    private function overlaps(Carbon $aStart, Carbon $aEnd, Carbon $bStart, Carbon $bEnd): bool
    {
        return $aStart->lt($bEnd) && $aEnd->gt($bStart);
    }

    private function calendarBlockIntervalForDate(string $block, Carbon $day): array
    {
        $block = strtoupper($block);

        if ($block === 'AM') {
            return [$day->copy()->setTime(6, 0), $day->copy()->setTime(12, 0)];
        }

        if ($block === 'PM') {
            return [$day->copy()->setTime(12, 0), $day->copy()->setTime(18, 0)];
        }

        if ($block === 'EVE') {
            return [$day->copy()->setTime(18, 0), $day->copy()->addDay()->startOfDay()];
        }

        return [$day->copy()->setTime(6, 0), $day->copy()->addDay()->startOfDay()];
    }

    private function buildAvailabilityBlocks(Carbon $day, array $mergedIntervals): array
    {
        $amStart = $day->copy()->setTime(6, 0);
        $amEnd = $day->copy()->setTime(12, 0);

        $pmStart = $day->copy()->setTime(12, 0);
        $pmEnd = $day->copy()->setTime(18, 0);

        $eveStart = $day->copy()->setTime(18, 0);
        $eveEnd = $day->copy()->addDay()->startOfDay();

        $amAvailable = true;
        $pmAvailable = true;
        $eveAvailable = true;

        foreach ($mergedIntervals as $it) {
            $s = $it['from'];
            $e = $it['to'];

            if ($amAvailable && $this->overlaps($s, $e, $amStart, $amEnd)) {
                $amAvailable = false;
            }
            if ($pmAvailable && $this->overlaps($s, $e, $pmStart, $pmEnd)) {
                $pmAvailable = false;
            }
            if ($eveAvailable && $this->overlaps($s, $e, $eveStart, $eveEnd)) {
                $eveAvailable = false;
            }
        }

        return [
            'AM' => [
                'key' => 'AM',
                'label' => 'Morning',
                'from' => '06:00',
                'to' => '12:00',
                'is_available' => $amAvailable,
            ],
            'PM' => [
                'key' => 'PM',
                'label' => 'Afternoon',
                'from' => '12:00',
                'to' => '18:00',
                'is_available' => $pmAvailable,
            ],
            'EVE' => [
                'key' => 'EVE',
                'label' => 'Evening',
                'from' => '18:00',
                'to' => '23:59',
                'is_available' => $eveAvailable,
            ],
        ];
    }

    public function getDailyAvailability(string $date, $excludeBookingId = null): array
    {
        $day = Carbon::createFromFormat('Y-m-d', $date)->startOfDay();

        $dayStart = $day->copy()->setTime(6, 0);
        $dayEnd = $day->copy()->addDay()->startOfDay();

        $intervals = [];

        $bookingQuery = Booking::query()
            ->whereIn('booking_status', ['active', 'confirmed'])
            ->where('booking_date_from', '<', $dayEnd)
            ->where('booking_date_to', '>', $dayStart);

        if (!empty($excludeBookingId)) {
            $bookingQuery->where('id', '!=', $excludeBookingId);
        }

        $bookings = $bookingQuery->get(['id', 'booking_date_from', 'booking_date_to']);

        foreach ($bookings as $b) {
            $s = Carbon::parse($b->booking_date_from);
            $e = Carbon::parse($b->booking_date_to);

            if ($e->lte($dayStart) || $s->gte($dayEnd)) {
                continue;
            }

            $from = $s->gt($dayStart) ? $s : $dayStart->copy();
            $to = $e->lt($dayEnd) ? $e : $dayEnd->copy();

            if ($to->gt($from)) {
                $intervals[] = ['from' => $from, 'to' => $to];
            }
        }

        if (Schema::hasTable('calendar_blocks')) {
            $blocks = CalendarBlock::query()
                ->whereDate('date_from', '<=', $day->format('Y-m-d'))
                ->whereDate('date_to', '>=', $day->format('Y-m-d'))
                ->get(['id', 'block']);

            foreach ($blocks as $blk) {
                [$bStart, $bEnd] = $this->calendarBlockIntervalForDate((string) $blk->block, $day);

                $from = $bStart->gt($dayStart) ? $bStart : $dayStart->copy();
                $to = $bEnd->lt($dayEnd) ? $bEnd : $dayEnd->copy();

                if ($to->gt($from)) {
                    $intervals[] = ['from' => $from, 'to' => $to];
                }
            }
        }

        if (empty($intervals)) {
            $blocks = $this->buildAvailabilityBlocks($day, []);
            return [
                'date' => $day->format('Y-m-d'),
                'busy' => [],
                'free' => [['from' => '06:00', 'to' => '23:59']],
                'blocks' => $blocks,
                'is_fully_booked' => false,
            ];
        }

        usort($intervals, fn ($a, $b) => $a['from']->getTimestamp() <=> $b['from']->getTimestamp());

        $merged = [];
        foreach ($intervals as $it) {
            if (empty($merged)) {
                $merged[] = $it;
                continue;
            }

            $lastIdx = count($merged) - 1;
            $last = $merged[$lastIdx];

            if ($it['from']->lte($last['to'])) {
                if ($it['to']->gt($last['to'])) {
                    $merged[$lastIdx]['to'] = $it['to'];
                }
            } else {
                $merged[] = $it;
            }
        }

        $busy = [];
        foreach ($merged as $it) {
            $from = $it['from'];
            $to = $it['to'];

            $busy[] = [
                'from' => $from->format('H:i'),
                'to' => $to->equalTo($dayEnd) ? '23:59' : $to->format('H:i'),
            ];
        }

        $free = [];
        $cursor = $dayStart->copy();

        foreach ($merged as $it) {
            if ($it['from']->gt($cursor)) {
                $free[] = [
                    'from' => $cursor->format('H:i'),
                    'to' => $it['from']->format('H:i'),
                ];
            }

            if ($it['to']->gt($cursor)) {
                $cursor = $it['to']->copy();
            }
        }

        if ($cursor->lt($dayEnd)) {
            $free[] = [
                'from' => $cursor->format('H:i'),
                'to' => '23:59',
            ];
        }

        $blocks = $this->buildAvailabilityBlocks($day, $merged);
        $isFullyBooked = !$blocks['AM']['is_available'] && !$blocks['PM']['is_available'] && !$blocks['EVE']['is_available'];

        return [
            'date' => $day->format('Y-m-d'),
            'busy' => $busy,
            'free' => $free,
            'blocks' => $blocks,
            'is_fully_booked' => $isFullyBooked,
        ];
    }

    public function getUnavailableDates($excludeBookingId = null): array
    {
        $start = Carbon::today()->startOfDay();
        $end = $start->copy()->addDays(365)->startOfDay();

        $availability = [];
        for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
            $availability[$d->format('Y-m-d')] = ['AM' => true, 'PM' => true, 'EVE' => true];
        }

        $bookingQuery = Booking::query()
            ->whereIn('booking_status', ['active', 'confirmed'])
            ->where('booking_date_from', '<', $end->copy()->addDay()->startOfDay())
            ->where('booking_date_to', '>', $start->copy()->setTime(6, 0));

        if (!empty($excludeBookingId)) {
            $bookingQuery->where('id', '!=', $excludeBookingId);
        }

        $bookings = $bookingQuery->get(['booking_date_from', 'booking_date_to']);

        foreach ($bookings as $b) {
            $bs = Carbon::parse($b->booking_date_from);
            $be = Carbon::parse($b->booking_date_to);

            $fromDay = $bs->copy()->startOfDay();
            $toDay = $be->copy()->startOfDay();

            if ($fromDay->lt($start)) $fromDay = $start->copy();
            if ($toDay->gt($end)) $toDay = $end->copy();

            for ($day = $fromDay->copy(); $day->lte($toDay); $day->addDay()) {
                $key = $day->format('Y-m-d');
                if (!isset($availability[$key])) continue;

                $amStart = $day->copy()->setTime(6, 0);
                $amEnd = $day->copy()->setTime(12, 0);

                $pmStart = $day->copy()->setTime(12, 0);
                $pmEnd = $day->copy()->setTime(18, 0);

                $eveStart = $day->copy()->setTime(18, 0);
                $eveEnd = $day->copy()->addDay()->startOfDay();

                if ($availability[$key]['AM'] && $this->overlaps($bs, $be, $amStart, $amEnd)) $availability[$key]['AM'] = false;
                if ($availability[$key]['PM'] && $this->overlaps($bs, $be, $pmStart, $pmEnd)) $availability[$key]['PM'] = false;
                if ($availability[$key]['EVE'] && $this->overlaps($bs, $be, $eveStart, $eveEnd)) $availability[$key]['EVE'] = false;
            }
        }

        if (Schema::hasTable('calendar_blocks')) {
            $blocks = CalendarBlock::query()
                ->whereDate('date_to', '>=', $start->format('Y-m-d'))
                ->whereDate('date_from', '<=', $end->format('Y-m-d'))
                ->get(['date_from', 'date_to', 'block']);

            foreach ($blocks as $blk) {
                $from = Carbon::parse($blk->date_from)->startOfDay();
                $to = Carbon::parse($blk->date_to)->startOfDay();

                if ($from->lt($start)) $from = $start->copy();
                if ($to->gt($end)) $to = $end->copy();

                for ($day = $from->copy(); $day->lte($to); $day->addDay()) {
                    $key = $day->format('Y-m-d');
                    if (!isset($availability[$key])) continue;

                    $block = strtoupper((string) $blk->block);

                    if ($block === 'DAY') {
                        $availability[$key]['AM'] = false;
                        $availability[$key]['PM'] = false;
                        $availability[$key]['EVE'] = false;
                    } elseif (in_array($block, ['AM', 'PM', 'EVE'], true)) {
                        $availability[$key][$block] = false;
                    }
                }
            }
        }

        $unavailable = [];
        foreach ($availability as $dateKey => $v) {
            if (!$v['AM'] && !$v['PM'] && !$v['EVE']) {
                $unavailable[] = $dateKey;
            }
        }

        return $unavailable;
    }

    protected function assertTimeSlotAvailable(Carbon $from, Carbon $to, ?int $ignoreBookingId = null): void
    {
        if ($to->lte($from)) {
            throw ValidationException::withMessages([
                'booking_date_to' => 'End date & time must be after start date & time.',
            ]);
        }

        $toCalc = $this->normalizeEndForCalc($to);

        $query = Booking::query()
            ->whereIn('booking_status', ['active', 'confirmed'])
            ->where(function ($q) use ($from, $toCalc) {
                $q->where('booking_date_from', '<', $toCalc)
                    ->where('booking_date_to', '>', $from);
            });

        if ($ignoreBookingId) {
            $query->where('id', '!=', $ignoreBookingId);
        }

        if ($query->exists()) {
            throw ValidationException::withMessages([
                'booking_date_from' => 'The selected schedule overlaps an existing CONFIRMED/ACTIVE booking. Please choose another block/date.',
            ]);
        }
    }

    private function normalizeRangeToPreferred(string $fromRaw, string $toRaw): array
    {
        $from = Carbon::parse($fromRaw);
        $to   = Carbon::parse($toRaw);

        $fromTime = $from->format('H:i');
        $toTime   = $to->format('H:i');

        $isNextDayMidnight =
            $toTime === '23:59'
            && $to->copy()->startOfDay()->equalTo($from->copy()->startOfDay()->addDay());

        $isBlockStart = in_array($fromTime, ['06:00', '12:00', '18:00'], true);

        if ($isNextDayMidnight && $isBlockStart) {
            $to = $from->copy()->setTime(23, 59, 0);
        }

        return [$from, $to];
    }

    private function normalizeEndForCalc(Carbon $to): Carbon
    {
        if ($to->format('H:i') === '23:59') {
            return $to->copy()->addMinute();
        }
        return $to;
    }

    private function minutesToTime(int $minutes, bool $isEnd): string
    {
        if ($isEnd && $minutes >= 1440) return '23:59';
        if ($minutes >= 1440) $minutes = 1439;

        $h = intdiv($minutes, 60);
        $m = $minutes % 60;
        return sprintf('%02d:%02d', $h, $m);
    }

    private function mergeIntervals(array $intervals): array
    {
        if (count($intervals) === 0) return [];

        usort($intervals, fn ($a, $b) => $a['from'] <=> $b['from']);

        $merged = [];
        foreach ($intervals as $it) {
            if (empty($merged)) {
                $merged[] = $it;
                continue;
            }

            $lastIdx = count($merged) - 1;
            $last = $merged[$lastIdx];

            if ($it['from'] <= $last['to']) {
                $merged[$lastIdx]['to'] = max($last['to'], $it['to']);
            } else {
                $merged[] = $it;
            }
        }

        return $merged;
    }

    private function computeFreeIntervals(array $busy, int $windowStart, int $windowEnd): array
    {
        $free = [];
        $cursor = $windowStart;

        foreach ($busy as $b) {
            if ($b['from'] > $cursor) {
                $free[] = ['from' => $cursor, 'to' => $b['from']];
            }
            $cursor = max($cursor, $b['to']);
        }

        if ($cursor < $windowEnd) {
            $free[] = ['from' => $cursor, 'to' => $windowEnd];
        }

        return $free;
    }

    private function intervalOverlaps(array $busy, int $from, int $to): bool
    {
        foreach ($busy as $b) {
            if ($b['from'] < $to && $b['to'] > $from) return true;
        }
        return false;
    }
}
