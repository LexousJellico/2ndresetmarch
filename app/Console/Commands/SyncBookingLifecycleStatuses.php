<?php

namespace App\Console\Commands;

use App\Services\Contracts\BookingServiceInterface;
use Illuminate\Console\Command;

class SyncBookingLifecycleStatuses extends Command
{
    protected $signature = 'bookings:sync-lifecycle';

    protected $description = 'Sync booking_status automatically from payment_status and booking dates';

    public function handle(BookingServiceInterface $bookings): int
    {
        $changed = $bookings->syncLifecycleStatuses();

        $this->info(
            'Booking lifecycle sync complete. Updated ' .
            $changed .
            ' booking' .
            ($changed === 1 ? '' : 's') .
            '.'
        );

        return self::SUCCESS;
    }
}
