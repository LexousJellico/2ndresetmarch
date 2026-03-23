<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'techniqalgroup@gmail.com'],
            [
                'name' => 'TechniqalGroup',
                'password' => Hash::make('asdasdasd'),
                'email_verified_at' => now(),
            ]
        );

        User::factory()->count(10)->create();
    }
}
