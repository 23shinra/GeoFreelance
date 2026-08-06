<?php

declare(strict_types=1);

namespace App\Contracts;

/**
 * Adapter for directory providers (parser-2gis Chrome CDP, CSV import, etc.).
 */
interface BusinessSource
{
    public function name(): string;

    /**
     * @param  array{city?: string, category?: string, bounds?: array{north: float, south: float, east: float, west: float}}  $filters
     * @return iterable<int, array{
     *     external_id: string,
     *     name: string,
     *     category?: string|null,
     *     address?: string|null,
     *     latitude?: float|null,
     *     longitude?: float|null,
     *     phone?: string|null,
     *     website?: string|null,
     *     website_checked?: bool,
     *     social_links?: list<string>,
     *     source_url?: string|null
     * }>
     */
    public function search(array $filters = []): iterable;
}
