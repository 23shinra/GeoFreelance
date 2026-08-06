<?php

declare(strict_types=1);

namespace App\Services\Businesses;

use App\Enums\BusinessStatus;
use App\Models\Business;
use Illuminate\Support\Carbon;

final readonly class BusinessStatusService
{
    public function markAsLead(Business $business): Business
    {
        $business->fill([
            'status' => $business->latitude === null || $business->longitude === null
                ? BusinessStatus::NeedsCoordinates
                : BusinessStatus::Lead,
            'ignored_at' => null,
            'ignore_reason' => null,
        ])->save();

        return $business->fresh() ?? $business;
    }

    public function ignoreManual(Business $business, ?string $reason = null): Business
    {
        $business->fill([
            'status' => BusinessStatus::IgnoredManual,
            'ignored_at' => Carbon::now(),
            'ignore_reason' => $reason ?: 'Игнорирован вручную.',
        ])->save();

        return $business->fresh() ?? $business;
    }

    public function restore(Business $business): Business
    {
        if ($business->hasWebsite()) {
            $business->fill([
                'status' => BusinessStatus::IgnoredHasWebsite,
                'ignored_at' => $business->ignored_at ?? Carbon::now(),
                'ignore_reason' => 'У бизнеса уже есть сайт.',
            ])->save();

            return $business->fresh() ?? $business;
        }

        return $this->markAsLead($business);
    }
}
