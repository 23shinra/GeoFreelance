import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Bezel } from '@/components/premium/bezel';
import { MeshBackdrop } from '@/components/premium/mesh-backdrop';
import { Reveal } from '@/components/premium/reveal';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="film-grain relative flex min-h-[100dvh] flex-col items-center justify-center overflow-x-hidden bg-background px-4 py-16 text-foreground">
            <MeshBackdrop />

            <Reveal className="relative z-10 w-full max-w-md">
                <Bezel>
                    <div className="flex flex-col gap-8 p-8 md:p-10">
                        <div className="flex flex-col items-center gap-5 text-center">
                            <Link
                                href={home()}
                                className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary transition-transform duration-700 ease-fluid hover:rotate-[18deg]"
                            >
                                <AppLogoIcon className="size-5 fill-current" />
                                <span className="sr-only">{title}</span>
                            </Link>

                            <div className="space-y-2">
                                <h1 className="text-2xl font-semibold tracking-[-0.02em]">
                                    {title}
                                </h1>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                        </div>

                        {children}
                    </div>
                </Bezel>
            </Reveal>
        </div>
    );
}
