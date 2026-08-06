<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ImportRunStatus;
use App\Models\ImportRun;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ImportRun>
 */
final class ImportRunFactory extends Factory
{
    protected $model = ImportRun::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'original_filename' => 'businesses.csv',
            'stored_path' => 'imports/test/businesses.csv',
            'status' => ImportRunStatus::Mapping,
            'headers' => ['name', 'website', 'phone'],
            'preview_rows' => [],
            'column_map' => ['name' => 'name'],
            'stats' => null,
            'error_message' => null,
            'started_at' => null,
            'finished_at' => null,
        ];
    }
}
