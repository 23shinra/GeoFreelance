import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpRight, Globe, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import { Bezel } from '@/components/premium/bezel';
import { Eyebrow } from '@/components/premium/eyebrow';
import { SearchField, SelectField } from '@/components/premium/filter-field';
import { IslandButton } from '@/components/premium/island-button';
import { PageHeader } from '@/components/premium/page-header';
import { Reveal } from '@/components/premium/reveal';
import { WhatsappButton } from '@/components/premium/whatsapp-button';
import { cn } from '@/lib/utils';
import {
    index as businessesIndex,
    status as businessStatus,
} from '@/routes/businesses';
import type { BusinessCard, CategoryOption, Paginated } from '@/types/leads';

type Props = {
    businesses: Paginated<BusinessCard>;
    categories: CategoryOption[];
    filters: {
        status: string;
        category_id: number | null;
        search: string;
        view: string;
    };
};

const views: Record<string, { title: string; description: string }> = {
    ignored: {
        title: 'Ignore-лист',
        description:
            'Компании с сайтом и ручные исключения. Они не вернутся в результаты следующих сканов.',
    },
    checked: {
        title: 'Проверенные бизнесы',
        description:
            'Полная история обработанных карточек: что стало лидом, а что ушло в игнор.',
    },
    default: {
        title: 'Очередь лидов',
        description:
            'Компании без сайта, готовые к первому касанию. Меняйте статус прямо из списка.',
    },
};

