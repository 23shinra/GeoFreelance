<?php

declare(strict_types=1);

namespace App\Services\Sources;

use App\Contracts\BusinessSource;
use Illuminate\Support\Facades\File;
use JsonException;
use RuntimeException;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

/**
 * Drives the open-source parser-2gis CLI (Chrome CDP) and maps catalog items
 * into the shared BusinessSource payload, including phones and websites.
 */
final readonly class Parser2gisBusinessSource implements BusinessSource
{
    private const SOCIAL_TYPES = [
        'instagram',
        'facebook',
        'vk',
        'vkontakte',
        'telegram',
        'whatsapp',
        'viber',
        'youtube',
        'twitter',
        'skype',
        'tiktok',
        'ok',
        'social',
    ];

    public function name(): string
    {
        return 'parser2gis';
    }

    public function search(array $filters = []): iterable
    {
        $query = trim((string) ($filters['category'] ?? ''));

        if ($query === '') {
            throw new RuntimeException('Для поиска 2GIS укажите категорию.');
        }

        $outputPath = $this->runParser($this->searchUrl($query));

        try {
            $mapped = array_map(
                fn (array $item): array => $this->mapItem($item),
                $this->readItems($outputPath),
            );
        } finally {
            if (is_file($outputPath)) {
                @unlink($outputPath);
            }
        }

        yield from $mapped;
    }

    public function isConfigured(): bool
    {
        $binary = $this->binary();

        return $binary !== '' && (is_executable($binary) || is_file($binary));
    }

    private function searchUrl(string $query): string
    {
        $domain = (string) config('leads.parser2gis.domain', 'kz');
        $city = (string) config('leads.parser2gis.city_slug', 'almaty');
        $encoded = rawurlencode($query);

        return "https://2gis.{$domain}/{$city}/search/{$encoded}";
    }

    private function runParser(string $url): string
    {
        $binary = $this->binary();

        if ($binary === '' || (! is_executable($binary) && ! is_file($binary))) {
            throw new RuntimeException(
                'parser-2gis не установлен. Выполните: python3 -m venv tools/parser-2gis/.venv && tools/parser-2gis/.venv/bin/pip install parser-2gis',
            );
        }

        $directory = storage_path('app/parser2gis');
        File::ensureDirectoryExists($directory);
        $outputPath = $directory.'/'.uniqid('scan_', true).'.json';

        $command = [
            $binary,
            '-i', $url,
            '-o', $outputPath,
            '-f', 'json',
            '--parser.max-records', (string) max(1, (int) config('leads.parser2gis.max_records', 100)),
            '--parser.delay_between_clicks', (string) max(0, (int) config('leads.parser2gis.delay_between_clicks_ms', 100)),
            '--chrome.headless', config('leads.parser2gis.headless') ? 'yes' : 'no',
        ];

        $chromePath = trim((string) config('leads.parser2gis.chrome_binary', ''));

        if ($chromePath !== '') {
            $command[] = '--chrome.binary_path';
            $command[] = $chromePath;
        }

        $process = new Process(
            $command,
            base_path(),
            null,
            null,
            (float) config('leads.parser2gis.process_timeout', 3600),
        );
        $process->run();

        if (! $process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        if (! is_file($outputPath)) {
            throw new RuntimeException('parser-2gis завершился без файла результата.');
        }

        return $outputPath;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function readItems(string $path): array
    {
        $raw = file_get_contents($path);

        if ($raw === false || trim($raw) === '') {
            return [];
        }

        // parser-2gis пишет UTF-8 с BOM.
        $raw = preg_replace('/^\xEF\xBB\xBF/', '', $raw) ?? $raw;

        try {
            /** @var mixed $decoded */
            $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new RuntimeException('Не удалось разобрать JSON parser-2gis: '.$exception->getMessage(), 0, $exception);
        }

        if (! is_array($decoded)) {
            return [];
        }

        /** @var list<array<string, mixed>> $items */
        $items = array_values(array_filter(
            $decoded,
            static fn (mixed $item): bool => is_array($item),
        ));

        return $items;
    }

    /**
     * @param  array<string, mixed>  $item
     * @return array<string, mixed>
     */
    private function mapItem(array $item): array
    {
        $externalId = $this->firmId((string) ($item['id'] ?? ''));
        $contacts = $this->contacts($item);
        $citySlug = (string) config('leads.parser2gis.city_slug', 'almaty');
        $domain = (string) config('leads.parser2gis.domain', 'kz');

        $name = trim((string) (
            data_get($item, 'name_ex.primary')
            ?: ($item['name'] ?? '')
        ));

        return [
            'external_id' => $externalId,
            'name' => $name,
            'category' => $this->firstRubric($item),
            'address' => $item['full_address_name'] ?? $item['address_name'] ?? null,
            'latitude' => data_get($item, 'point.lat'),
            'longitude' => data_get($item, 'point.lon'),
            'phone' => $contacts['phone'],
            'website' => $contacts['website'],
            'website_checked' => true,
            'social_links' => $contacts['social_links'],
            'source_url' => $externalId !== ''
                ? "https://2gis.{$domain}/{$citySlug}/firm/{$externalId}"
                : null,
        ];
    }

    /**
     * Catalog IDs look like "70000001095046199_434333…"; the firm page uses the prefix.
     */
    private function firmId(string $rawId): string
    {
        if ($rawId === '') {
            return '';
        }

        $parts = explode('_', $rawId, 2);

        return $parts[0];
    }

    /**
     * @param  array<string, mixed>  $item
     * @return array{phone: ?string, website: ?string, social_links: list<string>}
     */
    private function contacts(array $item): array
    {
        $phone = null;
        $website = null;
        $socialLinks = [];

        /** @var list<array<string, mixed>> $groups */
        $groups = $item['contact_groups'] ?? [];

        foreach ($groups as $group) {
            /** @var list<array<string, mixed>> $contacts */
            $contacts = $group['contacts'] ?? [];

            foreach ($contacts as $contact) {
                $type = strtolower((string) ($contact['type'] ?? ''));
                $value = trim((string) ($contact['value'] ?? $contact['url'] ?? $contact['text'] ?? ''));

                if ($value === '') {
                    continue;
                }

                if ($type === 'phone' && $phone === null) {
                    $phone = $value;
                    continue;
                }

                if (in_array($type, ['website', 'url'], true)) {
                    if ($this->looksSocial($value)) {
                        $socialLinks[] = $value;
                    } elseif ($website === null) {
                        $website = $value;
                    }

                    continue;
                }

                if (in_array($type, self::SOCIAL_TYPES, true)) {
                    $socialLinks[] = $value;
                }
            }
        }

        return [
            'phone' => $phone,
            'website' => $website,
            'social_links' => array_values(array_unique($socialLinks)),
        ];
    }

    private function looksSocial(string $value): bool
    {
        $host = strtolower((string) (parse_url(
            preg_match('#^https?://#i', $value) ? $value : 'https://'.$value,
            PHP_URL_HOST,
        ) ?? ''));

        $host = preg_replace('/^www\./', '', $host) ?? $host;

        foreach (['instagram.com', 'facebook.com', 'fb.com', 'vk.com', 't.me', 'telegram.me', 'wa.me', 'whatsapp.com', 'tiktok.com', 'youtube.com', 'youtu.be', 'twitter.com', 'x.com', 'linkedin.com', 'ok.ru'] as $social) {
            if ($host === $social || str_ends_with($host, '.'.$social)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function firstRubric(array $item): ?string
    {
        $name = data_get($item, 'rubrics.0.name');

        return is_string($name) && $name !== '' ? $name : null;
    }

    private function binary(): string
    {
        return trim((string) config('leads.parser2gis.binary', ''));
    }
}
