<?php

declare(strict_types=1);

namespace App\Services\Imports;

use App\Enums\BusinessStatus;
use App\Enums\ImportRowStatus;
use App\Models\Business;
use App\Services\Businesses\BusinessFingerprint;
use App\Services\Businesses\CategoryResolver;
use App\Services\Businesses\PhoneNormalizer;
use App\Services\Businesses\WebsiteNormalizer;
use Illuminate\Support\Carbon;

final readonly class BusinessUpsertService
{
    public function __construct(
        private WebsiteNormalizer $websiteNormalizer,
        private PhoneNormalizer $phoneNormalizer,
        private BusinessFingerprint $fingerprint,
        private CategoryResolver $categoryResolver,
    ) {}

    /**
     * @param  array<string, string>  $columnMap
     * @param  array<string, mixed>  $rawRow
     * @return array{status: ImportRowStatus, business: ?Business, message: string}
     */
    public function upsert(array $columnMap, array $rawRow): array
    {
        $payload = $this->mapRow($columnMap, $rawRow);
        return $this->upsertPayload($payload);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{status: ImportRowStatus, business: ?Business, message: string}
     */
    public function upsertPayload(array $payload, string $source = 'csv_import'): array
    {
        $name = trim((string) ($payload['name'] ?? ''));

        if ($name === '') {
            return [
                'status' => ImportRowStatus::Error,
                'business' => null,
                'message' => 'Отсутствует название бизнеса.',
            ];
        }

        $websiteValue = trim((string) ($payload['website'] ?? ''));
        $website = $this->websiteNormalizer->normalize($websiteValue !== '' ? $websiteValue : null);
        $socialLinks = $this->extractSocialLinks($payload['social_links'] ?? null, $websiteValue !== '' && $website['is_social'] ? $websiteValue : null);
        $phone = $this->phoneNormalizer->normalize(isset($payload['phone']) ? (string) $payload['phone'] : null);
        $fingerprint = $this->fingerprint->make($name, isset($payload['address']) ? (string) $payload['address'] : null);
        $category = $this->categoryResolver->resolve(isset($payload['category']) ? (string) $payload['category'] : null);

        $latitude = $this->toCoordinate($payload['latitude'] ?? null);
        $longitude = $this->toCoordinate($payload['longitude'] ?? null);
        $externalId = filled($payload['external_id'] ?? null) ? (string) $payload['external_id'] : null;

        $existing = $this->findExisting($externalId, $website['domain'], $phone, $fingerprint, $source);

        $finalWebsite = $website['domain'] !== null
            ? $website['website']
            : $existing?->website;
        $finalDomain = $website['domain'] ?? $existing?->website_domain;
        $hasWebsite = filled($finalDomain);
        $websiteChecked = (bool) ($payload['website_checked'] ?? true);
        $status = $this->resolveStatus(
            $existing,
            $hasWebsite,
            $websiteChecked,
            $latitude,
            $longitude,
        );

        $attributes = [
            'category_id' => $category?->id,
            'external_id' => $externalId ?? $existing?->external_id,
            'name' => $name,
            'address' => filled($payload['address'] ?? null) ? (string) $payload['address'] : $existing?->address,
            'city' => 'Алматы',
            'latitude' => $latitude ?? $existing?->latitude,
            'longitude' => $longitude ?? $existing?->longitude,
            'website' => $finalWebsite,
            'website_domain' => $finalDomain,
            'phone' => filled($payload['phone'] ?? null) ? (string) $payload['phone'] : $existing?->phone,
            'phone_normalized' => $phone ?? $existing?->phone_normalized,
            'social_links' => $this->mergeSocialLinks($existing?->social_links, $socialLinks),
            'status' => $status,
            'fingerprint' => $fingerprint,
            'source' => $source,
            'source_url' => filled($payload['source_url'] ?? null) ? (string) $payload['source_url'] : $existing?->source_url,
            'last_checked_at' => Carbon::now(),
            'ignored_at' => $status->isIgnored() ? ($existing?->ignored_at ?? Carbon::now()) : null,
            'ignore_reason' => match ($status) {
                BusinessStatus::IgnoredHasWebsite => 'У бизнеса уже есть сайт.',
                BusinessStatus::IgnoredManual => $existing?->ignore_reason,
                default => null,
            },
        ];

        if ($existing instanceof Business) {
            if ($existing->status->isIgnored() && $existing->status !== BusinessStatus::IgnoredHasWebsite && ! $hasWebsite) {
                // Keep manual ignore across rescans unless a website forces ignore.
                $attributes['status'] = $existing->status;
                $attributes['ignored_at'] = $existing->ignored_at;
                $attributes['ignore_reason'] = $existing->ignore_reason;
            }

            $existing->fill($attributes)->save();

            return [
                'status' => $attributes['status']->isIgnored()
                    ? ImportRowStatus::Ignored
                    : ImportRowStatus::Updated,
                'business' => $existing->fresh(),
                'message' => $attributes['status']->isIgnored()
                    ? 'Обновлён и оставлен в ignore-листе.'
                    : 'Бизнес обновлён.',
            ];
        }

        $business = Business::query()->create($attributes);

        return [
            'status' => $business->status->isIgnored()
                ? ImportRowStatus::Ignored
                : ImportRowStatus::Created,
            'business' => $business,
            'message' => $business->status === BusinessStatus::IgnoredHasWebsite
                ? 'Создан и сразу отправлен в ignore-лист из-за сайта.'
                : 'Бизнес создан.',
        ];
    }

    /**
     * @param  array<string, string>  $columnMap
     * @param  array<string, mixed>  $rawRow
     * @return array<string, mixed>
     */
    private function mapRow(array $columnMap, array $rawRow): array
    {
        $mapped = [];

        foreach ($columnMap as $field => $header) {
            $mapped[$field] = $rawRow[$header] ?? null;
        }

        return $mapped;
    }

    private function findExisting(
        ?string $externalId,
        ?string $domain,
        ?string $phone,
        string $fingerprint,
        string $source,
    ): ?Business {
        if ($externalId !== null) {
            $byExternal = Business::query()
                ->where('source', $source)
                ->where('external_id', $externalId)
                ->first();

            if ($byExternal instanceof Business) {
                return $byExternal;
            }
        }

        if ($domain !== null) {
            $byDomain = Business::query()->where('website_domain', $domain)->first();

            if ($byDomain instanceof Business) {
                return $byDomain;
            }
        }

        if ($phone !== null) {
            $byPhone = Business::query()->where('phone_normalized', $phone)->first();

            if ($byPhone instanceof Business) {
                return $byPhone;
            }
        }

        return Business::query()->where('fingerprint', $fingerprint)->first();
    }

    private function resolveStatus(
        ?Business $existing,
        bool $hasWebsite,
        bool $websiteChecked,
        ?float $latitude,
        ?float $longitude,
    ): BusinessStatus {
        if ($existing?->status === BusinessStatus::IgnoredManual && ! $hasWebsite) {
            return BusinessStatus::IgnoredManual;
        }

        if ($hasWebsite) {
            return BusinessStatus::IgnoredHasWebsite;
        }

        if (! $websiteChecked) {
            return BusinessStatus::NeedsWebsiteCheck;
        }

        $lat = $latitude ?? ($existing?->latitude !== null ? (float) $existing->latitude : null);
        $lng = $longitude ?? ($existing?->longitude !== null ? (float) $existing->longitude : null);

        if ($lat === null || $lng === null) {
            return BusinessStatus::NeedsCoordinates;
        }

        return BusinessStatus::Lead;
    }

    private function toCoordinate(mixed $value): ?float
    {
        if ($value === null || trim((string) $value) === '') {
            return null;
        }

        if (! is_numeric($value)) {
            return null;
        }

        return round((float) $value, 7);
    }

    /**
     * @return list<string>
     */
    private function extractSocialLinks(mixed $socialField, ?string $websiteAsSocial): array
    {
        $links = [];

        if (is_string($socialField) && trim($socialField) !== '') {
            foreach (preg_split('/[,\s;|]+/', $socialField) ?: [] as $part) {
                $part = trim($part);

                if ($part !== '') {
                    $links[] = $part;
                }
            }
        }

        if ($websiteAsSocial !== null) {
            $links[] = $websiteAsSocial;
        }

        return array_values(array_unique($links));
    }

    /**
     * @param  list<string>|null  $existing
     * @param  list<string>  $incoming
     * @return list<string>
     */
    private function mergeSocialLinks(?array $existing, array $incoming): array
    {
        return array_values(array_unique(array_filter([
            ...($existing ?? []),
            ...$incoming,
        ])));
    }
}
