<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Services\Businesses\PhoneNormalizer;
use App\Services\Businesses\WhatsappLinkBuilder;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

final class WhatsappLinkBuilderTest extends TestCase
{
    private function builder(): WhatsappLinkBuilder
    {
        return new WhatsappLinkBuilder(new PhoneNormalizer);
    }

    #[Test]
    public function it_builds_wa_me_link_with_prefilled_message(): void
    {
        config()->set('leads.whatsapp.message_template', 'Привет, :name!');

        $url = $this->builder()->build('+7 (701) 000-00-00', 'Стоматология Люкс');

        $this->assertNotNull($url);
        $this->assertStringStartsWith('https://wa.me/77010000000?text=', $url);
        $this->assertStringContainsString(
            rawurlencode('Привет, Стоматология Люкс!'),
            $url,
        );
    }

    #[Test]
    public function it_normalizes_local_formats_before_building_the_link(): void
    {
        config()->set('leads.whatsapp.message_template', '');

        $this->assertSame(
            'https://wa.me/77010000000',
            $this->builder()->build('8 701 000 00 00', 'Тест'),
        );
        $this->assertSame(
            'https://wa.me/77010000000',
            $this->builder()->build('701 000 00 00', 'Тест'),
        );
    }

    #[Test]
    public function it_returns_null_when_phone_is_missing_or_invalid(): void
    {
        $builder = $this->builder();

        $this->assertNull($builder->build(null, 'Тест'));
        $this->assertNull($builder->build('', 'Тест'));
        $this->assertNull($builder->build('12-34', 'Тест'));
    }
}
