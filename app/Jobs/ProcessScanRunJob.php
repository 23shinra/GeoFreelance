<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\ScanRun;
use App\Services\Scans\ScanRunService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

final class ProcessScanRunJob implements ShouldQueue
{
    use Queueable;

    public int $timeout = 7200;

    public int $tries = 1;

    public function __construct(
        public int $scanRunId,
    ) {}

    public function handle(ScanRunService $scanRunService): void
    {
        $scanRun = ScanRun::query()->find($this->scanRunId);

        if ($scanRun instanceof ScanRun) {
            $scanRunService->process($scanRun);
        }
    }

    public function failed(?Throwable $exception): void
    {
        Log::error('2GIS scan failed', [
            'scan_run_id' => $this->scanRunId,
            'message' => $exception?->getMessage(),
        ]);
    }
}
