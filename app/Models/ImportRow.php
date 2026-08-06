<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ImportRowStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $import_run_id
 * @property int|null $business_id
 * @property int $row_number
 * @property array<string, mixed> $raw_data
 * @property ImportRowStatus $status
 * @property string|null $message
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
final class ImportRow extends Model
{
    /** @use HasFactory<\Database\Factories\ImportRowFactory> */
    use HasFactory;

    protected $fillable = [
        'import_run_id',
        'business_id',
        'row_number',
        'raw_data',
        'status',
        'message',
    ];

    protected function casts(): array
    {
        return [
            'raw_data' => 'array',
            'status' => ImportRowStatus::class,
        ];
    }

    /**
     * @return BelongsTo<ImportRun, $this>
     */
    public function importRun(): BelongsTo
    {
        return $this->belongsTo(ImportRun::class);
    }

    /**
     * @return BelongsTo<Business, $this>
     */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }
}
