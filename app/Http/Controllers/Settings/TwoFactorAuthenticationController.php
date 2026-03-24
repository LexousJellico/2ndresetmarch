<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class TwoFactorAuthenticationController extends Controller
{
    public function show(Request $request): Response
    {
        return Inertia::render('settings/two-factor', [
            'twoFactorEnabled' => method_exists($request->user(), 'hasEnabledTwoFactorAuthentication')
                ? $request->user()->hasEnabledTwoFactorAuthentication()
                : false,
            'requiresConfirmation' => Features::optionEnabled(
                Features::twoFactorAuthentication(),
                'confirm'
            ),
        ]);
    }
}
