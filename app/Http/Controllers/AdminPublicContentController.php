<?php

namespace App\Http\Controllers;

use App\Models\CalendarBlock;
use App\Models\FeaturePackage;
use App\Models\HomepageStat;
use App\Models\PublicEvent;
use App\Models\SiteSetting;
use App\Models\VenueSpace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminPublicContentController extends Controller
{
    public function home(Request $request): Response
    {
        $this->ensureAdmin($request);

        $bcccEvents = PublicEvent::query()
            ->where('scope', 'bccc')
            ->orderBy('event_date')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (PublicEvent $event) => $this->mapEvent($event))
            ->values();

        $cityEvents = PublicEvent::query()
            ->where('scope', 'city')
            ->orderBy('event_date')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (PublicEvent $event) => $this->mapEvent($event))
            ->values();

        $packages = FeaturePackage::query()
            ->orderBy('sort_order')
            ->get()
            ->map(fn (FeaturePackage $package) => [
                'id' => $package->id,
                'title' => $package->title,
                'description' => $package->description,
                'images' => $package->images ?? [],
            ])
            ->values();

        $calendarBlocks = CalendarBlock::query()
            ->orderBy('date_from')
            ->orderBy('area')
            ->get()
            ->map(fn (CalendarBlock $block) => [
                'id' => $block->id,
                'title' => $block->title,
                'area' => $block->area,
                'block' => $block->block,
                'dateFrom' => optional($block->date_from)->format('Y-m-d'),
                'dateTo' => optional($block->date_to)->format('Y-m-d'),
                'note' => $block->notes,
                'statusColor' => $block->public_status ?? 'red',
            ])
            ->values();

        $spaces = VenueSpace::query()
            ->orderBy('sort_order')
            ->get()
            ->map(fn (VenueSpace $space) => [
                'id' => $space->id,
                'title' => $space->title,
                'category' => $space->category,
                'capacity' => $space->capacity,
                'shortDescription' => $space->short_description,
                'summary' => $space->summary,
                'details' => $space->details ?? [],
                'lightImage' => $space->light_image,
                'darkImage' => $space->dark_image,
                'homepageVisible' => (bool) $space->homepage_visible,
            ])
            ->values();

        $stats = HomepageStat::query()
            ->orderBy('sort_order')
            ->get()
            ->map(fn (HomepageStat $stat) => [
                'id' => $stat->id,
                'label' => $stat->label,
                'value' => $stat->value,
                'suffix' => $stat->suffix,
            ])
            ->values();

        $siteSetting = SiteSetting::query()->first();

        return Inertia::render('admin/home', [
            'initialBcccEvents' => $bcccEvents,
            'initialCityEvents' => $cityEvents,
            'initialPackages' => $packages,
            'initialCalendarBlocks' => $calendarBlocks,
            'initialSpaces' => $spaces,
            'initialStats' => $stats,
            'initialSiteConfig' => [
                'mapEmbedUrl' => $siteSetting?->map_embed_url
                    ?? 'https://www.google.com/maps?q=CH3X%2BRRW%2C%20Baguio%2C%20Benguet%2C%20Philippines&z=16&output=embed',
                'openMapUrl' => $siteSetting?->open_map_url
                    ?? 'https://www.google.com/maps/search/?api=1&query=CH3X%2BRRW%2C%20Baguio%2C%20Benguet%2C%20Philippines',
                'address' => $siteSetting?->address
                    ?? 'CH3X+RRW, Baguio, Benguet, Philippines',
                'phone' => $siteSetting?->phone
                    ?? '(074) 446 2009',
                'email' => $siteSetting?->email
                    ?? 'info@bccc-ease.com',
                'footerDescription' => $siteSetting?->footer_description
                    ?? 'A public-facing venue platform for space discovery, event highlights, schedule visibility, and booking guidance for the Baguio Convention and Cultural Center.',
                'footerCopyright' => $siteSetting?->footer_copyright
                    ?? '© 2026 BCCC EASE • City Government of Baguio • All Rights Reserved',
            ],
        ]);
    }

    public function storeEvent(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'scope' => ['required', Rule::in(['bccc', 'city'])],
            'title' => ['required', 'string', 'max:255'],
            'venue' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date_format:Y-m-d'],
            'time' => ['nullable', 'date_format:H:i'],
            'description' => ['required', 'string'],
            'note' => ['nullable', 'string'],
            'highlighted' => ['nullable', 'boolean'],
            'is_public' => ['nullable', 'boolean'],
            'images.*' => ['nullable', 'image', 'max:5120'],
        ]);

        $event = PublicEvent::create([
            'scope' => $data['scope'],
            'title' => $data['title'],
            'venue' => $data['venue'],
            'event_date' => $data['date'],
            'event_time' => $data['time'] ?? null,
            'description' => $data['description'],
            'note' => $data['note'] ?? null,
            'is_highlighted' => (bool) ($data['highlighted'] ?? false),
            'is_public' => (bool) ($data['is_public'] ?? true),
            'images' => $this->storeManyImages($request, 'images', 'public-content/events'),
            'sort_order' => ((int) PublicEvent::max('sort_order')) + 1,
        ]);

        return response()->json([
            'ok' => true,
            'item' => $this->mapEvent($event),
        ]);
    }

    public function updateEvent(Request $request, PublicEvent $publicEvent): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'scope' => ['sometimes', Rule::in(['bccc', 'city'])],
            'title' => ['sometimes', 'string', 'max:255'],
            'venue' => ['sometimes', 'string', 'max:255'],
            'date' => ['sometimes', 'date_format:Y-m-d'],
            'time' => ['nullable', 'date_format:H:i'],
            'description' => ['sometimes', 'string'],
            'note' => ['nullable', 'string'],
            'highlighted' => ['nullable', 'boolean'],
            'is_public' => ['nullable', 'boolean'],
            'images.*' => ['nullable', 'image', 'max:5120'],
        ]);

        $publicEvent->update([
            'scope' => $data['scope'] ?? $publicEvent->scope,
            'title' => $data['title'] ?? $publicEvent->title,
            'venue' => $data['venue'] ?? $publicEvent->venue,
            'event_date' => $data['date'] ?? optional($publicEvent->event_date)->format('Y-m-d'),
            'event_time' => array_key_exists('time', $data) ? $data['time'] : $publicEvent->event_time,
            'description' => $data['description'] ?? $publicEvent->description,
            'note' => array_key_exists('note', $data) ? $data['note'] : $publicEvent->note,
            'is_highlighted' => array_key_exists('highlighted', $data) ? (bool) $data['highlighted'] : $publicEvent->is_highlighted,
            'is_public' => array_key_exists('is_public', $data) ? (bool) $data['is_public'] : $publicEvent->is_public,
            'images' => $request->hasFile('images')
                ? $this->replaceManyImages($request, 'images', 'public-content/events', $publicEvent->images ?? [])
                : ($publicEvent->images ?? []),
        ]);

        return response()->json([
            'ok' => true,
            'item' => $this->mapEvent($publicEvent->fresh()),
        ]);
    }

    public function destroyEvent(Request $request, PublicEvent $publicEvent): JsonResponse
    {
        $this->ensureAdmin($request);

        $this->deleteManyImages($publicEvent->images ?? []);
        $publicEvent->delete();

        return response()->json([
            'ok' => true,
        ]);
    }

    public function storePackage(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'images.*' => ['nullable', 'image', 'max:5120'],
        ]);

        $package = FeaturePackage::create([
            'title' => $data['title'],
            'description' => $data['description'],
            'images' => $this->storeManyImages($request, 'images', 'public-content/packages'),
            'sort_order' => ((int) FeaturePackage::max('sort_order')) + 1,
        ]);

        return response()->json([
            'ok' => true,
            'item' => [
                'id' => $package->id,
                'title' => $package->title,
                'description' => $package->description,
                'images' => $package->images ?? [],
            ],
        ]);
    }

    public function updatePackage(Request $request, FeaturePackage $featurePackage): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'images.*' => ['nullable', 'image', 'max:5120'],
        ]);

        $featurePackage->update([
            'title' => $data['title'] ?? $featurePackage->title,
            'description' => $data['description'] ?? $featurePackage->description,
            'images' => $request->hasFile('images')
                ? $this->replaceManyImages($request, 'images', 'public-content/packages', $featurePackage->images ?? [])
                : ($featurePackage->images ?? []),
        ]);

        return response()->json([
            'ok' => true,
            'item' => [
                'id' => $featurePackage->id,
                'title' => $featurePackage->title,
                'description' => $featurePackage->description,
                'images' => $featurePackage->images ?? [],
            ],
        ]);
    }

    public function destroyPackage(Request $request, FeaturePackage $featurePackage): JsonResponse
    {
        $this->ensureAdmin($request);

        $this->deleteManyImages($featurePackage->images ?? []);
        $featurePackage->delete();

        return response()->json([
            'ok' => true,
        ]);
    }

    public function storeSpace(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'capacity' => ['nullable', 'string', 'max:255'],
            'short_description' => ['required', 'string'],
            'summary' => ['nullable', 'string'],
            'details' => ['nullable', 'array'],
            'details.*' => ['string'],
            'homepage_visible' => ['nullable', 'boolean'],
            'light_image' => ['nullable', 'image', 'max:5120'],
            'dark_image' => ['nullable', 'image', 'max:5120'],
        ]);

        $space = VenueSpace::create([
            'title' => $data['title'],
            'category' => $data['category'],
            'capacity' => $data['capacity'] ?? null,
            'short_description' => $data['short_description'],
            'summary' => $data['summary'] ?? null,
            'details' => $data['details'] ?? [],
            'homepage_visible' => (bool) ($data['homepage_visible'] ?? true),
            'light_image' => $this->storeSingleImage($request, 'light_image', 'public-content/spaces'),
            'dark_image' => $this->storeSingleImage($request, 'dark_image', 'public-content/spaces'),
            'sort_order' => ((int) VenueSpace::max('sort_order')) + 1,
        ]);

        return response()->json([
            'ok' => true,
            'item' => [
                'id' => $space->id,
                'title' => $space->title,
                'category' => $space->category,
                'capacity' => $space->capacity,
                'shortDescription' => $space->short_description,
                'summary' => $space->summary,
                'details' => $space->details ?? [],
                'lightImage' => $space->light_image,
                'darkImage' => $space->dark_image,
                'homepageVisible' => (bool) $space->homepage_visible,
            ],
        ]);
    }

    public function updateSpace(Request $request, VenueSpace $venueSpace): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'category' => ['sometimes', 'string', 'max:255'],
            'capacity' => ['nullable', 'string', 'max:255'],
            'short_description' => ['sometimes', 'string'],
            'summary' => ['nullable', 'string'],
            'details' => ['nullable', 'array'],
            'details.*' => ['string'],
            'homepage_visible' => ['nullable', 'boolean'],
            'light_image' => ['nullable', 'image', 'max:5120'],
            'dark_image' => ['nullable', 'image', 'max:5120'],
        ]);

        $venueSpace->update([
            'title' => $data['title'] ?? $venueSpace->title,
            'category' => $data['category'] ?? $venueSpace->category,
            'capacity' => array_key_exists('capacity', $data) ? $data['capacity'] : $venueSpace->capacity,
            'short_description' => $data['short_description'] ?? $venueSpace->short_description,
            'summary' => array_key_exists('summary', $data) ? $data['summary'] : $venueSpace->summary,
            'details' => array_key_exists('details', $data) ? ($data['details'] ?? []) : ($venueSpace->details ?? []),
            'homepage_visible' => array_key_exists('homepage_visible', $data)
                ? (bool) $data['homepage_visible']
                : (bool) $venueSpace->homepage_visible,
            'light_image' => $request->hasFile('light_image')
                ? $this->replaceSingleImage($request, 'light_image', 'public-content/spaces', $venueSpace->light_image)
                : $venueSpace->light_image,
            'dark_image' => $request->hasFile('dark_image')
                ? $this->replaceSingleImage($request, 'dark_image', 'public-content/spaces', $venueSpace->dark_image)
                : $venueSpace->dark_image,
        ]);

        return response()->json([
            'ok' => true,
            'item' => [
                'id' => $venueSpace->id,
                'title' => $venueSpace->title,
                'category' => $venueSpace->category,
                'capacity' => $venueSpace->capacity,
                'shortDescription' => $venueSpace->short_description,
                'summary' => $venueSpace->summary,
                'details' => $venueSpace->details ?? [],
                'lightImage' => $venueSpace->light_image,
                'darkImage' => $venueSpace->dark_image,
                'homepageVisible' => (bool) $venueSpace->homepage_visible,
            ],
        ]);
    }

    public function destroySpace(Request $request, VenueSpace $venueSpace): JsonResponse
    {
        $this->ensureAdmin($request);

        $this->deleteSingleImage($venueSpace->light_image);
        $this->deleteSingleImage($venueSpace->dark_image);
        $venueSpace->delete();

        return response()->json([
            'ok' => true,
        ]);
    }

    public function storeStat(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'label' => ['required', 'string', 'max:255'],
            'value' => ['required', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:50'],
        ]);

        $stat = HomepageStat::create([
            'label' => $data['label'],
            'value' => $data['value'],
            'suffix' => $data['suffix'] ?? null,
            'sort_order' => ((int) HomepageStat::max('sort_order')) + 1,
        ]);

        return response()->json([
            'ok' => true,
            'item' => [
                'id' => $stat->id,
                'label' => $stat->label,
                'value' => $stat->value,
                'suffix' => $stat->suffix,
            ],
        ]);
    }

    public function updateStat(Request $request, HomepageStat $homepageStat): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'label' => ['sometimes', 'string', 'max:255'],
            'value' => ['sometimes', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:50'],
        ]);

        $homepageStat->update([
            'label' => $data['label'] ?? $homepageStat->label,
            'value' => $data['value'] ?? $homepageStat->value,
            'suffix' => array_key_exists('suffix', $data) ? $data['suffix'] : $homepageStat->suffix,
        ]);

        return response()->json([
            'ok' => true,
            'item' => [
                'id' => $homepageStat->id,
                'label' => $homepageStat->label,
                'value' => $homepageStat->value,
                'suffix' => $homepageStat->suffix,
            ],
        ]);
    }

    public function destroyStat(Request $request, HomepageStat $homepageStat): JsonResponse
    {
        $this->ensureAdmin($request);

        $homepageStat->delete();

        return response()->json([
            'ok' => true,
        ]);
    }

    public function updateSiteSettings(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'map_embed_url' => ['nullable', 'string'],
            'open_map_url' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'max:255'],
            'footer_description' => ['nullable', 'string'],
            'footer_copyright' => ['nullable', 'string'],
        ]);

        $settings = SiteSetting::query()->first();

        if (! $settings) {
            $settings = new SiteSetting();
        }

        $settings->fill($data);
        $settings->save();

        return response()->json([
            'ok' => true,
            'item' => [
                'mapEmbedUrl' => $settings->map_embed_url,
                'openMapUrl' => $settings->open_map_url,
                'address' => $settings->address,
                'phone' => $settings->phone,
                'email' => $settings->email,
                'footerDescription' => $settings->footer_description,
                'footerCopyright' => $settings->footer_copyright,
            ],
        ]);
    }

    protected function ensureAdmin(Request $request): void
    {
        $user = $request->user();

        if (! $user || ! $user->hasAnyRole(['admin', 'manager'])) {
            abort(403);
        }
    }

    protected function mapEvent(PublicEvent $event): array
    {
        return [
            'id' => $event->id,
            'title' => $event->title,
            'venue' => $event->venue,
            'date' => optional($event->event_date)->format('Y-m-d'),
            'time' => $event->event_time,
            'description' => $event->description,
            'note' => $event->note,
            'highlighted' => (bool) $event->is_highlighted,
            'images' => $event->images ?? [],
            'scope' => $event->scope,
            'isPublic' => (bool) $event->is_public,
        ];
    }

    protected function storeManyImages(Request $request, string $field, string $directory): array
    {
        if (! $request->hasFile($field)) {
            return [];
        }

        $paths = [];

        foreach ((array) $request->file($field) as $file) {
            $paths[] = '/storage/' . $file->store($directory, 'public');
        }

        return array_values(array_slice($paths, 0, 3));
    }

    protected function replaceManyImages(Request $request, string $field, string $directory, array $oldPaths): array
    {
        $this->deleteManyImages($oldPaths);

        return $this->storeManyImages($request, $field, $directory);
    }

    protected function deleteManyImages(array $paths): void
    {
        foreach ($paths as $path) {
            $this->deleteSingleImage($path);
        }
    }

    protected function storeSingleImage(Request $request, string $field, string $directory): ?string
    {
        if (! $request->hasFile($field)) {
            return null;
        }

        return '/storage/' . $request->file($field)->store($directory, 'public');
    }

    protected function replaceSingleImage(Request $request, string $field, string $directory, ?string $oldPath): ?string
    {
        $this->deleteSingleImage($oldPath);

        return $this->storeSingleImage($request, $field, $directory);
    }

    protected function deleteSingleImage(?string $path): void
    {
        if (! $path) {
            return;
        }

        $relative = ltrim(str_replace('/storage/', '', $path), '/');

        if ($relative !== '') {
            Storage::disk('public')->delete($relative);
        }
    }
}