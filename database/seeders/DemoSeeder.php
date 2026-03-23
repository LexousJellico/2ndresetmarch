<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\ServiceType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ServiceType::insert([
            ['name' => 'Area'],
            ['name' => 'Equipment'],
            ['name' => 'Furniture'],
            ['name' => 'Personel'],
            ['name' => 'Ingress and Egress'],
        ]);

        Service::create([
            'service_type_id' => 1,
            'name' => 'Grounds/Parking Area',
            'description' => 'Spacious grounds and parking area suitable for outdoor events.',
            'uom' => 'per hour',
            'price' => 150.00,
            'quantity' => 1,
        ]);
        Service::create([
            'service_type_id' => 1,
            'name' => 'Lobby/Foyer',
            'description' => 'Spacious lobby/foyer area suitable for receptions and gatherings.',
            'uom' => 'per hour',
            'price' => 150.00,
            'quantity' => 1,
        ]);
        Service::create([
            'service_type_id' => 1,
            'name' => 'Main Hall',
            'description' => 'Elegant main hall perfect for large events and ceremonies.',
            'uom' => 'per hour',
            'price' => 10000.00,
            'quantity' => 1,
        ]);
        Service::create([
            'service_type_id' => 1,
            'name' => 'VIP Lounge - 1',
            'description' => 'Exclusive VIP lounge area for high-profile guests.',
            'uom' => 'per hour',
            'price' => 1000.00,
            'quantity' => 1,
        ]);
        Service::create([
            'service_type_id' => 1,
            'name' => 'VIP Lounge - 2',
            'description' => 'Exclusive VIP lounge area for high-profile guests.',
            'uom' => 'per hour',
            'price' => 1000.00,
            'quantity' => 1,
        ]);
        Service::create([
            'service_type_id' => 1,
            'name' => 'Gallery 2600',
            'description' => 'Spacious gallery area suitable for exhibitions and events.',
            'uom' => 'per hour',
            'price' => 150.00,
            'quantity' => 1,
        ]);
        Service::create([
            'service_type_id' => 1,
            'name' => 'Dressing Room - 1',
            'description' => 'Spacious dressing room with mirrors and lighting.',
            'uom' => 'per day',
            'price' => 75.00,
            'quantity' => 1,
        ]);
        Service::create([
            'service_type_id' => 1,
            'name' => 'Dressing Room - 2',
            'description' => 'Spacious dressing room with mirrors and lighting.',
            'uom' => 'per day',
            'price' => 75.00,
            'quantity' => 1,
        ]);
        Service::create([
            'service_type_id' => 1,
            'name' => 'Basement',
            'description' => 'Versatile basement area suitable for various event needs.',
            'uom' => 'per table',
            'price' => 20.00,
            'quantity' => 1,
        ]);

        Service::create([
            'service_type_id' => 2,
            'name' => 'Chairs',
            'description' => 'Comfortable chairs for your event attendees.',
            'uom' => 'each',
            'price' => 25.00,
            'quantity' => 100,
        ]);
        Service::create([
            'service_type_id' => 2,
            'name' => 'Tables',
            'description' => 'Sturdy tables for your event setup.',
            'uom' => 'each',
            'price' => 50.00,
            'quantity' => 50,
        ]);
        Service::create([
            'service_type_id' => 2,
            'name' => 'Cocktail Tables',
            'description' => 'Stylish cocktail tables for your event.',
            'uom' => 'each',
            'price' => 75.00,
            'quantity' => 20,
        ]);
        Service::create([
            'service_type_id' => 2,
            'name' => 'Rostrum',
            'description' => 'Stylish rostrum for your event.',
            'uom' => 'each',
            'price' => 75.00,
            'quantity' => 20,
        ]);
        Service::create([
            'service_type_id' => 2,
            'name' => 'Stanchions',
            'description' => 'Stylish stanchions for your event.',
            'uom' => 'each',
            'price' => 75.00,
            'quantity' => 20,
        ]);
        Service::create([
            'service_type_id' => 2,
            'name' => 'Panel Boards',
            'description' => 'Stylish panel boards for your event.',
            'uom' => 'each',
            'price' => 75.00,
            'quantity' => 20,
        ]);

        Service::create([
            'service_type_id' => 3,
            'name' => 'Sound System (house)',
            'description' => 'High-quality sound system for your event.',
            'uom' => 'each',
            'price' => 5000.00,
            'quantity' => 2,
        ]);

        Service::create([
            'service_type_id' => 3,
            'name' => 'LED Wall',
            'description' => 'High-quality LED wall for your event.',
            'uom' => 'each',
            'price' => 40000.00,
            'quantity' => 2,
        ]);

        Service::create([
            'service_type_id' => 3,
            'name' => 'Mobile Sound System',
            'description' => 'High-quality mobile sound system for your event.',
            'uom' => 'each',
            'price' => 5000.00,
            'quantity' => 2,
        ]);

        Service::create([
            'service_type_id' => 3,
            'name' => 'Generator Set (8hr. collective default)',
            'description' => 'High-quality generator set for your event.',
            'uom' => 'each',
            'price' => 5000.00,
            'quantity' => 2,
        ]);

        Service::create([
            'service_type_id' => 3,
            'name' => 'Follow Spot Light',
            'description' => 'High-quality follow spot light for your event.',
            'uom' => 'each',
            'price' => 2500.00,
            'quantity' => 2,
        ]);

        Service::create([
            'service_type_id' => 3,
            'name' => 'Microphones (standard/wireless)',
            'description' => 'High-quality microphones (standard/wireless) for your event.',
            'uom' => 'each',
            'price' => 200.00,
            'quantity' => 10,
        ]);

        Service::create([
            'service_type_id' => 3,
            'name' => 'Microphones (condenser/boom/shotgun)',
            'description' => 'High-quality microphones (condenser/boom/shotgun) for your event.',
            'uom' => 'each',
            'price' => 500.00,
            'quantity' => 10,
        ]);

        Service::create([
            'service_type_id' => 3,
            'name' => 'LED Projector with Projector wall',
            'description' => 'High-quality LED projector with projector wall for your event.',
            'uom' => 'each',
            'price' => 1500.00,
            'quantity' => 5,
        ]);

        Service::create([
            'service_type_id' => 3,
            'name' => 'LED Television',
            'description' => 'High-quality LED television for your event.',
            'uom' => 'each',
            'price' => 1000.00,
            'quantity' => 5,
        ]);
        
        Service::create([
            'service_type_id' => 4,
            'name' => 'Maintenance personnel (beyond 8:00 AM to 5:00 PM)',
            'description' => 'Professional maintenance personnel to assist during your event.',
            'uom' => 'hour',
            'price' => 500.00,
            'quantity' => 5,
        ]);

        Service::create([
            'service_type_id' => 5,
            'name' => 'Ingress and Set-up',
            'description' => 'Assistance with ingress and setup for your event.',
            'uom' => 'per hour',
            'price' => 100.00,
            'quantity' => 10,
        ]);

        Service::create([
            'service_type_id' => 5,
            'name' => 'Set-Down and Egress',
            'description' => 'Assistance with set-down and egress for your event.',
            'uom' => 'per hour',
            'price' => 100.00,
            'quantity' => 10,
        ]);
        
    }
}
