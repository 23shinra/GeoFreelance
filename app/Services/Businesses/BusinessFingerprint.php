<?php

declare(strict_types=1);

namespace App\Services\Businesses;

final readonly class BusinessFingerprint
{
    public function make(string $name, ?string $address): string
    {
        $normalizedName = mb_strtolower(trim(preg_replace('/\s+/u', ' ', $name) ?? $name));
        $normalizedAddress = mb_strtolower(trim(preg_replace('/\s+/u', ' ', (string) $address) ?? (string) $address));

        return hash('sha256', $normalizedName.'|'.$normalizedAddress);
    }
}
