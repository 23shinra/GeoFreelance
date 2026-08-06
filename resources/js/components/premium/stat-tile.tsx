import type { ReactNode } from 'react';
import { Bezel } from '@/components/premium/bezel';
import { cn } from '@/lib/utils';

type Tone = 'primary' | 'amber' | 'violet' | 'sky' | 'rose' | 'neutral';

type Props = {
    label: string;
    value: ReactNode;
    hint?: string;
    tone?: Tone;
    className?: string;
};

const valueTones: Record<Tone, string> = {
    primary: 'text-primary',
    amber: 'text-amber-600 dark:text-amber-300',
    violet: 'text-violet-600 dark:text-violet-300',
    sky: 'text-sky-600 dark:text-sky-300',
    rose: 'text-rose-600 dark:text-rose-300',
    neutral: 'text-foreground',
};

const glowTones: Record<Tone, string> = {
    primary: 'bg-primary/20',
    amber: 'bg-amber-400/20',
    violet: 'bg-violet-400/20',
    sky: 'bg-sky-400/20',
    rose: 'bg-rose-400/20',
    neutral: 'bg-foreground/10',
};

export function StatTile({
    label,
    value,
    hint,
    tone = 'neutral',
    className,
}: Props) {
    return (
        <Bezel
            className={cn(
                'group transition-transform duration-700 ease-fluid hover:-translate-y-1',
                className,
            )}
        >
            <div className="relative flex h-full flex-col justify-between gap-8 p-6">
                <span
                    aria-hidden
                    className={cn(
                        'absolute -top-16 -right-12 size-32 rounded-full opacity-0 blur-3xl transition-opacity duration-700 ease-fluid group-hover:opacity-100',
                        glowTones[tone],
                    )}
                />
                <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                    {label}
                </p>
                <div>
                    <p
                        className={cn(
                            'font-mono text-4xl leading-none font-medium tabular-nums',
                            valueTones[tone],
                        )}
                    >
                        {value}
                    </p>
                    {hint && (
                        <p className="mt-2 text-xs text-muted-foreground">
                            {hint}
                        </p>
                    )}
                </div>
            </div>
        </Bezel>
    );
}
