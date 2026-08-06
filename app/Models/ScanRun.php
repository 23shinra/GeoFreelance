<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ImportRunStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $source
 * @property string $city
 * @property list<string> $queries
 * @property ImportRunStatus $status
 * @property array<string, int>|null $stats
 * @property string|null $error_message
 * @property Carbon|null $started_at
 * @property Carbon|null $finished_at
 */
final class ScanRun extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'source',
        'city',
        'queries',
        'status',
        'stats',
        'error_message',
        'started_at',
        'finished_at',
    ];

    protected function casts(): array
    {
        return [
            'queries' => 'array',
            'status' => ImportRunStatus::class,
            'stats' => 'array',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
