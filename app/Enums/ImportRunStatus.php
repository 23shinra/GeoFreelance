<?php

declare(strict_types=1);

namespace App\Enums;

enum ImportRunStatus: string
{
    case Pending = 'pending';
    case Mapping = 'mapping';
    case Processing = 'processing';
    case Completed = 'completed';
    case Failed = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Ожидает',
            self::Mapping => 'Сопоставление колонок',
            self::Processing => 'Обработка',
            self::Completed => 'Завершён',
            self::Failed => 'Ошибка',
        };
    }
}
