import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'solid' | 'glass' | 'quiet';

type Props = {
    children: ReactNode;
    icon?: ReactNode;
    variant?: Variant;
    className?: string;
    href?: NonNullable<InertiaLinkProps['href']>;
    type?: 'button' | 'submit';
    disabled?: boolean;
    onClick?: () => void;
};

const shells: Record<Variant, string> = {
    solid: 'bg-primary text-primary-foreground shadow-[0_24px_50px_-28px_var(--primary)] hover:shadow-[0_28px_60px_-26px_var(--primary)]',
    glass: 'bezel-shell text-foreground hover:bg-foreground/[0.06] dark:hover:bg-white/[0.07]',
    quiet: 'text-muted-foreground hover:text-foreground',
};

const nests: Record<Variant, string> = {
    solid: 'bg-primary-foreground/15',
    glass: 'bg-foreground/[0.06] dark:bg-white/10',
    quiet: 'bg-foreground/[0.05] dark:bg-white/10',
};

/**
 * Island CTA: fully rounded pill whose trailing glyph lives in its own nested
 * circle and drifts diagonally on hover for internal kinetic tension.
 */
export function IslandButton({
    children,
    icon,
    variant = 'solid',
    className,
    href,
    type = 'button',
    disabled = false,
    onClick,
}: Props) {
    const body = (
        <>
            <span className="truncate">{children}</span>
            {icon && (
                <span
                    className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full transition-transform duration-500 ease-fluid group-hover:translate-x-1 group-hover:-translate-y-px group-hover:scale-105',
                        nests[variant],
                    )}
                >
                    {icon}
                </span>
            )}
        </>
    );

    const classes = cn(
        'group inline-flex items-center justify-center gap-3 rounded-full text-sm font-medium transition-[transform,background-color,color,box-shadow] duration-500 ease-fluid active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40',
        icon ? 'py-1.5 pr-1.5 pl-6' : 'px-6 py-3',
        shells[variant],
        className,
    );

    if (href && !disabled) {
        return (
            <Link href={href} className={classes}>
                {body}
            </Link>
        );
    }

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={classes}
        >
            {body}
        </button>
    );
}
