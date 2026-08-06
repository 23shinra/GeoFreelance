<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\ImportRun;
use App\Services\Imports\ImportRunService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

final class ProcessImportRunJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $importRunId,
    ) {}

    public function handle(ImportRunService $importRunService): void
    {
        $importRun = ImportRun::query()->find($this->importRunId);

        if (! $importRun instanceof ImportRun) {
            return;
        }

        $importRunService->process($importRun);
    }

    public function failed(?Throwable $exception): void
    {
        Log::error('Import run failed', [
            'import_run_id' => $this->importRunId,
            'message' => $exception?->getMessage(),
        ]);
    }
}
