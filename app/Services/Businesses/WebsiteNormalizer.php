<?php

declare(strict_types=1);

namespace App\Services\Businesses;

final readonly class WebsiteNormalizer
{
    /**
     * Domains that represent social networks and should not count as a website.
     *
     * @var list<string>
     */
    private const SOCIAL_DOMAINS = [
        'instagram.com',
        'www.instagram.com',
        'facebook.com',
        'www.facebook.com',
        'fb.com',
        'www.fb.com',
        'vk.com',
        'www.vk.com',
        't.me',
        'telegram.me',
        'wa.me',
        'api.whatsapp.com',
        'tiktok.com',
        'www.tiktok.com',
        'youtube.com',
        'www.youtube.com',
        'youtu.be',
        'linkedin.com',
        'www.linkedin.com',
        'x.com',
        'twitter.com',
        'www.twitter.com',
        'ok.ru',
        'www.ok.ru',
    ];

    /**
     * @return array{website: ?string, domain: ?string, is_social: bool}
     */
    public function normalize(?string $value): array
    {
        $raw = trim((string) $value);

        if ($raw === '') {
            return [
                'website' => null,
                'domain' => null,
                'is_social' => false,
            ];
        }

        if (! preg_match('#^https?://#i', $raw)) {
            $raw = 'https://'.$raw;
        }

        $parts = parse_url($raw);

        if (! is_array($parts) || empty($parts['host'])) {
            return [
                'website' => null,
                'domain' => null,
                'is_social' => false,
            ];
        }

        $host = strtolower($parts['host']);
        $host = preg_replace('/^www\./', '', $host) ?? $host;
        $isSocial = $this->isSocialHost($host);

        $scheme = $parts['scheme'] ?? 'https';
        $path = $parts['path'] ?? '';
        $query = isset($parts['query']) ? '?'.$parts['query'] : '';
        $normalizedUrl = $scheme.'://'.$host.$path.$query;

        return [
            'website' => $isSocial ? null : rtrim($normalizedUrl, '/'),
            'domain' => $isSocial ? null : $host,
            'is_social' => $isSocial,
        ];
    }

    public function isSocialUrl(?string $value): bool
    {
        return $this->normalize($value)['is_social'];
    }

    private function isSocialHost(string $host): bool
    {
        foreach (self::SOCIAL_DOMAINS as $socialDomain) {
            $normalized = preg_replace('/^www\./', '', $socialDomain) ?? $socialDomain;

            if ($host === $normalized || str_ends_with($host, '.'.$normalized)) {
                return true;
            }
        }

        return false;
    }
}
