<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is enforced by:
        // - route middleware (auth / bookings.view)
        // - BookingController::ensureBookingAccess() (clients can only access their own booking)
        return (bool) $this->user();
    }

    public function rules(): array
    {
        $user = $this->user();
        $canManage = $user ? $user->can('payments.manage') : false;

        $rules = [
            // NOTE:
            // - Clients can submit payments, but status is always forced to "pending" server-side.
            // - Staff/admin with payments.manage can set the status on create.
            'payment_method' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'transaction_reference' => [
                'nullable',
                'string',
                'max:255',
                'unique:booking_payments,transaction_reference',
            ],
            'payment_gateway' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:255'],
        ];

        if ($canManage) {
            $rules['status'] = ['required', 'string', 'in:pending,confirmed,failed,declined,refunded'];
        }

        return $rules;
    }
}
