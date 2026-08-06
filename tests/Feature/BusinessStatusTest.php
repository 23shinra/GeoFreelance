<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\BusinessStatus;
use App\Models\Business;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

final class BusinessStatusTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function user_can_manually_ignore_and_restore_lead(): void
    {
        $user = User::factory()->create();
        $business = Business::factory()->create([
            'status' => BusinessStatus::Lead,
            'website' => null,
            'website_domain' => null,
        ]);

        $this->actingAs($user)
            ->patch(route('businesses.status', $business), [
                'action' => 'ignore',
                'reason' => 'Не целевой',
            ])
            ->assertRedirect();

        $business->refresh();
        $this->assertSame(BusinessStatus::IgnoredManual, $business->status);

        $this->actingAs($user)
            ->patch(route('businesses.status', $business), [
                'action' => 'restore',
            ])
            ->assertRedirect();

        $business->refresh();
        $this->assertSame(BusinessStatus::Lead, $business->status);
    }

    #[Test]
    public function restore_keeps_website_businesses_ignored(): void
    {
        $user = User::factory()->create();
        $business = Business::factory()->withWebsite()->create();

        $this->actingAs($user)
            ->patch(route('businesses.status', $business), [
                'action' => 'restore',
            ])
            ->assertRedirect();

        $business->refresh();
        $this->assertSame(BusinessStatus::IgnoredHasWebsite, $business->status);
    }
}
