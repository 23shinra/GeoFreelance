import { Link, router, usePage } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { IslandButton } from '@/components/premium/island-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { primaryNavItems, secondaryNavItems } from '@/lib/navigation';
import { cn, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as scansIndex } from '@/routes/scans';
import type { NavItem } from '@/types';

export function IslandNav() {
    const { auth, name } = usePage().props;
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();
    const getInitials = useInitials();
    const [open, setOpen] = useState(false);

    useEffect(() => router.on('navigate', () => setOpen(false)), []);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const isActive = (item: NavItem): boolean =>
        toUrl(item.href) === toUrl(dashboard())
            ? isCurrentUrl(item.href)
            : isCurrentOrParentUrl(item.href);

    return (
        <>
            <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-4 md:px-8">
                <div className="pointer-events-auto mx-auto mt-6 flex w-full max-w-[1400px] items-center justify-between gap-3">
                    <Link
                        href={dashboard()}
                        className="bezel-shell group flex items-center gap-3 rounded-full py-2 pr-5 pl-2 backdrop-blur-2xl transition-transform duration-500 ease-fluid active:scale-[0.98]"
                    >
                        <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary transition-transform duration-700 ease-fluid group-hover:rotate-[18deg]">
                            <AppLogoIcon className="size-3.5 fill-current" />
                        </span>
                        <span className="flex flex-col leading-none">
                            <span className="text-sm font-semibold tracking-tight">
                                {name}
                            </span>
                            <span className="mt-1 text-[9px] tracking-[0.22em] text-muted-foreground uppercase">
                                Almaty
                            </span>
                        </span>
                    </Link>

                    <nav
                        aria-label="Основная навигация"
                        className="bezel-shell hidden items-center gap-1 rounded-full p-1.5 backdrop-blur-2xl lg:flex"
                    >
                        {primaryNavItems.map((item) => (
                            <Link
                                key={toUrl(item.href)}
                                href={item.href}
                                prefetch
                                className={cn(
                                    'relative rounded-full px-4 py-2 text-[13px] font-medium transition-[color,background-color] duration-500 ease-fluid',
                                    isActive(item)
                                        ? 'bezel-core bg-foreground/[0.07] text-foreground dark:bg-white/[0.08]'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {item.title}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        <IslandButton
                            href={scansIndex()}
                            icon={
                                <ArrowUpRight
                                    className="size-4"
                                    strokeWidth={1.25}
                                />
                            }
                            className="hidden md:inline-flex"
                        >
                            Новый скан
                        </IslandButton>

                        {auth.user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="bezel-shell flex size-11 items-center justify-center rounded-full backdrop-blur-2xl transition-transform duration-500 ease-fluid active:scale-95"
                                        aria-label="Аккаунт"
                                    >
                                        <Avatar className="size-8">
                                            <AvatarImage
                                                src={auth.user.avatar}
                                                alt={auth.user.name}
                                            />
                                            <AvatarFallback className="bg-primary/15 text-[11px] font-medium text-primary">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="min-w-60 rounded-2xl"
                                >
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        <button
                            type="button"
                            onClick={() => setOpen((value) => !value)}
                            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
                            aria-expanded={open}
                            className="bezel-shell relative size-11 rounded-full backdrop-blur-2xl transition-transform duration-500 ease-fluid active:scale-95 lg:hidden"
                        >
                            <span
                                className={cn(
                                    'absolute top-1/2 left-1/2 h-px w-5 -translate-x-1/2 bg-current transition-transform duration-500 ease-fluid',
                                    open
                                        ? 'translate-y-0 rotate-45'
                                        : '-translate-y-[3px] rotate-0',
                                )}
                            />
                            <span
                                className={cn(
                                    'absolute top-1/2 left-1/2 h-px w-5 -translate-x-1/2 bg-current transition-transform duration-500 ease-fluid',
                                    open
                                        ? 'translate-y-0 -rotate-45'
                                        : 'translate-y-[3px] rotate-0',
                                )}
                            />
                        </button>
                    </div>
                </div>
            </header>

            <div
                className={cn(
                    'fixed inset-0 z-30 bg-background/80 backdrop-blur-3xl transition-opacity duration-700 ease-fluid lg:hidden',
                    open
                        ? 'pointer-events-auto opacity-100'
                        : 'pointer-events-none opacity-0',
                )}
            >
                <div className="flex min-h-[100dvh] flex-col justify-center gap-10 px-6 pt-32 pb-16">
                    <div className="flex flex-col gap-2">
                        {[...primaryNavItems, ...secondaryNavItems].map(
                            (item, index) => (
                                <Link
                                    key={toUrl(item.href)}
                                    href={item.href}
                                    style={{
                                        transitionDelay: open
                                            ? `${120 + index * 60}ms`
                                            : '0ms',
                                    }}
                                    className={cn(
                                        'group flex items-center justify-between gap-6 border-b border-foreground/5 py-4 transition-[opacity,transform] duration-700 ease-fluid dark:border-white/5',
                                        open
                                            ? 'translate-y-0 opacity-100'
                                            : 'translate-y-12 opacity-0',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'text-2xl font-semibold tracking-[-0.02em]',
                                            isActive(item)
                                                ? 'text-primary'
                                                : 'text-foreground',
                                        )}
                                    >
                                        {item.title}
                                    </span>
                                    {item.icon && (
                                        <item.icon
                                            className="size-5 text-muted-foreground transition-transform duration-500 ease-fluid group-hover:translate-x-1"
                                            strokeWidth={1.25}
                                        />
                                    )}
                                </Link>
                            ),
                        )}
                    </div>

                    <IslandButton
                        href={scansIndex()}
                        icon={
                            <ArrowUpRight
                                className="size-4"
                                strokeWidth={1.25}
                            />
                        }
                        className="self-start"
                    >
                        Запустить скан
                    </IslandButton>
                </div>
            </div>
        </>
    );
}
