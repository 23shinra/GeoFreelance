import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Ban, MapPinned, Radar, Store } from 'lucide-react';
import type { ReactNode } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Bezel } from '@/components/premium/bezel';
import { Eyebrow } from '@/components/premium/eyebrow';
import { IslandButton } from '@/components/premium/island-button';
import { MeshBackdrop } from '@/components/premium/mesh-backdrop';
import { Reveal } from '@/components/premium/reveal';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth, name } = usePage().props;

    return (
        <>
            <Head title="Лиды Алматы без сайтов" />

            <div className="film-grain relative min-h-[100dvh] overflow-x-hidden bg-background text-foreground">
                <MeshBackdrop />

                <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-4 md:px-8">
                    <div className="pointer-events-auto mx-auto mt-6 flex w-full max-w-[1200px] items-center justify-between gap-3">
                        <div className="bezel-shell flex items-center gap-3 rounded-full py-2 pr-5 pl-2 backdrop-blur-2xl">
                            <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                                <AppLogoIcon className="size-3.5 fill-current" />
                            </span>
                            <span className="text-sm font-semibold tracking-tight">
                                {name}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {auth.user ? (
                                <IslandButton
                                    href={dashboard()}
                                    icon={
                                        <ArrowUpRight
                                            className="size-4"
                                            strokeWidth={1.25}
                                        />
                                    }
                                >
                                    В кабинет
                                </IslandButton>
                            ) : (
                                <>
                                    <IslandButton
                                        href={login()}
                                        variant="glass"
                                        className="hidden sm:inline-flex"
                                    >
                                        Войти
                                    </IslandButton>
                                    <IslandButton
                                        href={register()}
                                        icon={
                                            <ArrowUpRight
                                                className="size-4"
                                                strokeWidth={1.25}
                                            />
                                        }
                                    >
                                        Начать
                                    </IslandButton>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main className="relative z-10 mx-auto w-full max-w-[1200px] px-4 pt-32 pb-24 md:px-8 md:pt-44 md:pb-40">
                    <section className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                        <Reveal>
                            <Eyebrow tone="primary">
                                2GIS places api · Алматы
                            </Eyebrow>
                            <h1 className="text-balance-tight mt-7 text-5xl leading-[0.92] font-semibold tracking-[-0.04em] md:text-7xl">
                                Бизнесы без сайта.
                                <span className="block text-muted-foreground">
                                    Найдены и отсортированы.
                                </span>
                            </h1>
                            <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                                Сканируем 2GIS по категориям — от стоматологий
                                до ресторанов. У кого есть сайт, уходит в
                                ignore-лист навсегда. Остальные становятся
                                картой лидов, готовой к переписке через
                                ChatAgents.
                            </p>
                            <div className="mt-10 flex flex-wrap items-center gap-3">
                                <IslandButton
                                    href={auth.user ? dashboard() : register()}
                                    icon={
                                        <ArrowUpRight
                                            className="size-4"
                                            strokeWidth={1.25}
                                        />
                                    }
                                >
                                    Собрать первую базу
                                </IslandButton>
                                <IslandButton
                                    href={auth.user ? dashboard() : login()}
                                    variant="glass"
                                    icon={
                                        <MapPinned
                                            className="size-4"
                                            strokeWidth={1.25}
                                        />
                                    }
                                >
                                    Посмотреть карту
                                </IslandButton>
                            </div>
                        </Reveal>

                        <Reveal delay={160}>
                            <Bezel className="rotate-[1.5deg] transition-transform duration-700 ease-fluid hover:rotate-0 md:rotate-[2deg]">
                                <div className="relative p-8">
                                    <span
                                        aria-hidden
                                        className="absolute -top-20 -right-14 size-52 rounded-full bg-primary/25 blur-[90px]"
                                    />
                                    <div className="relative">
                                        <Eyebrow>Пример скана</Eyebrow>
                                        <p className="mt-8 font-mono text-6xl leading-none font-medium text-primary tabular-nums">
                                            412
                                        </p>
                                        <p className="mt-3 text-sm text-muted-foreground">
                                            компаний проверено за один прогон
                                        </p>

                                        <div className="mt-8 space-y-3">
                                            {[
                                                [
                                                    'Лиды без сайта',
                                                    '268',
                                                    'text-primary',
                                                ],
                                                [
                                                    'Есть сайт → ignore',
                                                    '119',
                                                    'text-amber-600 dark:text-amber-300',
                                                ],
                                                [
                                                    'Нужна проверка',
                                                    '25',
                                                    'text-violet-600 dark:text-violet-300',
                                                ],
                                            ].map(([label, value, tone]) => (
                                                <div
                                                    key={label}
                                                    className="hairline flex items-center justify-between rounded-2xl px-4 py-3"
                                                >
                                                    <span className="text-xs text-muted-foreground">
                                                        {label}
                                                    </span>
                                                    <span
                                                        className={`font-mono text-sm tabular-nums ${tone}`}
                                                    >
                                                        {value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Bezel>
                        </Reveal>
                    </section>

                    <section className="mt-32 grid gap-4 md:mt-40 md:grid-cols-6 xl:grid-cols-12">
                        <Reveal className="md:col-span-6 xl:col-span-5">
                            <Feature
                                icon={
                                    <Radar
                                        className="size-5"
                                        strokeWidth={1.25}
                                    />
                                }
                                title="Скан по категориям"
                                text="Выбираете нишу, очередь Laravel обходит Places API и складывает карточки с дедупликацией по домену, телефону и отпечатку названия."
                            />
                        </Reveal>
                        <Reveal
                            delay={80}
                            className="md:col-span-3 xl:col-span-4"
                        >
                            <Feature
                                icon={
                                    <Ban
                                        className="size-5"
                                        strokeWidth={1.25}
                                    />
                                }
                                title="Ignore-лист"
                                text="Компания с сайтом больше не появится в лидах: статус фиксируется вместе с причиной."
                            />
                        </Reveal>
                        <Reveal
                            delay={140}
                            className="md:col-span-3 xl:col-span-3"
                        >
                            <Feature
                                icon={
                                    <Store
                                        className="size-5"
                                        strokeWidth={1.25}
                                    />
                                }
                                title="Кабинет"
                                text="Фильтры, статусы, история импортов и сканов в одном месте."
                            />
                        </Reveal>
                        <Reveal
                            delay={200}
                            className="md:col-span-6 xl:col-span-12"
                        >
                            <Bezel>
                                <div className="flex flex-col items-start justify-between gap-8 p-10 md:flex-row md:items-center">
                                    <div className="max-w-xl">
                                        <Eyebrow tone="primary">
                                            Дальше — outreach
                                        </Eyebrow>
                                        <h2 className="mt-5 text-3xl leading-tight font-semibold tracking-[-0.03em] md:text-4xl">
                                            Готовые лиды уходят в ChatAgents и
                                            договариваются сами
                                        </h2>
                                    </div>
                                    <IslandButton
                                        href={
                                            auth.user ? dashboard() : register()
                                        }
                                        icon={
                                            <ArrowUpRight
                                                className="size-4"
                                                strokeWidth={1.25}
                                            />
                                        }
                                    >
                                        Запустить кабинет
                                    </IslandButton>
                                </div>
                            </Bezel>
                        </Reveal>
                    </section>
                </main>

                <footer className="relative z-10 mx-auto w-full max-w-[1200px] px-4 pb-12 text-xs text-muted-foreground md:px-8">
                    <div className="hairline flex flex-wrap items-center justify-between gap-3 rounded-full px-6 py-4">
                        <span>{name} · лиды Алматы</span>
                        <Link
                            href={auth.user ? dashboard() : login()}
                            className="transition-colors duration-500 ease-fluid hover:text-foreground"
                        >
                            Личный кабинет
                        </Link>
                    </div>
                </footer>
            </div>
        </>
    );
}

function Feature({
    icon,
    title,
    text,
}: {
    icon: ReactNode;
    title: string;
    text: string;
}) {
    return (
        <Bezel className="group h-full transition-transform duration-700 ease-fluid hover:-translate-y-1">
            <div className="flex h-full flex-col justify-between gap-10 p-8">
                <span className="flex size-11 items-center justify-center rounded-full bg-foreground/[0.05] text-primary transition-transform duration-700 ease-fluid group-hover:scale-105 dark:bg-white/[0.07]">
                    {icon}
                </span>
                <div>
                    <h3 className="text-xl font-semibold tracking-[-0.02em]">
                        {title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {text}
                    </p>
                </div>
            </div>
        </Bezel>
    );
}
