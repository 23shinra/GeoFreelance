<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ImportRunStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $original_filename
 * @property string $stored_path
 * @property ImportRunStatus $status
 * @property array<string, string>|null $column_map
 * @property array<int, string>|null $headers
 * @property array<int, array<string, mixed>>|null $preview_rows
 * @property array<string, int>|null $stats
 * @property string|null $error_message
 * @property Carbon|null $started_at
 * @property Carbon|null $finished_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
final class ImportRun extends Model
{
    /** @use HasFactory<\Database\Factories\ImportRunFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'original_filename',
        'stored_path',
        'status',
        'column_map',
        'headers',
        'preview_rows',
        'stats',
        'error_message',
        'started_at',
        'finished_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => ImportRunStatus::class,
            'column_map' => 'array',
            'headers' => 'array',
            'preview_rows' => 'array',
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

    /**
     * @return HasMany<ImportRow, $this>
     */
    public function rows(): HasMany
    {
        return $this->hasMany(ImportRow::class);
    }
}
