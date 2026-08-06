<?php

declare(strict_types=1);

namespace App\Services\Imports;

final readonly class ImportColumnMapper
{
    /**
     * @var array<string, list<string>>
     */
    private const ALIASES = [
        'name' => ['name', 'title', 'название', 'наименование', 'company', 'бизнес'],
        'category' => ['category', 'категория', 'тип', 'rubric', 'рубрика'],
        'address' => ['address', 'адрес', 'addr'],
        'latitude' => ['latitude', 'lat', 'широта'],
        'longitude' => ['longitude', 'lon', 'lng', 'долгота'],
        'phone' => ['phone', 'телефон', 'tel', 'mobile'],
        'website' => ['website', 'site', 'url', 'сайт', 'web'],
        'social_links' => ['social', 'socials', 'social_links', 'соцсети', 'instagram', 'telegram'],
        'external_id' => ['external_id', 'id', '2gis_id', 'source_id', 'внешний_id'],
        'source_url' => ['source_url', 'ссылка', '2gis_url', 'profile_url'],
    ];

    /**
     * @param  list<string>  $headers
     * @return array<string, string>
     */
    public function guess(array $headers): array
    {
        $map = [];

        foreach ($headers as $header) {
            $normalized = $this->normalizeHeader($header);

            foreach (self::ALIASES as $field => $aliases) {
                if (in_array($normalized, $aliases, true) && ! isset($map[$field])) {
                    $map[$field] = $header;
                }
            }
        }

        return $map;
    }

    /**
     * @return list<string>
     */
    public function requiredFields(): array
    {
        return ['name'];
    }

    private function normalizeHeader(string $header): string
    {
        $header = mb_strtolower(trim($header));
        $header = str_replace([' ', '-'], '_', $header);

        return $header;
    }
}
