import type { ReactNode } from 'react';
import { Eyebrow } from '@/components/premium/eyebrow';
import { Reveal } from '@/components/premium/reveal';
import { cn } from '@/lib/utils';

type Props = {
    eyebrow: string;
    title: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
};

export function PageHeader({
    eyebrow,
    title,
    description,
    actions,
    className,
}: Props) {
    return (
        <Reveal
            className={cn(
                'flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between',
                className,
            )}
        >
            <div className="max-w-2xl">
                <Eyebrow>{eyebrow}</Eyebrow>
                <h1 className="text-balance-tight mt-5 text-4xl leading-[0.95] font-semibold tracking-[-0.03em] md:text-5xl">
                    {title}
                </h1>
                {description && (
                    <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex flex-wrap items-center gap-3">
                    {actions}
                </div>
            )}
        </Reveal>
    );
}
