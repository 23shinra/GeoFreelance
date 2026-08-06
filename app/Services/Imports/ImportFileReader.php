<?php

declare(strict_types=1);

namespace App\Services\Imports;

use Illuminate\Support\Facades\Storage;
use League\Csv\Reader;
use PhpOffice\PhpSpreadsheet\IOFactory;
use RuntimeException;
use Throwable;

final readonly class ImportFileReader
{
    /**
     * @return array{headers: list<string>, rows: list<array<string, mixed>>}
     */
    public function read(string $diskPath, int $limit = 0): array
    {
        $absolutePath = Storage::disk('local')->path($diskPath);

        if (! is_file($absolutePath)) {
            throw new RuntimeException('Import file not found.');
        }

        $extension = strtolower(pathinfo($absolutePath, PATHINFO_EXTENSION));

        return match ($extension) {
            'csv', 'txt' => $this->readCsv($absolutePath, $limit),
            'xlsx', 'xls' => $this->readSpreadsheet($absolutePath, $limit),
            default => throw new RuntimeException('Unsupported import file type.'),
        };
    }

    /**
     * @return array{headers: list<string>, rows: list<array<string, mixed>>}
     */
    private function readCsv(string $absolutePath, int $limit): array
    {
        $reader = Reader::createFromPath($absolutePath);
        $reader->setHeaderOffset(0);

        $headers = array_values(array_map(
            static fn (mixed $header): string => trim((string) $header),
            $reader->getHeader(),
        ));

        $rows = [];

        foreach ($reader->getRecords() as $record) {
            /** @var array<string, mixed> $record */
            $rows[] = $this->normalizeRecord($headers, $record);

            if ($limit > 0 && count($rows) >= $limit) {
                break;
            }
        }

        return [
            'headers' => $headers,
            'rows' => $rows,
        ];
    }

    /**
     * @return array{headers: list<string>, rows: list<array<string, mixed>>}
     */
    private function readSpreadsheet(string $absolutePath, int $limit): array
    {
        try {
            $spreadsheet = IOFactory::load($absolutePath);
            /** @var array<int, array<int, mixed>> $sheet */
            $sheet = $spreadsheet->getActiveSheet()->toArray(null, true, true, false);
        } catch (Throwable $exception) {
            throw new RuntimeException('Unable to read spreadsheet: '.$exception->getMessage(), 0, $exception);
        }

        if ($sheet === []) {
            return [
                'headers' => [],
                'rows' => [],
            ];
        }

        $headerRow = array_shift($sheet) ?? [];
        $headers = array_values(array_map(
            static fn (mixed $header): string => trim((string) $header),
            $headerRow,
        ));

        $rows = [];

        foreach ($sheet as $values) {
            $assoc = [];

            foreach ($headers as $index => $header) {
                $assoc[$header] = $values[$index] ?? null;
            }

            if ($this->rowIsEmpty($assoc)) {
                continue;
            }

            $rows[] = $assoc;

            if ($limit > 0 && count($rows) >= $limit) {
                break;
            }
        }

        return [
            'headers' => $headers,
            'rows' => $rows,
        ];
    }

    /**
     * @param  list<string>  $headers
     * @param  array<string, mixed>  $record
     * @return array<string, mixed>
     */
    private function normalizeRecord(array $headers, array $record): array
    {
        $normalized = [];

        foreach ($headers as $header) {
            $normalized[$header] = $record[$header] ?? null;
        }

        return $normalized;
    }

    /**
     * @param  array<string, mixed>  $row
     */
    private function rowIsEmpty(array $row): bool
    {
        foreach ($row as $value) {
            if (trim((string) $value) !== '') {
                return false;
            }
        }

        return true;
    }
}
