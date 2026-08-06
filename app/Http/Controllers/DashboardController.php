<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\BusinessStatus;
use App\Models\Business;
use App\Models\ImportRun;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        return Inertia::render('dashboard', [
            'stats' => [
                'leads' => Business::query()->leads()->count(),
                'ignored_has_website' => Business::query()
                    ->where('status', BusinessStatus::IgnoredHasWebsite)
                    ->count(),
                'ignored_manual' => Business::query()
                    ->where('status', BusinessStatus::IgnoredManual)
                    ->count(),
                'needs_coordinates' => Business::query()
                    ->where('status', BusinessStatus::NeedsCoordinates)
                    ->count(),
                'needs_website_check' => Business::query()
                    ->where('status', BusinessStatus::NeedsWebsiteCheck)
                    ->count(),
                'checked' => Business::query()->whereNotNull('last_checked_at')->count(),
                'imports' => ImportRun::query()->where('user_id', $request->user()?->id)->count(),
            ],
            'recentImports' => ImportRun::query()
                ->where('user_id', $request->user()?->id)
                ->latest()
                ->limit(5)
                ->get()
                ->map(static fn (ImportRun $run): array => [
                    'id' => $run->id,
                    'original_filename' => $run->original_filename,
                    'status' => $run->status->value,
                    'status_label' => $run->status->label(),
                    'stats' => $run->stats,
                    'created_at' => $run->created_at?->toIso8601String(),
                ]),
            'recentChecked' => Business::query()
                ->whereNotNull('last_checked_at')
                ->latest('last_checked_at')
                ->limit(8)
                ->get(['id', 'name', 'status', 'website', 'address', 'last_checked_at'])
                ->map(static fn (Business $business): array => [
                    'id' => $business->id,
                    'name' => $business->name,
                    'status' => $business->status->value,
                    'status_label' => $business->status->label(),
                    'website' => $business->website,
                    'address' => $business->address,
                    'last_checked_at' => $business->last_checked_at?->toIso8601String(),
                ]),
        ]);
    }
}
