<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Imports\StoreImportRequest;
use App\Http\Requests\Imports\UpdateImportMappingRequest;
use App\Jobs\ProcessImportRunJob;
use App\Models\ImportRun;
use App\Services\Imports\ImportRunService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class ImportController extends Controller
{
    public function __construct(
        private readonly ImportRunService $importRunService,
    ) {}

    public function index(Request $request): Response
    {
        $imports = ImportRun::query()
            ->where('user_id', $request->user()?->id)
            ->latest()
            ->paginate(15)
            ->through(static fn (ImportRun $run): array => [
                'id' => $run->id,
                'original_filename' => $run->original_filename,
                'status' => $run->status->value,
                'status_label' => $run->status->label(),
                'stats' => $run->stats,
                'error_message' => $run->error_message,
                'created_at' => $run->created_at?->toIso8601String(),
                'finished_at' => $run->finished_at?->toIso8601String(),
            ]);

        return Inertia::render('imports/index', [
            'imports' => $imports,
        ]);
    }

    public function store(StoreImportRequest $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 403);

        $file = $request->file('file');
        abort_unless($file !== null, 422);

        $importRun = $this->importRunService->createFromUpload($user, $file);

        return redirect()->route('imports.show', $importRun);
    }

    public function show(Request $request, ImportRun $import): Response
    {
        abort_unless($import->user_id === $request->user()?->id, 403);

        $import->load(['rows' => fn ($q) => $q->latest('row_number')->limit(100)]);

        return Inertia::render('imports/show', [
            'importRun' => [
                'id' => $import->id,
                'original_filename' => $import->original_filename,
                'status' => $import->status->value,
                'status_label' => $import->status->label(),
                'headers' => $import->headers ?? [],
                'preview_rows' => $import->preview_rows ?? [],
                'column_map' => $import->column_map ?? [],
                'stats' => $import->stats,
                'error_message' => $import->error_message,
                'created_at' => $import->created_at?->toIso8601String(),
                'finished_at' => $import->finished_at?->toIso8601String(),
                'rows' => $import->rows->map(static fn ($row): array => [
                    'id' => $row->id,
                    'row_number' => $row->row_number,
                    'status' => $row->status->value,
                    'status_label' => $row->status->label(),
                    'message' => $row->message,
                    'business_id' => $row->business_id,
                ]),
            ],
            'mappableFields' => [
                'name' => 'Название',
                'category' => 'Категория',
                'address' => 'Адрес',
                'latitude' => 'Широта',
                'longitude' => 'Долгота',
                'phone' => 'Телефон',
                'website' => 'Сайт',
                'social_links' => 'Соцсети',
                'external_id' => 'Внешний ID',
                'source_url' => 'Ссылка-источник',
            ],
        ]);
    }

    public function mapColumns(
        UpdateImportMappingRequest $request,
        ImportRun $import,
    ): RedirectResponse {
        abort_unless($import->user_id === $request->user()?->id, 403);

        /** @var array<string, string> $columnMap */
        $columnMap = $request->validated('column_map');

        $this->importRunService->start($import, $columnMap);

        ProcessImportRunJob::dispatch($import->id);

        return redirect()
            ->route('imports.show', $import)
            ->with('success', 'Импорт поставлен в очередь.');
    }
}
