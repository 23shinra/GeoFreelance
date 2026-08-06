<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\BusinessStatus;
use App\Http\Resources\BusinessCardResource;
use App\Models\Business;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class MapController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $status = $request->string('status')->toString();
        $categoryId = $request->integer('category_id') ?: null;
        $search = trim($request->string('search')->toString());

        $query = Business::query()
            ->with('category:id,name,slug')
            ->mappable()
            ->when(
                $status !== '' && BusinessStatus::tryFrom($status) !== null,
                fn ($builder) => $builder->where('status', $status),
                fn ($builder) => $builder->whereIn('status', [
                    BusinessStatus::Lead,
                    BusinessStatus::NeedsWebsiteCheck,
                ]),
            )
            ->when($categoryId !== null, fn ($builder) => $builder->where('category_id', $categoryId))
            ->when($search !== '', function ($builder) use ($search): void {
                $builder->where(function ($inner) use ($search): void {
                    $inner
                        ->where('name', 'like', '%'.$search.'%')
                        ->orWhere('address', 'like', '%'.$search.'%')
                        ->orWhere('phone', 'like', '%'.$search.'%');
                });
            })
            ->latest('last_checked_at');

        return Inertia::render('map/index', [
            'businesses' => BusinessCardResource::collection($query->limit(2000)->get())
                ->resolve(),
            'categories' => Category::query()->orderBy('name')->get(['id', 'name', 'slug']),
            'filters' => [
                'status' => $status !== '' ? $status : 'candidates',
                'category_id' => $categoryId,
                'search' => $search,
            ],
            'mapConfig' => [
                'center' => [
                    'lat' => (float) config('leads.map.center_lat'),
                    'lng' => (float) config('leads.map.center_lng'),
                ],
                'zoom' => (int) config('leads.map.zoom'),
                'styleUrl' => (string) config('leads.map.style_url'),
                'styleUrlLight' => (string) config('leads.map.style_url_light'),
            ],
            'stats' => [
                'leads' => Business::query()->leads()->count(),
                'ignored' => Business::query()->ignored()->count(),
                'needs_coordinates' => Business::query()->where('status', BusinessStatus::NeedsCoordinates)->count(),
                'needs_website_check' => Business::query()->where('status', BusinessStatus::NeedsWebsiteCheck)->count(),
                'checked' => Business::query()->whereNotNull('last_checked_at')->count(),
            ],
        ]);
    }
}
