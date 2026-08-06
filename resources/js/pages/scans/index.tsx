import { Head, useForm } from '@inertiajs/react';
import { Check, Plus, Radar, RefreshCw } from 'lucide-react';
import type { FormEvent } from 'react';
import { Bezel } from '@/components/premium/bezel';
import { Eyebrow } from '@/components/premium/eyebrow';
import { IslandButton } from '@/components/premium/island-button';
import { PageHeader } from '@/components/premium/page-header';
import { Reveal } from '@/components/premium/reveal';
import { cn } from '@/lib/utils';
import { index as scansIndex, store as scansStore } from '@/routes/scans';
import type { Paginated } from '@/types/leads';

type ScanSummary = {
    id: number;
    source: string;
    city: string;
    queries: string[];
    status: string;
    status_label: string;
    stats: Record<string, number> | null;
    error_message: string | null;
    created_at: string | null;
    finished_at: string | null;
};

type Props = {
    scans: Paginated<ScanSummary>;
    suggestedQueries: string[];
    configured: boolean;
    maxRecords: number;
};

export default function ScansIndex({
    scans,
    suggestedQueries,
    configured,
    maxRecords,
}: Props) {
    const form = useForm<{ queries: string[] }>({
        queries: suggestedQueries,
    });

    const toggleQuery = (query: string) => {
        form.setData(
            'queries',
            form.data.queries.includes(query)
                ? form.data.queries.filter((item) => item !== query)
                : [...form.data.queries, query],
        );
    };

    const addCustomQuery = (query: string) => {
        const value = query.trim();

        if (value && !form.data.queries.includes(value)) {
            form.setData('queries', [...form.data.queries, value]);
        }
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(scansStore.url());
    };

    const customQueries = form.data.queries.filter(
        (query) => !suggestedQueries.includes(query),
    );

    return (
        <>
            <Head title="Сканы 2GIS" />

            <PageHeader
                eyebrow="parser-2gis · Chrome CDP"
                title="Скан бизнесов Алматы по категориям"
                description="Категории обходятся через open-source parser-2gis: Chrome открывает карточки 2GIS и сразу отдаёт телефоны и сайты. Компании с сайтом уходят в ignore, остальные — в лиды с WhatsApp."
                actions={
                    <Eyebrow tone={configured ? 'primary' : 'warn'}>
                        {configured
                            ? 'Парсер готов'
                            : 'Установите parser-2gis'}
                    </Eyebrow>
                }
            />

            <div className="mt-16 grid grid-cols-1 gap-4 xl:grid-cols-12">
                <Reveal className="xl:col-span-7">
                    <Bezel className="h-full">
                        <form onSubmit={submit} className="relative p-8">
                            <span
                                aria-hidden
                                className="absolute -top-20 -right-10 size-48 rounded-full bg-primary/20 blur-[90px]"
                            />

                            <div className="relative flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                                    <Radar
                                        className="size-5"
                                        strokeWidth={1.25}
                                    />
                                </span>
                                <div>
                                    <h2 className="text-lg font-semibold tracking-[-0.02em]">
                                        Новый скан
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        До {maxRecords} карточек на категорию ·
                                        откроется Chrome
                                    </p>
                                </div>
                            </div>

                            <div className="relative mt-8 flex flex-wrap gap-2">
                                {suggestedQueries.map((query) => {
                                    const active =
                                        form.data.queries.includes(query);

                                    return (
                                        <button
                                            key={query}
                                            type="button"
                                            onClick={() => toggleQuery(query)}
                                            className={cn(
                                                'group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-[transform,background-color,color] duration-500 ease-fluid active:scale-[0.98]',
                                                active
                                                    ? 'bezel-core bg-primary/12 text-primary'
                                                    : 'hairline text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'flex size-4 items-center justify-center rounded-full transition-colors duration-500 ease-fluid',
                                                    active
                                                        ? 'bg-primary/25'
                                                        : 'bg-foreground/[0.06] dark:bg-white/[0.08]',
                                                )}
                                            >
                                                {active && (
                                                    <Check
                                                        className="size-2.5"
                                                        strokeWidth={1.75}
                                                    />
                                                )}
                                            </span>
                                            {query}
                                        </button>
                                    );
                                })}
                            </div>

                            {customQueries.length > 0 && (
                                <div className="relative mt-3 flex flex-wrap gap-2">
                                    {customQueries.map((query) => (
                                        <button
                                            key={query}
                                            type="button"
                                            onClick={() => toggleQuery(query)}
                                            className="bezel-core inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-2 text-sm text-violet-600 transition-transform duration-500 ease-fluid active:scale-[0.98] dark:text-violet-300"
                                        >
                                            {query}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="hairline relative mt-6 flex items-center gap-3 rounded-full px-5 py-2">
                                <Plus
                                    className="size-4 text-muted-foreground"
                                    strokeWidth={1.25}
                                />
                                <input
                                    type="text"
                                    placeholder="Своя категория и Enter"
                                    onKeyDown={(event) => {
                                        if (event.key !== 'Enter') {
                                            return;
                                        }

                                        event.preventDefault();
                                        addCustomQuery(
                                            event.currentTarget.value,
                                        );
                                        event.currentTarget.value = '';
                                    }}
                                    className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
                                />
                            </div>

                            <div className="relative mt-8 flex flex-wrap items-center justify-between gap-4">
                                <p className="text-xs text-muted-foreground">
                                    Запросов в очереди:{' '}
                                    <span className="font-mono text-foreground tabular-nums">
                                        {form.data.queries.length}
                                    </span>
                                </p>
                                <IslandButton
                                    type="submit"
                                    disabled={
                                        !configured ||
                                        form.processing ||
                                        form.data.queries.length === 0
                                    }
                                    icon={
                                        <Radar
                                            className={cn(
                                                'size-4',
                                                form.processing &&
                                                    'animate-spin',
                                            )}
                                            strokeWidth={1.25}
                                        />
                                    }
                                >
                                    Запустить скан
                                </IslandButton>
                            </div>
                        </form>
                    </Bezel>
                </Reveal>

                <Reveal delay={100} className="xl:col-span-5">
                    <Bezel className="h-full">
                        <div className="flex h-full flex-col justify-between gap-8 p-8">
                            <div>
                                <Eyebrow>Как это работает</Eyebrow>
                                <ol className="mt-6 space-y-5">
                                    {[
                                        'parser-2gis открывает поиск 2GIS.kz в Chrome',
                                        'Кликает карточки и перехватывает телефоны и сайты',
                                        'Есть сайт — компания уходит в ignore-лист',
                                        'Нет сайта — лид на карте с кнопкой WhatsApp',
                                    ].map((step, index) => (
                                        <li
                                            key={step}
                                            className="flex gap-4 text-sm leading-relaxed text-muted-foreground"
                                        >
                                            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground/[0.05] font-mono text-[11px] text-foreground dark:bg-white/[0.07]">
                                                {index + 1}
                                            </span>
                                            {step}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                            <p className="hairline rounded-2xl px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                                Скан идёт в фоне через очередь — держите{' '}
                                <span className="font-mono text-foreground">
                                    php artisan queue:work
                                </span>
                                . На время парса появится окно Google Chrome —
                                это нормально.
                            </p>
                        </div>
                    </Bezel>
                </Reveal>
            </div>

            <Reveal className="mt-4">
                <Bezel>
                    <div className="p-8">
                        <h2 className="text-lg font-semibold tracking-[-0.02em]">
                            История запусков
                        </h2>

                        {scans.data.length === 0 ? (
                            <p className="hairline mt-6 rounded-2xl px-4 py-10 text-center text-sm text-muted-foreground">
                                Сканы ещё не запускались.
                            </p>
                        ) : (
                            <ul className="mt-6 space-y-2">
                                {scans.data.map((scan) => (
                                    <li
                                        key={scan.id}
                                        className="hairline rounded-2xl px-5 py-4 transition-colors duration-500 ease-fluid hover:bg-foreground/[0.03] dark:hover:bg-white/[0.03]"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium">
                                                    <span className="font-mono text-muted-foreground">
                                                        #{scan.id}
                                                    </span>{' '}
                                                    {scan.city} · {scan.source}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {scan.created_at
                                                        ? new Date(
                                                              scan.created_at,
                                                          ).toLocaleString(
                                                              'ru-RU',
                                                          )
                                                        : '—'}
                                                </p>
                                                <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                                                    {scan.queries.join(' · ')}
                                                </p>
                                            </div>

                                            <div className="flex flex-col items-start gap-3 sm:items-end">
                                                <Eyebrow
                                                    tone={
                                                        scan.status === 'failed'
                                                            ? 'warn'
                                                            : scan.status ===
                                                                'completed'
                                                              ? 'primary'
                                                              : 'muted'
                                                    }
                                                >
                                                    {scan.status ===
                                                        'processing' && (
                                                        <RefreshCw
                                                            className="size-3 animate-spin"
                                                            strokeWidth={1.25}
                                                        />
                                                    )}
                                                    {scan.status_label}
                                                </Eyebrow>
                                                {scan.stats && (
                                                    <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-muted-foreground tabular-nums">
                                                        <span>
                                                            проверено{' '}
                                                            {scan.stats
                                                                .checked ?? 0}
                                                        </span>
                                                        <span className="text-primary">
                                                            лиды{' '}
                                                            {scan.stats.leads ??
                                                                0}
                                                        </span>
                                                        <span className="text-amber-600 dark:text-amber-300">
                                                            сайты{' '}
                                                            {scan.stats
                                                                .ignored_has_website ??
                                                                0}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {scan.error_message && (
                                            <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-2 text-xs text-destructive-foreground">
                                                {scan.error_message}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </Bezel>
            </Reveal>
        </>
    );
}

ScansIndex.layout = {
    breadcrumbs: [
        {
            title: 'Сканы 2GIS',
            href: scansIndex(),
        },
    ],
};
