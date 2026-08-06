import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { Bezel } from '@/components/premium/bezel';
import { PageHeader } from '@/components/premium/page-header';
import { Reveal } from '@/components/premium/reveal';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Профиль',
        href: edit(),
        icon: null,
    },
    {
        title: 'Безопасность',
        href: editSecurity(),
        icon: null,
    },
    {
        title: 'Внешний вид',
        href: editAppearance(),
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <>
            <PageHeader
                eyebrow="Аккаунт"
                title="Настройки"
                description="Профиль, доступы и оформление кабинета."
            />

            <div className="mt-14 flex flex-col gap-8 lg:flex-row lg:gap-14">
                <Reveal className="lg:w-56">
                    <nav
                        className="flex flex-wrap gap-2 lg:flex-col"
                        aria-label="Настройки"
                    >
                        {sidebarNavItems.map((item, index) => (
                            <Link
                                key={`${toUrl(item.href)}-${index}`}
                                href={item.href}
                                className={cn(
                                    'rounded-full px-5 py-2.5 text-sm transition-[transform,background-color,color] duration-500 ease-fluid active:scale-[0.98] lg:text-left',
                                    isCurrentOrParentUrl(item.href)
                                        ? 'bezel-core bg-foreground/[0.07] text-foreground dark:bg-white/[0.08]'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                </Reveal>

                <Reveal delay={100} className="min-w-0 flex-1">
                    <Bezel>
                        <section className="max-w-xl space-y-12 p-8 md:p-10">
                            {children}
                        </section>
                    </Bezel>
                </Reveal>
            </div>
        </>
    );
}
