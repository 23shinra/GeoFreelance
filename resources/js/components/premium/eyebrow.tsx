import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    children: ReactNode;
    className?: string;
    tone?: 'muted' | 'primary' | 'warn';
};

const tones: Record<NonNullable<Props['tone']>, string> = {
    muted: 'text-muted-foreground',
    primary: 'text-primary',
    warn: 'text-amber-600 dark:text-amber-300',
};

export function Eyebrow({ children, className, tone = 'muted' }: Props) {
    return (
        <span
            className={cn(
                'hairline inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.02] px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase dark:bg-white/[0.03]',
                tones[tone],
                className,
            )}
        >
            {children}
        </span>
    );
}
