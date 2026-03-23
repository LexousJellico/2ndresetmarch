<?php

namespace App\Services;

use App\Models\Service;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use App\Services\Contracts\ServiceServiceInterface;

class ServiceService implements ServiceServiceInterface
{
    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return Service::query()->latest('id')->paginate($perPage)->withQueryString();
    }

    /** @param array{name:string,description:string,uom:string,price:numeric,quantity:int} $data */
    public function create(array $data): Service
    {
        return DB::transaction(function () use ($data) {
            return Service::create($data);
        });
    }

    /** @param array{name:string,description:string,uom:string,price:numeric,quantity:int} $data */
    public function update(Service $service, array $data): Service
    {
        return DB::transaction(function () use ($service, $data) {
            $service->update($data);
            return $service->refresh();
        });
    }

    public function delete(Service $service): void
    {
        DB::transaction(function () use ($service) {
            $service->delete();
        });
    }
}
