<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServiceTypeRequest;
use App\Http\Requests\UpdateServiceTypeRequest;
use App\Http\Resources\ServiceTypeResource;
use App\Models\ServiceType;
use App\Services\Contracts\ServiceTypeServiceInterface;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceTypeController extends Controller
{
    public function __construct(
        private readonly ServiceTypeServiceInterface $serviceTypes,
        private readonly NotificationService $notifications,
    ) {
    }

    public function index(Request $request): Response
    {
        $perPage = (int) $request->integer('per_page', 10);
        $paginator = $this->serviceTypes->paginate($perPage);

        return Inertia::render('service-types/index', [
            'serviceTypes' => ServiceTypeResource::collection($paginator)->response()->getData(true),
        ]);
    }

    public function store(StoreServiceTypeRequest $request): RedirectResponse
    {
        $serviceType = $this->serviceTypes->create($request->validated());

        if ($request->user()) {
            $this->notifications->serviceTypeCreated($serviceType, $request->user());
        }

        return redirect()->route('service-types.index')->with('success', 'Service type created successfully.');
    }

    public function update(UpdateServiceTypeRequest $request, ServiceType $serviceType): RedirectResponse
    {
        $actor = $request->user();
        $original = $serviceType->getOriginal();

        $updated = $this->serviceTypes->update($serviceType, $request->validated());

        $changes = [];
        foreach ($updated->getAttributes() as $field => $newVal) {
            if (!array_key_exists($field, $original)) {
                continue;
            }
            $oldVal = $original[$field];
            if ($oldVal == $newVal) {
                continue;
            }
            $changes[$field] = [$oldVal, $newVal];
        }

        if ($actor) {
            $this->notifications->serviceTypeUpdated($updated, $actor, $changes);
        }

        return redirect()->route('service-types.index')->with('success', 'Service type updated successfully.');
    }

    public function destroy(Request $request, ServiceType $serviceType): RedirectResponse
    {
        if ($request->user()) {
            $this->notifications->serviceTypeDeleted($serviceType, $request->user());
        }

        $this->serviceTypes->delete($serviceType);

        return redirect()->route('service-types.index')->with('success', 'Service type deleted successfully.');
    }
}
