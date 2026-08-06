<?php

declare(strict_types=1);

namespace App\Enums;

enum BusinessStatus: string
{
    case Lead = 'lead';
    case IgnoredHasWebsite = 'ignored_has_website';
    case IgnoredManual = 'ignored_manual';
    case NeedsCoordinates = 'needs_coordinates';
    case NeedsWebsiteCheck = 'needs_website_check';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Lead => 'Лид',
            self::IgnoredHasWebsite => 'Игнор: есть сайт',
            self::IgnoredManual => 'Игнор: вручную',
            self::NeedsCoordinates => 'Нет координат',
            self::NeedsWebsiteCheck => 'Нужна проверка сайта',
            self::Archived => 'Архив',
        };
    }

    public function isIgnored(): bool
    {
        return match ($this) {
            self::IgnoredHasWebsite, self::IgnoredManual, self::Archived => true,
            default => false,
        };
    }
}
