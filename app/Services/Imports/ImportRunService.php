<?php

declare(strict_types=1);

namespace App\Services\Imports;

use App\Enums\ImportRunStatus;
use App\Enums\ImportRowStatus;
use App\Models\ImportRun;
use App\Models\ImportRow;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

final readonly class ImportRunService
{
    public function __construct(
        private ImportFileReader $fileReader,
        private ImportColumnMapper $columnMapper,
        private BusinessUpsertService $upsertService,
    ) {}

    public function createFromUpload(User $user, UploadedFile $file): ImportRun
    {
        $storedPath = $file->store('imports/'.$user->id, 'local');

        if ($storedPath === false) {
            throw new RuntimeException('Unable to store import file.');
        }

        $preview = $this->fileReader->read($storedPath, 5);
        $guessedMap = $this->columnMapper->guess($preview['headers']);

        return ImportRun::query()->create([
            'user_id' => $user->id,
            'original_filename' => $file->getClientOriginalName(),
            'stored_path' => $storedPath,
            'status' => ImportRunStatus::Mapping,
            'headers' => $preview['headers'],
            'preview_rows' => $preview['rows'],
            'column_map' => $guessedMap,
            'stats' => $this->emptyStats(),
        ]);
    }

    /**
     * @param  array<string, string>  $columnMap
     */
    public function start(ImportRun $importRun, array $columnMap): ImportRun
    {
        foreach ($this->columnMapper->requiredFields() as $requiredField) {
            if (! filled($columnMap[$requiredField] ?? null)) {
                throw new RuntimeException('Необходимо сопоставить колонку: '.$requiredField);
            }
        }

        $importRun->update([
            'column_map' => $columnMap,
            'status' => ImportRunStatus::Processing,
            'started_at' => now(),
            'error_message' => null,
        ]);

        return $importRun->fresh() ?? $importRun;
    }

    public function process(ImportRun $importRun): ImportRun
    {
        $columnMap = $importRun->column_map ?? [];

        if ($columnMap === []) {
            throw new RuntimeException('Column map is empty.');
        }

        $data = $this->fileReader->read($importRun->stored_path);
        $stats = $this->emptyStats();
        $stats['total'] = count($data['rows']);

        try {
            DB::transaction(function () use ($importRun, $data, $columnMap, &$stats): void {
                ImportRow::query()->where('import_run_id', $importRun->id)->delete();

                foreach ($data['rows'] as $index => $row) {
                    $result = $this->upsertService->upsert($columnMap, $row);

                    ImportRow::query()->create([
                        'import_run_id' => $importRun->id,
                        'business_id' => $result['business']?->id,
                        'row_number' => $index + 1,
                        'raw_data' => $row,
                        'status' => $result['status'],
                        'message' => $result['message'],
                    ]);

                    match ($result['status']) {
                        ImportRowStatus::Created => $stats['created']++,
                        ImportRowStatus::Updated => $stats['updated']++,
                        ImportRowStatus::Duplicate => $stats['duplicates']++,
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

                    if ($result['business']?->status->value === 'needs_coordinates') {
                        $stats['needs_coordinates']++;
                    }
                }

                $importRun->update([
                    'status' => ImportRunStatus::Completed,
                    'stats' => $stats,
                    'finished_at' => now(),
                    'error_message' => null,
                ]);
            });
        } catch (Throwable $exception) {
            $importRun->update([
                'status' => ImportRunStatus::Failed,
                'error_message' => $exception->getMessage(),
                'finished_at' => now(),
                'stats' => $stats,
            ]);

            throw $exception;
        }

        return $importRun->fresh() ?? $importRun;
    }

    public function deleteStoredFile(ImportRun $importRun): void
    {
        if (Storage::disk('local')->exists($importRun->stored_path)) {
            Storage::disk('local')->delete($importRun->stored_path);
        }
    }

    /**
     * @return array<string, int>
     */
    private function emptyStats(): array
    {
        return [
            'total' => 0,
            'created' => 0,
            'updated' => 0,
            'duplicates' => 0,
            'ignored' => 0,
            'ignored_has_website' => 0,
            'needs_coordinates' => 0,
            'leads' => 0,
            'errors' => 0,
        ];
    }
}
