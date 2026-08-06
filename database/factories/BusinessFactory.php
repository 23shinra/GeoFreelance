<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\BusinessStatus;
use App\Models\Business;
use App\Models\Category;
use App\Services\Businesses\BusinessFingerprint;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Business>
 */
final class BusinessFactory extends Factory
{
    protected $model = Business::class;

    public function definition(): array
    {
        $name = fake()->company();
        $address = fake()->streetAddress().', Алматы';

        return [
            'category_id' => Category::factory(),
            'external_id' => fake()->unique()->uuid(),
            'name' => $name,
            'address' => $address,
            'city' => 'Алматы',
            'latitude' => fake()->latitude(43.1, 43.4),
            'longitude' => fake()->longitude(76.7, 77.2),
            'website' => null,
            'website_domain' => null,
            'phone' => '+7701'.fake()->numerify('#######'),
            'phone_normalized' => '+7701'.fake()->numerify('#######'),
            'social_links' => [],
            'status' => BusinessStatus::Lead,
            'fingerprint' => (new BusinessFingerprint)->make($name, $address),
            'source' => 'csv_import',
            'source_url' => null,
            'last_checked_at' => now(),
            'ignored_at' => null,
            'ignore_reason' => null,
        ];
    }

    public function withWebsite(string $website = 'https://example.kz'): static
    {
        $host = parse_url($website, PHP_URL_HOST) ?: 'example.kz';

        return $this->state(fn (): array => [
            'website' => $website,
            'website_domain' => $host,
            'status' => BusinessStatus::IgnoredHasWebsite,
            'ignored_at' => now(),
            'ignore_reason' => 'У бизнеса уже есть сайт.',
        ]);
    }
}
