<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\BusinessStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $category_id
 * @property string|null $external_id
 * @property string $name
 * @property string|null $address
 * @property string $city
 * @property string|null $latitude
 * @property string|null $longitude
 * @property string|null $website
 * @property string|null $website_domain
 * @property string|null $phone
 * @property string|null $phone_normalized
 * @property array<int, string>|null $social_links
 * @property BusinessStatus $status
 * @property string|null $fingerprint
 * @property string $source
 * @property string|null $source_url
 * @property Carbon|null $last_checked_at
 * @property Carbon|null $ignored_at
 * @property string|null $ignore_reason
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
final class Business extends Model
{
    /** @use HasFactory<\Database\Factories\BusinessFactory> */
    use HasFactory;

    protected $fillable = [
        'category_id',
        'external_id',
        'name',
        'address',
        'city',
        'latitude',
        'longitude',
        'website',
        'website_domain',
        'phone',
        'phone_normalized',
        'social_links',
        'status',
        'fingerprint',
        'source',
        'source_url',
        'last_checked_at',
        'ignored_at',
        'ignore_reason',
    ];

    protected function casts(): array
    {
        return [
            'status' => BusinessStatus::class,
            'social_links' => 'array',
            'last_checked_at' => 'datetime',
            'ignored_at' => 'datetime',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return HasMany<ImportRow, $this>
     */
    public function importRows(): HasMany
    {
        return $this->hasMany(ImportRow::class);
    }

    /**
     * @return HasMany<OutreachAttempt, $this>
     */
    public function outreachAttempts(): HasMany
    {
        return $this->hasMany(OutreachAttempt::class);
    }

    /**
     * @param  Builder<Business>  $query
     * @return Builder<Business>
     */
    public function scopeLeads(Builder $query): Builder
    {
        return $query->where('status', BusinessStatus::Lead);
    }

    /**
     * @param  Builder<Business>  $query
     * @return Builder<Business>
     */
    public function scopeIgnored(Builder $query): Builder
    {
        return $query->whereIn('status', [
            BusinessStatus::IgnoredHasWebsite,
            BusinessStatus::IgnoredManual,
        ]);
    }

    /**
     * @param  Builder<Business>  $query
     * @return Builder<Business>
     */
    public function scopeMappable(Builder $query): Builder
    {
        return $query
            ->whereNotNull('latitude')
            ->whereNotNull('longitude');
    }

    public function hasWebsite(): bool
    {
        return filled($this->website_domain);
    }
}
