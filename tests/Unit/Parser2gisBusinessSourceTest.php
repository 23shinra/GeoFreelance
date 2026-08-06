<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Services\Sources\Parser2gisBusinessSource;
use Illuminate\Support\Facades\File;
use PHPUnit\Framework\Attributes\Test;
use ReflectionClass;
use Tests\TestCase;

final class Parser2gisBusinessSourceTest extends TestCase
{
    #[Test]
    public function it_maps_catalog_item_contacts_into_upsert_payload(): void
    {
        config()->set('leads.parser2gis.domain', 'kz');
        config()->set('leads.parser2gis.city_slug', 'almaty');

        $source = new Parser2gisBusinessSource;
        $method = (new ReflectionClass($source))->getMethod('mapItem');
        $method->setAccessible(true);

        /** @var array<string, mixed> $mapped */
        $mapped = $method->invoke($source, [
            'id' => '70000001095046199_hashsuffix',
            'name' => 'Hayat dental clinic, стоматологическая клиника',
            'name_ex' => [
                'primary' => 'Hayat dental clinic',
                'extension' => 'стоматологическая клиника',
            ],
            'address_name' => 'улица Казыбек би, 125/1',
            'point' => ['lat' => 43.255292, 'lon' => 76.923095],
            'rubrics' => [['name' => 'Частные стоматологии']],
            'contact_groups' => [[
                'contacts' => [
                    ['type' => 'phone', 'value' => '+77761412020'],
                    ['type' => 'whatsapp', 'value' => 'https://wa.me/77761412020'],
                    ['type' => 'website', 'value' => 'https://hayat.kz'],
                    ['type' => 'instagram', 'value' => 'https://instagram.com/hayat'],
                ],
            ]],
        ]);

        $this->assertSame('70000001095046199', $mapped['external_id']);
        $this->assertSame('Hayat dental clinic', $mapped['name']);
        $this->assertSame('Частные стоматологии', $mapped['category']);
        $this->assertSame('+77761412020', $mapped['phone']);
        $this->assertSame('https://hayat.kz', $mapped['website']);
        $this->assertTrue($mapped['website_checked']);
        $this->assertSame(
            'https://2gis.kz/almaty/firm/70000001095046199',
            $mapped['source_url'],
        );
        $this->assertContains('https://wa.me/77761412020', $mapped['social_links']);
        $this->assertContains('https://instagram.com/hayat', $mapped['social_links']);
    }

    #[Test]
    public function it_reads_utf8_bom_json_from_parser_output(): void
    {
        $path = storage_path('app/parser2gis-test-'.uniqid('', true).'.json');
        File::ensureDirectoryExists(dirname($path));
        file_put_contents(
            $path,
            "\xEF\xBB\xBF".json_encode([[
                'id' => '1',
                'name' => 'Test',
                'point' => ['lat' => 43.2, 'lon' => 76.9],
            ]], JSON_UNESCAPED_UNICODE),
        );

        $source = new Parser2gisBusinessSource;
        $method = (new ReflectionClass($source))->getMethod('readItems');
        $method->setAccessible(true);

        /** @var list<array<string, mixed>> $items */
        $items = $method->invoke($source, $path);

        @unlink($path);

        $this->assertCount(1, $items);
        $this->assertSame('Test', $items[0]['name']);
    }

    #[Test]
    public function it_reports_when_binary_is_missing(): void
    {
        config()->set('leads.parser2gis.binary', '/tmp/missing-parser-2gis-binary');

        $this->assertFalse((new Parser2gisBusinessSource)->isConfigured());
    }
}
