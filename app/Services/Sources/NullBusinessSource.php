<?php

declare(strict_types=1);

namespace App\Services\Sources;

use App\Contracts\BusinessSource;
use RuntimeException;

/**
 * Placeholder until an officially licensed directory provider is configured.
 */
final readonly class NullBusinessSource implements BusinessSource
{
    public function name(): string
    {
        return 'null';
    }

    public function search(array $filters = []): iterable
    {
        throw new RuntimeException(
            'Directory source is not configured. Set LEADS_SOURCE_DRIVER=parser2gis and install tools/parser-2gis, or use CSV/XLSX import.',
        );
    }
}
