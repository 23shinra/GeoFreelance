<?php

declare(strict_types=1);

namespace App\Services\Geocoding;

use App\Contracts\Geocoder;

/**
 * Swappable geocoder contract. MVP expects coordinates in the import file.
 */
final readonly class NullGeocoder implements Geocoder
{
    public function geocode(string $address, string $city = 'Алматы'): ?array
    {
        return null;
    }
}
