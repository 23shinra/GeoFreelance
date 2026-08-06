<?php

declare(strict_types=1);

namespace App\Enums;

enum OutreachAttemptStatus: string
{
    case Pending = 'pending';
    case Queued = 'queued';
    case Sent = 'sent';
    case Failed = 'failed';
    case Replied = 'replied';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Ожидает',
            self::Queued => 'В очереди',
            self::Sent => 'Отправлено',
            self::Failed => 'Ошибка',
            self::Replied => 'Есть ответ',
        };
    }
}
