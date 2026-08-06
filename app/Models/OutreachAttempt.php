<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\OutreachAttemptStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $business_id
 * @property int|null $user_id
 * @property string $channel
 * @property OutreachAttemptStatus $status
 * @property array<string, mixed>|null $payload
 * @property array<string, mixed>|null $provider_response
 * @property Carbon|null $attempted_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
final class OutreachAttempt extends Model
{
    /** @use HasFactory<\Database\Factories\OutreachAttemptFactory> */
    use HasFactory;

    protected $fillable = [
        'business_id',
        'user_id',
        'channel',
        'status',
        'payload',
        'provider_response',
        'attempted_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => OutreachAttemptStatus::class,
            'payload' => 'array',
            'provider_response' => 'array',
            'attempted_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Business, $this>
     */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
