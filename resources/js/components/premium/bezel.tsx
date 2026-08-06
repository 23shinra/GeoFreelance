import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BezelProps = Omit<ComponentProps<'div'>, 'children'> & {
    children: ReactNode;
    innerClassName?: string;
};

/**
 * Double-bezel enclosure: an outer machined shell holding a distinct inner core
 * with concentric radii, so panels read as hardware instead of flat divs.
 */
export function Bezel({
    children,
    className,
    innerClassName,
    ...props
}: BezelProps) {
    return (
        <div
            {...props}
            className={cn('bezel-shell rounded-[2rem] p-1.5', className)}
        >
            <div
                className={cn(
                    'bezel-core relative h-full overflow-hidden rounded-[calc(2rem-0.375rem)] bg-card/85',
                    innerClassName,
                )}
            >
                {children}
            </div>
        </div>
    );
}
