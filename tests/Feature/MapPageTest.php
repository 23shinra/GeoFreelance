<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\BusinessStatus;
use App\Models\Business;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

final class MapPageTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function map_page_shows_only_mappable_leads_by_default(): void
    {
        $this->withoutVite();

        $user = User::factory()->create();

        Business::factory()->create([
            'name' => 'Visible Lead',
            'status' => BusinessStatus::Lead,
            'latitude' => 43.24,
            'longitude' => 76.94,
        ]);

        Business::factory()->withWebsite()->create([
            'name' => 'Hidden Website',
            'latitude' => 43.25,
            'longitude' => 76.95,
        ]);

        Business::factory()->create([
            'name' => 'No Coords',
            'status' => BusinessStatus::NeedsCoordinates,
            'latitude' => null,
            'longitude' => null,
        ]);

        $this->actingAs($user)
            ->get(route('map'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('map/index')
                ->has('businesses', 1)
                ->where('businesses.0.name', 'Visible Lead'));
    }

    #[Test]
    public function map_payload_exposes_whatsapp_links_for_businesses_with_a_phone(): void
    {
        $this->withoutVite();

        $user = User::factory()->create();

        Business::factory()->create([
            'name' => 'With Phone',
            'status' => BusinessStatus::Lead,
            'latitude' => 43.24,
            'longitude' => 76.94,
            'phone' => '+7 701 000 00 00',
            'phone_normalized' => '+77010000000',
        ]);

        Business::factory()->create([
            'name' => 'Without Phone',
            'status' => BusinessStatus::Lead,
            'latitude' => 43.25,
            'longitude' => 76.95,
            'phone' => null,
            'phone_normalized' => null,
        ]);

        $this->actingAs($user)
            ->get(route('map', ['search' => 'Phone']))
            ->assertOk()
            ->assertInertia(function (Assert $page): void {
                $businesses = collect($page->toArray()['props']['businesses'])
                    ->keyBy('name');

                $this->assertStringStartsWith(
                    'https://wa.me/77010000000',
                    $businesses['With Phone']['whatsapp_url'],
                );
                $this->assertNull($businesses['Without Phone']['whatsapp_url']);
            });
    }
}