export default function BusinessesIndex({
    businesses,
    categories,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const view = views[filters.view] ?? views.default;

    const applyFilters = (next: Partial<Props['filters']>) => {
        router.get(
            businessesIndex.url({
                query: {
                    view: next.view ?? filters.view ?? undefined,
                    status: next.status ?? filters.status ?? undefined,
                    category_id:
                        next.category_id ?? filters.category_id ?? undefined,
                    search: next.search ?? filters.search ?? undefined,
                },
            }),
            {},
            { preserveState: true, replace: true },
        );
    };

    const updateStatus = (
        businessId: number,
        action: 'lead' | 'ignore' | 'restore',
    ) => {
        router.patch(
            businessStatus(businessId),
            { action },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title={view.title} />

            <PageHeader
                eyebrow={`Кабинет · ${businesses.total} записей`}
                title={view.title}
                description={view.description}
            />

            <Reveal delay={80} className="mt-12">
                <Bezel innerClassName="bg-card/70">
                    <div className="grid gap-3 p-3 lg:grid-cols-[1fr_auto_auto_auto]">
                        <SearchField
                            value={search}
                            onChange={setSearch}
                            onSubmit={() => applyFilters({ search })}
                            placeholder="Название, адрес, телефон"
                        />

                        <SelectField
                            value={filters.view || filters.status || 'lead'}
                            onChange={(value) => {
                                if (
                                    value === 'ignored' ||
                                    value === 'checked'
                                ) {
                                    applyFilters({ view: value, status: '' });

                                    return;
                                }

                                applyFilters({ view: '', status: value });
                            }}
                            options={[
                                { value: 'lead', label: 'Лиды' },
                                { value: 'checked', label: 'Проверенные' },
                                { value: 'ignored', label: 'Ignore-лист' },
                                {
                                    value: 'needs_website_check',
                                    label: 'Нужна проверка',
                                },
                                {
                                    value: 'needs_coordinates',
                                    label: 'Без координат',
                                },
                                {
                                    value: 'ignored_has_website',
                                    label: 'Игнор: сайт',
                                },
                                {
                                    value: 'ignored_manual',
                                    label: 'Игнор: вручную',
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
                            Фильтр
                        </IslandButton>
                    </div>
                </Bezel>
            </Reveal>

            <div className="mt-4 space-y-3">
                {businesses.data.map((business, index) => (
                    <Reveal key={business.id} delay={Math.min(index * 40, 240)}>
                        <Bezel className="group transition-transform duration-700 ease-fluid hover:-translate-y-0.5">
                            <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
                                <div className="min-w-0 lg:max-w-lg">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={cn(
                                                'size-2 shrink-0 rounded-full',
                                                business.status === 'lead'
                                                    ? 'bg-primary'
                                                    : business.status ===
                                                        'needs_website_check'
                                                      ? 'bg-violet-400'
                                                      : business.status ===
                                                          'ignored_manual'
                                                        ? 'bg-rose-400'
                                                        : 'bg-amber-400',
                                            )}
                                        />
                                        <h2 className="truncate text-lg font-semibold tracking-[-0.02em]">
                                            {business.name}
                                        </h2>
                                    </div>
                                    <p className="mt-2 flex items-center gap-2 truncate text-sm text-muted-foreground">
                                        <MapPin
                                            className="size-3.5 shrink-0"
                                            strokeWidth={1.25}
                                        />
                                        {business.category || 'Без категории'} ·{' '}
                                        {business.address || 'адрес не указан'}
                                    </p>
                                    {business.ignore_reason && (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            {business.ignore_reason}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 text-sm lg:w-56">
                                    <span className="flex items-center gap-2 text-muted-foreground">
                                        <Phone
                                            className="size-3.5"
                                            strokeWidth={1.25}
                                        />
                                        {business.phone ? (
                                            <a
                                                href={`tel:${business.phone_normalized ?? business.phone}`}
                                                className="font-mono text-xs tabular-nums underline-offset-4 hover:underline"
                                            >
                                                {business.phone}
                                            </a>
                                        ) : (
                                            'номер скрыт 2GIS'
                                        )}
                                    </span>
                                    <span className="flex items-center gap-2 text-muted-foreground">
                                        <Globe
                                            className="size-3.5"
                                            strokeWidth={1.25}
                                        />
                                        {business.website ? (
                                            <a
                                                href={business.website}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="truncate text-primary underline-offset-4 hover:underline"
                                            >
                                                {business.website}
                                            </a>
                                        ) : (
                                            'сайта нет'
                                        )}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                                    <Eyebrow
                                        tone={
                                            business.status === 'lead'
                                                ? 'primary'
                                                : business.status.includes(
                                                        'ignored',
                                                    )
                                                  ? 'warn'
                                                  : 'muted'
                                        }
                                    >
                                        {business.status_label}
                                    </Eyebrow>

                                    <WhatsappButton
                                        url={business.whatsapp_url}
                                        fallbackUrl={business.source_url}
                                    />

                                    <div className="flex flex-wrap gap-2 transition-opacity duration-500 ease-fluid lg:opacity-60 lg:group-hover:opacity-100">
                                        <IslandButton
                                            onClick={() =>
                                                updateStatus(
                                                    business.id,
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
                                                    business.id,
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
                                                    business.id,
                                                    'restore',
                                                )
                                            }
                                            className="px-4 py-2.5 text-xs"
                                        >
                                            Вернуть
                                        </IslandButton>
                                    </div>
                                </div>
                            </div>
                        </Bezel>
                    </Reveal>
                ))}

                {businesses.data.length === 0 && (
                    <Reveal>
                        <Bezel>
                            <p className="px-6 py-16 text-center text-sm text-muted-foreground">
                                Ничего не найдено. Смените фильтр или запустите
                                новый скан 2GIS.
                            </p>
                        </Bezel>
                    </Reveal>
                )}
            </div>

            {businesses.links.length > 3 && (
                <div className="mt-10 flex flex-wrap items-center gap-2">
                    {businesses.links.map((link) =>
                        link.url ? (
                            <Link
                                key={`${link.label}-${link.url}`}
                                href={link.url}
                                className={cn(
                                    'min-w-10 rounded-full px-4 py-2 text-center text-sm transition-[transform,background-color,color] duration-500 ease-fluid active:scale-95',
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hairline text-muted-foreground hover:text-foreground',
                                )}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ) : (
                            <span
                                key={`${link.label}-disabled`}
                                className="min-w-10 rounded-full px-4 py-2 text-center text-sm text-muted-foreground/40"
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ),
                    )}
                </div>
            )}
        </>
    );
}

BusinessesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Бизнесы',
            href: businessesIndex(),
        },
    ],
};
