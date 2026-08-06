<?php

declare(strict_types=1);

namespace App\Services\Scans;

use App\Contracts\BusinessSource;
use App\Enums\ImportRowStatus;
use App\Enums\ImportRunStatus;
use App\Models\ScanRun;
use App\Models\User;
use App\Services\Imports\BusinessUpsertService;
use Throwable;

final readonly class ScanRunService
{
    public function __construct(
        private BusinessSource $businessSource,
        private BusinessUpsertService $businessUpsertService,
    ) {}

    /**
     * @param  list<string>  $queries
     */
    public function create(User $user, array $queries): ScanRun
    {
        return ScanRun::query()->create([
            'user_id' => $user->id,
            'source' => $this->businessSource->name(),
            'city' => (string) config('leads.city', 'Алматы'),
            'queries' => $queries,
            'status' => ImportRunStatus::Pending,
            'stats' => $this->emptyStats(),
        ]);
    }

    public function process(ScanRun $scanRun): ScanRun
    {
        $stats = $this->emptyStats();

        $scanRun->update([
            'status' => ImportRunStatus::Processing,
            'started_at' => now(),
            'error_message' => null,
        ]);

        try {
            foreach ($scanRun->queries as $query) {
                foreach ($this->businessSource->search([
                    'city' => $scanRun->city,
                    'category' => $query,
                ]) as $payload) {
                    $stats['checked']++;

                    $result = $this->businessUpsertService->upsertPayload(
                        $payload,
                        $this->businessSource->name(),
                    );

                    match ($result['status']) {
                        ImportRowStatus::Created => $stats['created']++,
                        ImportRowStatus::Updated => $stats['updated']++,
                        ImportRowStatus::Ignored => $stats['ignored']++,
                        ImportRowStatus::Error => $stats['errors']++,
                        default => null,
                    };

                    if ($result['business']?->status->value === 'lead') {
                        $stats['leads']++;
                    }

                    if ($result['business']?->status->value === 'ignored_has_website') {
                        $stats['ignored_has_website']++;
                    }

                    if ($result['business']?->status->value === 'needs_website_check') {
                        $stats['needs_website_check']++;
                    }

                    $scanRun->update(['stats' => $stats]);
                }

                $stats['queries_completed']++;
            }

            $scanRun->update([
                'status' => ImportRunStatus::Completed,
                'stats' => $stats,
                'finished_at' => now(),
            ]);
        } catch (Throwable $exception) {
            $scanRun->update([
                'status' => ImportRunStatus::Failed,
                'stats' => $stats,
                'error_message' => $exception->getMessage(),
                'finished_at' => now(),
            ]);

            throw $exception;
        }

        return $scanRun->fresh() ?? $scanRun;
    }

    /**
     * @return array<string, int>
     */
    private function emptyStats(): array
    {
        return [
            'checked' => 0,
            'created' => 0,
            'updated' => 0,
            'leads' => 0,
            'ignored' => 0,
            'ignored_has_website' => 0,
            'needs_website_check' => 0,
            'errors' => 0,
            'queries_completed' => 0,
        ];
    }
}
