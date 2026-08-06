<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Contracts\BusinessSource;
use App\Enums\BusinessStatus;
use App\Enums\ImportRunStatus;
use App\Models\Business;
use App\Models\ScanRun;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

final class ScanBusinessesTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function user_can_scan_categories_and_persist_results(): void
    {
        $this->app->bind(BusinessSource::class, fn (): BusinessSource => new class implements BusinessSource
        {
            public function name(): string
            {
                return 'parser2gis';
            }

            public function search(array $filters = []): iterable
            {
                yield [
                    'external_id' => '2gis-1',
                    'name' => 'Restaurant With Site',
                    'category' => $filters['category'] ?? null,
                    'address' => 'Алматы, Абая 1',
                    'latitude' => 43.2,
                    'longitude' => 76.9,
                    'phone' => '+77011112233',
                    'website' => 'https://restaurant.kz',
                    'website_checked' => true,
                ];

                yield [
                    'external_id' => '2gis-2',
                    'name' => 'Lead Without Site',
                    'category' => $filters['category'] ?? null,
                    'address' => 'Алматы, Абая 2',
                    'latitude' => 43.21,
                    'longitude' => 76.91,
                    'phone' => '+77012223344',
                    'website_checked' => true,
                ];
            }
        });

        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('scans.store'), [
                'queries' => ['рестораны'],
            ])
            ->assertRedirect(route('scans.index'));

        $scan = ScanRun::query()->firstOrFail();

        $this->assertSame(ImportRunStatus::Completed, $scan->status);
        $this->assertSame(2, $scan->stats['checked']);
        $this->assertSame(1, $scan->stats['ignored_has_website']);
        $this->assertSame(1, $scan->stats['leads']);
        $this->assertSame(
            BusinessStatus::IgnoredHasWebsite,
            Business::query()->where('external_id', '2gis-1')->firstOrFail()->status,
        );
        $this->assertSame(
            BusinessStatus::Lead,
            Business::query()->where('external_id', '2gis-2')->firstOrFail()->status,
        );
        $this->assertSame(
            '+77012223344',
            Business::query()->where('external_id', '2gis-2')->firstOrFail()->phone_normalized,
        );
    }
}
