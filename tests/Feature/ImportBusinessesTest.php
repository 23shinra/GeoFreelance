<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\BusinessStatus;
use App\Enums\ImportRunStatus;
use App\Models\Business;
use App\Models\ImportRun;
use App\Models\User;
use App\Services\Imports\ImportRunService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

final class ImportBusinessesTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function authenticated_user_can_upload_and_process_csv_import(): void
    {
        Storage::fake('local');

        $user = User::factory()->create();
        $csv = <<<'CSV'
external_id,name,category,address,latitude,longitude,phone,website,social_links
a1,No Site Cafe,Рестораны,"Алматы, Абая 1",43.24,76.94,+77011112233,,https://instagram.com/nosite
a2,Has Site Dent,Стоматология,"Алматы, Сатпаева 2",43.23,76.93,+77012223344,https://dent.kz,
CSV;

        $file = UploadedFile::fake()->createWithContent('leads.csv', $csv);

        $this->actingAs($user)
            ->post(route('imports.store'), ['file' => $file])
            ->assertRedirect();

        $import = ImportRun::query()->firstOrFail();
        $this->assertSame(ImportRunStatus::Mapping, $import->status);

        $this->actingAs($user)
            ->post(route('imports.map', $import), [
                'column_map' => [
                    'name' => 'name',
                    'category' => 'category',
                    'address' => 'address',
                    'latitude' => 'latitude',
                    'longitude' => 'longitude',
                    'phone' => 'phone',
                    'website' => 'website',
                    'social_links' => 'social_links',
                    'external_id' => 'external_id',
                ],
            ])
            ->assertRedirect(route('imports.show', $import));

        $import->refresh();
        $this->assertSame(ImportRunStatus::Completed, $import->status);
        $this->assertSame(2, $import->stats['total'] ?? null);
        $this->assertSame(1, $import->stats['leads'] ?? null);
        $this->assertSame(1, $import->stats['ignored_has_website'] ?? null);

        $lead = Business::query()->where('external_id', 'a1')->firstOrFail();
        $ignored = Business::query()->where('external_id', 'a2')->firstOrFail();

        $this->assertSame(BusinessStatus::Lead, $lead->status);
        $this->assertContains('https://instagram.com/nosite', $lead->social_links ?? []);
        $this->assertSame(BusinessStatus::IgnoredHasWebsite, $ignored->status);
        $this->assertSame('dent.kz', $ignored->website_domain);
    }

    #[Test]
    public function rescanning_keeps_ignored_businesses_out_of_leads(): void
    {
        Storage::fake('local');

        $user = User::factory()->create();
        $service = app(ImportRunService::class);

        $firstCsv = UploadedFile::fake()->createWithContent(
            'first.csv',
            "external_id,name,website,latitude,longitude\nx1,Clinic Site,https://clinic.kz,43.2,76.9\n",
        );

        $first = $service->createFromUpload($user, $firstCsv);
        $service->start($first, [
            'name' => 'name',
            'website' => 'website',
            'latitude' => 'latitude',
            'longitude' => 'longitude',
            'external_id' => 'external_id',
        ]);
        $service->process($first->fresh() ?? $first);

        $this->assertSame(1, Business::query()->ignored()->count());
        $this->assertSame(0, Business::query()->leads()->count());

        $secondCsv = UploadedFile::fake()->createWithContent(
            'second.csv',
            "external_id,name,website,latitude,longitude\nx1,Clinic Site,https://clinic.kz,43.2,76.9\n",
        );

        $second = $service->createFromUpload($user, $secondCsv);
        $service->start($second, [
            'name' => 'name',
            'website' => 'website',
            'latitude' => 'latitude',
            'longitude' => 'longitude',
            'external_id' => 'external_id',
        ]);
        $service->process($second->fresh() ?? $second);

        $this->assertSame(1, Business::query()->count());
        $this->assertSame(0, Business::query()->leads()->count());
        $this->assertSame(1, Business::query()->ignored()->count());
        $this->assertSame(1, $second->fresh()?->stats['ignored'] ?? null);
    }
}
