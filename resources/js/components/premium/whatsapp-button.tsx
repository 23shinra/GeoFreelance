import { cn } from '@/lib/utils';

function WhatsappGlyph({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden
            className={cn('size-4', className)}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 21a9 9 0 1 0-7.79-4.5L3 21l4.6-1.16A8.96 8.96 0 0 0 12 21Z" />
            <path d="M9.2 8.4c-.3.7-.2 1.7.6 2.9.9 1.3 2 2.2 3.3 2.7.9.3 1.6.2 2-.2l.5-.6-1.8-1.2-.8.6c-.7-.3-1.4-.9-2-1.7l.5-.9-1.1-1.8-.6.1c-.3.05-.5.15-.6.3Z" />
        </svg>
    );
}

type Props = {
    url: string | null | undefined;
    fallbackUrl?: string | null;
    className?: string;
    compact?: boolean;
};

export function WhatsappButton({
    url,
    fallbackUrl,
    className,
    compact = false,
}: Props) {
    const base =
        'group inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[transform,background-color,color,box-shadow] duration-500 ease-fluid active:scale-[0.98]';

    if (!url) {
        if (fallbackUrl) {
            return (
                <a
                    href={fallbackUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Телефон скрыт 2GIS — откройте карточку и добавьте номер"
                    className={cn(
                        base,
                        'hairline text-muted-foreground hover:text-foreground',
                        compact ? 'size-9' : 'px-5 py-2.5 text-xs',
                        className,
                    )}
                >
                    <WhatsappGlyph />
                    {!compact && 'Нет номера'}
                </a>
            );
        }

        return (
            <span
                title="Телефон неизвестен"
                className={cn(
                    base,
                    'hairline text-muted-foreground/50',
                    compact ? 'size-9' : 'px-5 py-2.5 text-xs',
                    className,
                )}
            >
                <WhatsappGlyph />
                {!compact && 'Нет номера'}
            </span>
        );
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noreferrer"
            title="Написать в WhatsApp"
            className={cn(
                base,
                'bg-[#25d366] text-[#052e16] shadow-[0_22px_45px_-26px_#25d366] hover:shadow-[0_26px_55px_-24px_#25d366]',
                compact ? 'size-9' : 'px-5 py-2.5 text-xs',
                className,
            )}
        >
            <WhatsappGlyph className="transition-transform duration-500 ease-fluid group-hover:scale-110" />
            {!compact && 'WhatsApp'}
        </a>
    );
}
