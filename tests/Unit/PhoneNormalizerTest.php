<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Services\Businesses\PhoneNormalizer;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

final class PhoneNormalizerTest extends TestCase
{
    #[Test]
    public function it_normalizes_kazakh_local_numbers(): void
    {
        $normalizer = new PhoneNormalizer;

        $this->assertSame('+77011234567', $normalizer->normalize('8 (701) 123-45-67'));
        $this->assertSame('+77011234567', $normalizer->normalize('7011234567'));
    }
}
