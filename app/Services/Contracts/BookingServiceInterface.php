<?php

namespace App\Services\Contracts;

use App\Models\Booking;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface BookingServiceInterface
{
    /**
     * @param array<string, mixed> $filters
     */
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /** @param array<string, mixed> $data */
    public function create(array $data): Booking;

    /** @param array<string, mixed> $data */
    public function update(Booking $booking, array $data): Booking;

    public function delete(Booking $booking): void;

    /**
     * Return counts of bookings grouped by booking_status, respecting filters other than booking_status.
     *
     * @param array<string, mixed> $filters
     * @return array{all:int,pending:int,active:int,confirmed:int,cancelled:int,declined:int,completed:int}
     */
    public function getStatusCounts(array $filters = []): array;

    /** Automatically recompute and persist the payment_status based on services total and completed payments. */
    public function recalculatePaymentStatus(Booking $booking): void;

    /** Sync all non-cancelled bookings to their automatic lifecycle status. Returns the number of changed rows. */
    public function syncLifecycleStatuses(): int;

    /** Sync one booking to its automatic lifecycle status. Returns true when the status changed. */
    public function syncLifecycleStatus(Booking $booking): bool;

    /**
     * Daily availability for one date in the window 06:00–23:59.
     * Only confirmed/active bookings are treated as busy.
     *
     * @return array{
     *   date:string,
     *   window?:array{from:string,to:string},
     *   busy:array<int,array{from:string,to:string,id?:int}>,
     *   free:array<int,array{from:string,to:string}>,
     *   blocks:array{
     *     AM:array{key:string,label:string,from:string,to:string,is_available:bool},
     *     PM:array{key:string,label:string,from:string,to:string,is_available:bool},
     *     EVE:array{key:string,label:string,from:string,to:string,is_available:bool}
     *   },
     *   is_fully_booked:bool
     * }
     */
    public function getDailyAvailability(string $date, ?int $excludeBookingId = null): array;

    /**
     * Dates that are FULLY booked (AM+PM+EVE all unavailable), based on confirmed/active only.
     *
     * @return array<int, string> // YYYY-MM-DD
     */
    public function getUnavailableDates(?int $excludeBookingId = null): array;
}
