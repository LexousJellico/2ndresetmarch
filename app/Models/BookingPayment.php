<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Booking;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Auth;

class BookingPayment extends Model
{
    use HasFactory;

    protected $table = 'booking_payments';

    protected $fillable = [
        'booking_id',
        'status',
        'payment_method',
        'amount',
        'transaction_reference',
        'payment_gateway',
        'remarks',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
    public array $notificationChanges = [];

protected static function booted(): void
{
    static::created(function (BookingPayment $payment) {
        if (app()->runningInConsole()) return;

        $booking = method_exists($payment, 'booking')
            ? $payment->booking()->first()
            : Booking::find($payment->booking_id);

        if (! $booking) return;

        try {
            app(NotificationService::class)->paymentCreated($payment, $booking, Auth::user());
        } catch (\Throwable $e) {
            report($e);
        }
    });

    static::updating(function (BookingPayment $payment) {
        $changes = [];

        foreach ($payment->getDirty() as $field => $newValue) {
            if ($field === 'updated_at') continue;
            $changes[$field] = [$payment->getOriginal($field), $newValue];
        }

        $payment->notificationChanges = $changes;
    });

    static::updated(function (BookingPayment $payment) {
        if (app()->runningInConsole()) return;

        $changes = $payment->notificationChanges ?? [];
        if (empty($changes)) return;

        $booking = method_exists($payment, 'booking')
            ? $payment->booking()->first()
            : Booking::find($payment->booking_id);

        if (! $booking) return;

        try {
            app(NotificationService::class)->paymentUpdated($payment, $booking, Auth::user(), $changes);
        } catch (\Throwable $e) {
            report($e);
        }
    });
}
}
