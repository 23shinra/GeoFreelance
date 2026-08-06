<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Services\Businesses\WebsiteNormalizer;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

final class WebsiteNormalizerTest extends TestCase
{
    #[Test]
    public function it_normalizes_regular_websites(): void
    {
        $normalizer = new WebsiteNormalizer;

        $result = $normalizer->normalize('Example.KZ/path');

        $this->assertSame('https://example.kz/path', $result['website']);
        $this->assertSame('example.kz', $result['domain']);
        $this->assertFalse($result['is_social']);
    }

    #[Test]
    public function it_detects_social_networks_as_non_websites(): void
    {
        $normalizer = new WebsiteNormalizer;

        $result = $normalizer->normalize('https://instagram.com/shop');

        $this->assertNull($result['website']);
        $this->assertNull($result['domain']);
        $this->assertTrue($result['is_social']);
    }
}
