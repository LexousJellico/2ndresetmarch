<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'uom' => $this->uom,
            'price' => $this->price,
            'quantity' => $this->quantity,
            'service_type_id' => $this->service_type_id,
            'service_type' => $this->whenLoaded('serviceType', fn () => $this->serviceType?->name, $this->serviceType?->name),
            'created_at' => $this->created_at,
        ];
    }
}
