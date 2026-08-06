<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Scans\StoreScanRequest;
use App\Jobs\ProcessScanRunJob;
use App\Models\ScanRun;
use App\Services\Scans\ScanRunService;
use App\Services\Sources\Parser2gisBusinessSource;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class ScanController extends Controller
{
    public function index(Request $request, Parser2gisBusinessSource $parser): Response
    {
        $scans = ScanRun::query()
            ->where('user_id', $request->user()?->id)
            ->latest()
            ->paginate(15)
            ->through(static fn (ScanRun $scan): array => [
                'id' => $scan->id,
                'source' => $scan->source,
                'city' => $scan->city,
                'queries' => $scan->queries,
                'status' => $scan->status->value,
                'status_label' => $scan->status->label(),
                'stats' => $scan->stats,
                'error_message' => $scan->error_message,
                'created_at' => $scan->created_at?->toIso8601String(),
                'finished_at' => $scan->finished_at?->toIso8601String(),
            ]);

        return Inertia::render('scans/index', [
            'scans' => $scans,
            'suggestedQueries' => [
                'рестораны',
                'стоматологии',
                'салоны красоты',
                'фитнес-клубы',
                'автосервисы',
                'юридические услуги',
                'ремонт квартир',
                'частные клиники',
            ],
            'configured' => config('leads.source_driver') === 'parser2gis'
                && $parser->isConfigured(),
            'maxRecords' => (int) config('leads.parser2gis.max_records', 100),
        ]);
    }

    public function store(
        StoreScanRequest $request,
        ScanRunService $scanRunService,
    ): RedirectResponse {
        $user = $request->user();
        abort_unless($user !== null, 403);

        /** @var list<string> $queries */
        $queries = array_values(array_map(
            static fn (mixed $query): string => trim((string) $query),
            $request->validated('queries'),
        ));

        $scanRun = $scanRunService->create($user, $queries);
        ProcessScanRunJob::dispatch($scanRun->id);

        return redirect()
            ->route('scans.index')
            ->with('success', 'Скан 2GIS через parser-2gis запущен. Во время работы откроется Chrome.');
    }
}
