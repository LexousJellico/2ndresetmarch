<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')
            ->scopes(['openid', 'profile', 'email'])
            ->redirect();
    }

    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (Throwable $e) {
            return redirect()
                ->route('login')
                ->with('status', 'Google sign-in could not be completed. Please try again.');
        }

        $email = Str::lower(trim((string) $googleUser->getEmail()));

        if ($email === '') {
            return redirect()
                ->route('login')
                ->with('status', 'Google sign-in requires an email address.');
        }

        $user = DB::transaction(function () use ($googleUser, $email) {
            $existingByGoogle = User::query()
                ->where('google_id', (string) $googleUser->getId())
                ->first();

            if ($existingByGoogle) {
                $existingByGoogle->forceFill([
                    'email' => $email,
                    'google_avatar' => $googleUser->getAvatar(),
                    'last_login_at' => now(),
                    'email_verified_at' => $existingByGoogle->email_verified_at ?? now(),
                ])->save();

                return $existingByGoogle;
            }

            $existingByEmail = User::query()
                ->where('email', $email)
                ->first();

            if ($existingByEmail) {
                $existingByEmail->forceFill([
                    'google_id' => (string) $googleUser->getId(),
                    'google_avatar' => $googleUser->getAvatar(),
                    'last_login_at' => now(),
                    'email_verified_at' => $existingByEmail->email_verified_at ?? now(),
                ])->save();

                return $existingByEmail;
            }

            $fullName = trim((string) $googleUser->getName());
            $nameParts = preg_split('/\s+/u', $fullName) ?: [];

            $firstName = $nameParts[0] ?? 'Google';
            $lastName = count($nameParts) > 1 ? (string) end($nameParts) : 'User';

            $user = User::create([
                'name' => trim($fullName) !== '' ? $fullName : trim($firstName . ' ' . $lastName),
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $email,
                'password' => Hash::make(Str::random(40)),
                'google_id' => (string) $googleUser->getId(),
                'google_avatar' => $googleUser->getAvatar(),
                'country' => 'Philippines',
                'last_login_at' => now(),
                'email_verified_at' => now(),
            ]);

            $user->assignRole('user');

            return $user;
        });

        Auth::login($user, true);
        request()->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
