import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { IslandNav } from '@/components/island-nav';
import { MeshBackdrop } from '@/components/premium/mesh-backdrop';
import { toUrl } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
    children: ReactNode;
};

export default function AppLayout({ breadcrumbs = [], children }: Props) {
    return (
        <div className="film-grain relative min-h-[100dvh] overflow-x-hidden bg-background text-foreground">
            <MeshBackdrop />
            <IslandNav />

            <main className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pt-28 pb-24 md:px-8 md:pt-32 md:pb-32">
                {breadcrumbs.length > 0 && (
                    <nav
                        aria-label="Хлебные крошки"
                        className="mb-10 flex flex-wrap items-center gap-2 text-[11px] tracking-[0.18em] text-muted-foreground uppercase"
                    >
                        {breadcrumbs.map((crumb, index) => (
                            <span
                                key={`${toUrl(crumb.href)}-${index}`}
                                className="flex items-center gap-2"
                            >
                                {index > 0 && (
                                    <span className="text-muted-foreground/40">
                                        /
                                    </span>
                                )}
                                <Link
                                    href={crumb.href}
                                    className="transition-colors duration-500 ease-fluid hover:text-foreground"
                                >
                                    {crumb.title}
                                </Link>
                            </span>
                        ))}
                    </nav>
                )}

                {children}
            </main>
        </div>
    );
}
