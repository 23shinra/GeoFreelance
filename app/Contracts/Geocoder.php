<?php

declare(strict_types=1);

namespace App\Contracts;

interface Geocoder
{
    /**
     * @return array{latitude: float, longitude: float}|null
     */
    public function geocode(string $address, string $city = 'Алматы'): ?array;
}
