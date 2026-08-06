import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, Ban, MapPinned, Radar, Store } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { Bezel } from '@/components/premium/bezel';
import { Eyebrow } from '@/components/premium/eyebrow';
import { IslandButton } from '@/components/premium/island-button';
import { PageHeader } from '@/components/premium/page-header';
import { Reveal } from '@/components/premium/reveal';
import { StatTile } from '@/components/premium/stat-tile';
import { dashboard, map } from '@/routes';
import { index as businessesIndex } from '@/routes/businesses';
import { index as importsIndex } from '@/routes/imports';
import { index as scansIndex } from '@/routes/scans';
import type { BusinessCard, ImportSummary } from '@/types/leads';

type Props = {
    stats: {
        leads: number;
        ignored_has_website: number;
        ignored_manual: number;
        needs_coordinates: number;
        needs_website_check: number;
        checked: number;
        imports: number;
    };
    recentImports: ImportSummary[];
    recentChecked: BusinessCard[];
};

const formatDate = (value: string | null): string =>
    value ? new Date(value).toLocaleString('ru-RU') : '—';

export default function Dashboard({
    stats,
    recentImports,
    recentChecked,
}: Props) {
    const total = Math.max(stats.checked, 1);
    const leadShare = Math.round((stats.leads / total) * 100);

    return (
        <>
            <Head title="Обзор" />

            <PageHeader
                eyebrow="Almaty · lead intelligence"
                title="Бизнесы без сайта, собранные в одном кабинете"
                description="2GIS сканируется по категориям, компании с сайтом уходят в ignore-лист, а всё остальное превращается в очередь для outreach."
                actions={
                    <>
                        <IslandButton
                            href={scansIndex()}
                            icon={
                                <ArrowUpRight
                                    className="size-4"
                                    strokeWidth={1.25}
                                />
                            }
                        >
                            Запустить скан
                        </IslandButton>
                        <IslandButton
                            href={map()}
                            variant="glass"
                            icon={
                                <MapPinned
                                    className="size-4"
                                    strokeWidth={1.25}
                                />
                            }
                        >
                            Открыть карту
                        </IslandButton>
                    </>
                }
            />

            <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-6 xl:auto-rows-fr xl:grid-cols-12">
                <Reveal className="md:col-span-6 xl:col-span-5 xl:row-span-2">
                    <Bezel className="h-full">
                        <div className="relative flex h-full flex-col justify-between gap-10 p-8">
                            <span
                                aria-hidden
                                className="absolute -top-24 -left-16 size-56 rounded-full bg-primary/25 blur-[90px]"
                            />
                            <div className="relative">
                                <Eyebrow tone="primary">
                                    Готовы к outreach
                                </Eyebrow>
                                <p className="mt-8 font-mono text-6xl leading-none font-medium text-primary tabular-nums md:text-7xl">
                                    {stats.leads}
                                </p>
                                <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                                    Компаний без собственного сайта. Это ядро
                                    базы: им продаём разработку и таргет.
                                </p>
                            </div>

                            <div className="relative space-y-4">
                                <div className="h-1.5 overflow-hidden rounded-full bg-foreground/[0.06] dark:bg-white/[0.08]">
                                    <div
                                        className="h-full w-full origin-left rounded-full bg-primary transition-transform duration-1000 ease-fluid"
                                        style={{
                                            transform: `scaleX(${Math.min(leadShare, 100) / 100})`,
                                        }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                        {leadShare}% от проверенных карточек
                                    </span>
                                    <span className="font-mono tabular-nums">
                                        {stats.checked} проверено
                                    </span>
                                </div>
                                <IslandButton
                                    href={businessesIndex()}
                                    variant="glass"
                                    icon={
                                        <Store
                                            className="size-4"
                                            strokeWidth={1.25}
                                        />
                                    }
                                >
                                    Работать со списком
                                </IslandButton>
                            </div>
                        </div>
                    </Bezel>
                </Reveal>

                <Reveal delay={80} className="md:col-span-3 xl:col-span-4">
                    <StatTile
                        label="Игнор: есть сайт"
                        value={stats.ignored_has_website}
                        hint="Исключены из следующих сканов"
                        tone="amber"
                        className="h-full"
                    />
                </Reveal>

                <Reveal delay={140} className="md:col-span-3 xl:col-span-3">
                    <StatTile
                        label="Нужна проверка"
                        value={stats.needs_website_check}
                        hint="Демо-ключ 2GIS скрыл контакты"
                        tone="violet"
                        className="h-full"
                    />
                </Reveal>

                <Reveal delay={200} className="md:col-span-3 xl:col-span-3">
                    <StatTile
                        label="Без координат"
                        value={stats.needs_coordinates}
                        hint="Не попадут на карту"
                        tone="sky"
                        className="h-full"
                    />
                </Reveal>

                <Reveal delay={260} className="md:col-span-3 xl:col-span-4">
                    <StatTile
                        label="Игнор вручную"
                        value={stats.ignored_manual}
                        hint={`Импортов всего: ${stats.imports}`}
                        tone="rose"
                        className="h-full"
                    />
                </Reveal>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
                <Reveal className="xl:col-span-7">
                    <Bezel className="h-full">
                        <div className="flex h-full flex-col gap-6 p-8">
                            <PanelHeading
                                title="Последние импорты"
                                href={importsIndex()}
                            />
                            {recentImports.length === 0 ? (
                                <EmptyNote text="Импортов пока нет — загрузите CSV или XLSX." />
                            ) : (
                                <ul className="space-y-2">
                                    {recentImports.map((item) => (
                                        <li key={item.id}>
                                            <Row
                                                title={item.original_filename}
                                                subtitle={formatDate(
                                                    item.created_at,
                                                )}
                                                trailing={
                                                    <Eyebrow>
                                                        {item.status_label}
                                                    </Eyebrow>
                                                }
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </Bezel>
                </Reveal>

                <Reveal delay={100} className="xl:col-span-5">
                    <Bezel className="h-full">
                        <div className="flex h-full flex-col gap-6 p-8">
                            <PanelHeading
                                title="Недавно проверенные"
                                href={businessesIndex({
                                    query: { view: 'checked' },
                                })}
                            />
                            {recentChecked.length === 0 ? (
                                <EmptyNote text="После первого скана здесь появятся карточки." />
                            ) : (
                                <ul className="space-y-2">
                                    {recentChecked.map((item) => (
                                        <li key={item.id}>
                                            <Row
                                                title={item.name}
                                                subtitle={
                                                    item.address || 'Без адреса'
                                                }
                                                trailing={
                                                    <Eyebrow
                                                        tone={
                                                            item.status.includes(
                                                                'ignored',
                                                            )
                                                                ? 'warn'
                                                                : 'primary'
                                                        }
                                                    >
                                                        {item.status_label}
                                                    </Eyebrow>
                                                }
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </Bezel>
                </Reveal>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <Reveal>
                    <QuickLink
                        href={map()}
                        icon={
                            <MapPinned className="size-5" strokeWidth={1.25} />
                        }
                        title="Карта Алматы"
                        text="Кластеры лидов и карточка бизнеса"
                    />
                </Reveal>
                <Reveal delay={80}>
                    <QuickLink
                        href={scansIndex()}
                        icon={<Radar className="size-5" strokeWidth={1.25} />}
                        title="Скан 2GIS"
                        text="Категории, история запусков, статистика"
                    />
                </Reveal>
                <Reveal delay={160}>
                    <QuickLink
                        href={businessesIndex({ query: { view: 'ignored' } })}
                        icon={<Ban className="size-5" strokeWidth={1.25} />}
                        title="Ignore-лист"
                        text="Сайты и ручные исключения"
                    />
                </Reveal>
            </div>
        </>
    );
}

function PanelHeading({
    title,
    href,
}: {
    title: string;
    href: NonNullable<ComponentProps<typeof Link>['href']>;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-[-0.02em]">
                {title}
            </h2>
            <Link
                href={href}
                className="group flex items-center gap-2 text-xs tracking-[0.18em] text-muted-foreground uppercase transition-colors duration-500 ease-fluid hover:text-foreground"
            >
                Все
                <span className="flex size-7 items-center justify-center rounded-full bg-foreground/[0.05] transition-transform duration-500 ease-fluid group-hover:translate-x-1 group-hover:-translate-y-px dark:bg-white/[0.07]">
                    <ArrowUpRight className="size-3.5" strokeWidth={1.25} />
                </span>
            </Link>
        </div>
    );
}

function Row({
    title,
    subtitle,
    trailing,
}: {
    title: string;
    subtitle: string;
    trailing: ReactNode;
}) {
    return (
        <div className="hairline flex items-start justify-between gap-4 rounded-2xl px-4 py-3 transition-colors duration-500 ease-fluid hover:bg-foreground/[0.03] dark:hover:bg-white/[0.03]">
            <div className="min-w-0">
                <p className="truncate text-sm font-medium">{title}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                    {subtitle}
                </p>
            </div>
            {trailing}
        </div>
    );
}

function EmptyNote({ text }: { text: string }) {
    return (
        <p className="hairline rounded-2xl px-4 py-8 text-center text-sm text-muted-foreground">
            {text}
        </p>
    );
}

function QuickLink({
    href,
    icon,
    title,
    text,
}: {
    href: NonNullable<ComponentProps<typeof Link>['href']>;
    icon: ReactNode;
    title: string;
    text: string;
}) {
    return (
        <Link href={href} className="group block h-full">
            <Bezel className="h-full transition-transform duration-700 ease-fluid group-hover:-translate-y-1">
                <div className="flex h-full flex-col justify-between gap-8 p-6">
                    <span className="flex size-11 items-center justify-center rounded-full bg-foreground/[0.05] text-primary transition-transform duration-700 ease-fluid group-hover:scale-105 dark:bg-white/[0.06]">
                        {icon}
                    </span>
                    <div>
                        <p className="text-base font-semibold tracking-[-0.01em]">
                            {title}
                        </p>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                            {text}
                        </p>
                    </div>
                </div>
            </Bezel>
        </Link>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Обзор',
            href: dashboard(),
        },
    ],
};
