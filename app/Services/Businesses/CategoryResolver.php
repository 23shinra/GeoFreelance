<?php

declare(strict_types=1);

namespace App\Services\Businesses;

use App\Models\Category;
use Illuminate\Support\Str;

final readonly class CategoryResolver
{
    public function resolve(?string $name): ?Category
    {
        $name = trim((string) $name);

        if ($name === '') {
            return null;
        }

        $slug = Str::slug($name);

        if ($slug === '') {
            $slug = 'category-'.substr(hash('sha256', $name), 0, 8);
        }

        return Category::query()->firstOrCreate(
            ['slug' => $slug],
            ['name' => $name],
        );
    }
}
