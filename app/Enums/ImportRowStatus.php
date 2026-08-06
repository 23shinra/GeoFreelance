<?php

declare(strict_types=1);

namespace App\Enums;

enum ImportRowStatus: string
{
    case Pending = 'pending';
    case Created = 'created';
    case Updated = 'updated';
    case Duplicate = 'duplicate';
    case Ignored = 'ignored';
    case Error = 'error';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Ожидает',
            self::Created => 'Создан',
            self::Updated => 'Обновлён',
            self::Duplicate => 'Дубликат',
            self::Ignored => 'Игнорирован',
            self::Error => 'Ошибка',
        };
    }
}
