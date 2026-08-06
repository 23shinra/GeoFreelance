import { Head, router } from '@inertiajs/react';
import { ArrowUpRight, Globe, Phone } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { LeadsMap } from '@/components/leads-map';
import { Bezel } from '@/components/premium/bezel';
import { Eyebrow } from '@/components/premium/eyebrow';
import { SearchField, SelectField } from '@/components/premium/filter-field';
import { IslandButton } from '@/components/premium/island-button';
import { Reveal } from '@/components/premium/reveal';
import { WhatsappButton } from '@/components/premium/whatsapp-button';
import { cn } from '@/lib/utils';
import { map as mapRoute } from '@/routes';
import { status as businessStatus } from '@/routes/businesses';
import type { BusinessCard, CategoryOption } from '@/types/leads';

type Props = {
    businesses: BusinessCard[];
    categories: CategoryOption[];
    filters: {
        status: string;
        category_id: number | null;
        search: string;
    };
    mapConfig: {
        center: { lat: number; lng: number };
        zoom: number;
        styleUrl: string;
        styleUrlLight?: string;
    };
    stats: {
        leads: number;
        ignored: number;
        needs_coordinates: number;
        needs_website_check: number;
        checked: number;
    };
};

export default function MapPage({
    businesses,
    categories,
    filters,
    mapConfig,
    stats,
}: Props) {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [search, setSearch] = useState(filters.search);
    const listRef = useRef<HTMLDivElement | null>(null);

    const selected = useMemo(
        () => businesses.find((item) => item.id === selectedId) ?? null,
        [businesses, selectedId],
    );

    // Keep the picked marker visible in the list, which stays open the whole time.
    // Scrolls the panel only, so choosing a marker never moves the page itself.
    useEffect(() => {
        const container = listRef.current;
        const row = container?.querySelector<HTMLElement>(
            `[data-business-id="${selectedId}"]`,
        );

        if (!container || !row) {
            return;
        }

        const panel = container.getBoundingClientRect();
        const target = row.getBoundingClientRect();
        const overflowTop = target.top - panel.top;
        const overflowBottom = target.bottom - panel.bottom;

        if (overflowTop >= 0 && overflowBottom <= 0) {
            return;
        }

        container.scrollTo({
            top:
                container.scrollTop +
                (overflowTop < 0 ? overflowTop : overflowBottom),
            behavior: 'smooth',
        });
    }, [selectedId]);

    const applyFilters = (next: Partial<Props['filters']>) => {
        router.get(
            mapRoute.url({
                query: {
                    status: next.status ?? filters.status,
                    category_id:
                        next.category_id ?? filters.category_id ?? undefined,
                    search: next.search ?? filters.search,
                },
            }),
            {},
            { preserveState: true, replace: true },
        );
    };

    const onSelect = useCallback((business: BusinessCard | null) => {
        setSelectedId(business?.id ?? null);
    }, []);

    const updateStatus = (action: 'lead' | 'ignore' | 'restore') => {
        if (!selected) {
            return;
        }

        router.patch(
            businessStatus(selected.id),
            { action },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Карта" />

            <Reveal className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <Eyebrow tone="primary">
                        Алматы · {businesses.length} точек
                    </Eyebrow>
                    <h1 className="mt-5 text-4xl leading-[0.95] font-semibold tracking-[-0.03em] md:text-5xl">
                        Карта лидов
                    </h1>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Metric label="Лиды" value={stats.leads} tone="primary" />
                    <Metric
                        label="Проверка"
                        value={stats.needs_website_check}
                        tone="violet"
                    />
                    <Metric label="Ignore" value={stats.ignored} tone="amber" />
                    <Metric
                        label="Без координат"
                        value={stats.needs_coordinates}
                        tone="sky"
                    />
                </div>
            </Reveal>

            <Reveal delay={80} className="mt-10">
                <Bezel innerClassName="bg-card/70">
                    <div className="grid gap-3 p-3 lg:grid-cols-[1fr_auto_auto_auto]">
                        <SearchField
                            value={search}
                            onChange={setSearch}
                            onSubmit={() => applyFilters({ search })}
                            placeholder="Название, адрес или телефон"
                        />

                        <SelectField
                            value={filters.status}
                            onChange={(value) =>
                                applyFilters({ status: value })
                            }
                            options={[
                                { value: 'candidates', label: 'Все кандидаты' },
                                { value: 'lead', label: 'Лиды' },
                                {
                                    value: 'needs_website_check',
                                    label: 'Нужна проверка',
                                },
                                {
                                    value: 'ignored_has_website',
                                    label: 'Игнор: сайт',
                                },
                                {
                                    value: 'ignored_manual',
                                    label: 'Игнор: вручную',
                                },
                                {
                                    value: 'needs_coordinates',
                                    label: 'Без координат',
                                },
                            ]}
                        />

                        <SelectField
                            value={
                                filters.category_id
                                    ? String(filters.category_id)
                                    : ''
                            }
                            onChange={(value) =>
                                applyFilters({
                                    category_id: value ? Number(value) : null,
                                })
                            }
                            options={[
                                { value: '', label: 'Все категории' },
                                ...categories.map((category) => ({
                                    value: String(category.id),
                                    label: category.name,
                                })),
                            ]}
                        />

                        <IslandButton
                            onClick={() => applyFilters({ search })}
                            icon={
                                <ArrowUpRight
                                    className="size-4"
                                    strokeWidth={1.25}
                                />
                            }
                        >
                            Применить
                        </IslandButton>
                    </div>
                </Bezel>
            </Reveal>

            <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
                <Reveal delay={140}>
                    <Bezel
                        className="h-[62dvh] lg:h-[82dvh]"
                        innerClassName="relative"
                    >
                        <LeadsMap
                            businesses={businesses}
                            mapConfig={mapConfig}
                            selectedId={selectedId}
                            onSelect={onSelect}
                        />
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-[calc(2rem-0.375rem)] shadow-[inset_0_0_120px_40px_rgba(0,0,0,0.12)] dark:shadow-[inset_0_0_140px_50px_rgba(0,0,0,0.55)]"
                        />
                    </Bezel>
                </Reveal>

                <Reveal delay={200}>
                    <Bezel className="h-[62dvh] lg:h-[82dvh]">
                        <div className="flex h-full flex-col">
                            <div className="flex items-end justify-between gap-4 border-b border-foreground/5 px-6 py-5 dark:border-white/5">
                                <div>
                                    <Eyebrow>Точки в кадре</Eyebrow>
                                    <h2 className="mt-4 text-lg leading-tight font-semibold tracking-[-0.02em]">
                                        Список лидов
                                    </h2>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {businesses.length} карточек по фильтру
                                    </p>
                                </div>

                                {selected && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedId(null)}
                                        className="hairline shrink-0 rounded-full px-3 py-1.5 text-[10px] tracking-[0.18em] text-muted-foreground uppercase transition-colors duration-500 ease-fluid hover:text-foreground"
                                    >
                                        Свернуть
                                    </button>
                                )}
                            </div>

                            <div
                                ref={listRef}
                                className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-3"
                            >
                                {businesses.map((business) => {
                                    const active = business.id === selectedId;

                                    return (
                                        <div
                                            key={business.id}
                                            data-business-id={business.id}
                                            className={cn(
                                                'rounded-2xl transition-colors duration-500 ease-fluid',
                                                active
                                                    ? 'bezel-core bg-foreground/[0.05] dark:bg-white/[0.06]'
                                                    : 'hover:bg-foreground/[0.04] dark:hover:bg-white/[0.04]',
                                            )}
                                        >
                                            <div className="flex items-start gap-2 px-4 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedId(
                                                            active
                                                                ? null
                                                                : business.id,
                                                        )
                                                    }
                                                    className="min-w-0 flex-1 text-left"
                                                >
                                                    <p className="flex items-center gap-2 text-sm font-medium">
                                                        <span
                                                            className={cn(
                                                                'size-2 shrink-0 rounded-full',
                                                                business.status ===
                                                                    'lead'
                                                                    ? 'bg-primary'
                                                                    : business.status ===
                                                                        'needs_website_check'
                                                                      ? 'bg-violet-400'
                                                                      : 'bg-amber-400',
                                                            )}
                                                        />
                                                        <span
                                                            className={cn(
                                                                'min-w-0',
                                                                active
                                                                    ? 'text-balance-tight'
                                                                    : 'truncate',
                                                            )}
                                                        >
                                                            {business.name}
                                                        </span>
                                                    </p>
                                                    <p
                                                        className={cn(
                                                            'mt-1 text-xs text-muted-foreground',
                                                            active
                                                                ? ''
                                                                : 'truncate',
                                                        )}
                                                    >
                                                        {business.category ||
                                                            'Без категории'}{' '}
                                                        ·{' '}
                                                        {business.address ||
                                                            'нет адреса'}
                                                    </p>
                                                    <p className="mt-1 font-mono text-[11px] text-muted-foreground tabular-nums">
                                                        {business.phone ??
                                                            'номер скрыт 2GIS'}
                                                    </p>
                                                </button>
                                                <WhatsappButton
                                                    compact
                                                    url={business.whatsapp_url}
                                                    fallbackUrl={
                                                        business.source_url
                                                    }
                                                    className="mt-1 shrink-0"
                                                />
                                            </div>

                                            {active && (
                                                <div className="space-y-4 border-t border-foreground/5 px-4 pt-4 pb-4 dark:border-white/5">
                                                    <div className="space-y-2">
                                                        <DetailRow
                                                            icon={
                                                                <Phone
                                                                    className="size-3.5"
                                                                    strokeWidth={
                                                                        1.25
                                                                    }
                                                                />
                                                            }
                                                            label="Телефон"
                                                            value={
                                                                business.phone ? (
                                                                    <a
                                                                        href={`tel:${business.phone_normalized ?? business.phone}`}
                                                                        className="font-mono text-xs tabular-nums underline-offset-4 hover:underline"
                                                                    >
                                                                        {
                                                                            business.phone
                                                                        }
                                                                    </a>
                                                                ) : (
                                                                    'скрыт 2GIS'
                                                                )
                                                            }
                                                        />
                                                        <DetailRow
                                                            icon={
                                                                <Globe
                                                                    className="size-3.5"
                                                                    strokeWidth={
                                                                        1.25
                                                                    }
                                                                />
                                                            }
                                                            label="Сайт"
                                                            value={
                                                                business.website ? (
                                                                    <a
                                                                        href={
                                                                            business.website
                                                                        }
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="text-primary underline-offset-4 hover:underline"
                                                                    >
                                                                        {
                                                                            business.website
                                                                        }
                                                                    </a>
                                                                ) : (
                                                                    'нет'
                                                                )
                                                            }
                                                        />
                                                        <DetailRow
                                                            label="Статус"
                                                            value={
                                                                business.status_label
                                                            }
                                                        />
                                                    </div>

                                                    <WhatsappButton
                                                        url={
                                                            business.whatsapp_url
                                                        }
                                                        fallbackUrl={
                                                            business.source_url
                                                        }
                                                        className="w-full py-3 text-sm"
                                                    />

                                                    {(business.social_links
                                                        ?.length ?? 0) > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {business.social_links.map(
                                                                (link) => (
                                                                    <a
                                                                        key={
                                                                            link
                                                                        }
                                                                        href={
                                                                            link
                                                                        }
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="hairline max-w-full truncate rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-colors duration-500 ease-fluid hover:text-foreground"
                                                                    >
                                                                        {link}
                                                                    </a>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="flex flex-wrap gap-2">
                                                        <IslandButton
                                                            onClick={() =>
                                                                updateStatus(
                                                                    'lead',
                                                                )
                                                            }
                                                            className="px-5 py-2.5 text-xs"
                                                        >
                                                            В лиды
                                                        </IslandButton>
                                                        <IslandButton
                                                            variant="glass"
                                                            onClick={() =>
                                                                updateStatus(
                                                                    'ignore',
                                                                )
                                                            }
                                                            className="px-5 py-2.5 text-xs"
                                                        >
                                                            Игнор
                                                        </IslandButton>
                                                        <IslandButton
                                                            variant="quiet"
                                                            onClick={() =>
                                                                updateStatus(
                                                                    'restore',
                                                                )
                                                            }
                                                            className="px-5 py-2.5 text-xs"
                                                        >
                                                            Восстановить
                                                        </IslandButton>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {businesses.length === 0 && (
                                    <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                                        Нет точек под фильтром. Запустите скан
                                        2GIS или импортируйте CSV с
                                        координатами.
                                    </p>
                                )}
                            </div>
                        </div>
                    </Bezel>
                </Reveal>
            </div>
        </>
    );
}

function Metric({
    label,
    value,
    tone,
}: {
    label: string;
    value: number;
    tone: 'primary' | 'violet' | 'amber' | 'sky';
}) {
    const tones: Record<typeof tone, string> = {
        primary: 'text-primary',
        violet: 'text-violet-600 dark:text-violet-300',
        amber: 'text-amber-600 dark:text-amber-300',
        sky: 'text-sky-600 dark:text-sky-300',
    };

    return (
        <div className="hairline rounded-2xl px-4 py-3">
            <p className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                {label}
            </p>
            <p
                className={cn(
                    'mt-1 font-mono text-lg leading-none tabular-nums',
                    tones[tone],
                )}
            >
                {value}
            </p>
        </div>
    );
}

function DetailRow({
    icon,
    label,
    value,
}: {
    icon?: ReactNode;
    label: string;
    value: ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-4 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
                {icon}
                {label}
            </span>
            <span className="max-w-[60%] truncate text-right">{value}</span>
        </div>
    );
}

MapPage.layout = {
    breadcrumbs: [
        {
            title: 'Карта',
            href: mapRoute(),
        },
    ],
};
