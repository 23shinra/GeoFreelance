import { Head, router, useForm } from '@inertiajs/react';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import type { FormEvent } from 'react';
import { Bezel } from '@/components/premium/bezel';
import { Eyebrow } from '@/components/premium/eyebrow';
import { SelectField } from '@/components/premium/filter-field';
import { IslandButton } from '@/components/premium/island-button';
import { PageHeader } from '@/components/premium/page-header';
import { Reveal } from '@/components/premium/reveal';
import { StatTile } from '@/components/premium/stat-tile';
import { index as importsIndex, map as mapColumns } from '@/routes/imports';

type ImportRow = {
    id: number;
    row_number: number;
    status: string;
    status_label: string;
    message: string | null;
    business_id: number | null;
};

type Props = {
    importRun: {
        id: number;
        original_filename: string;
        status: string;
        status_label: string;
        headers: string[];
        preview_rows: Array<Record<string, unknown>>;
        column_map: Record<string, string>;
        stats: Record<string, number> | null;
        error_message: string | null;
        created_at: string | null;
        finished_at: string | null;
        rows: ImportRow[];
    };
    mappableFields: Record<string, string>;
};

export default function ImportShow({ importRun, mappableFields }: Props) {
    const form = useForm<{ column_map: Record<string, string> }>({
        column_map: {
            name: importRun.column_map.name ?? '',
            category: importRun.column_map.category ?? '',
            address: importRun.column_map.address ?? '',
            latitude: importRun.column_map.latitude ?? '',
            longitude: importRun.column_map.longitude ?? '',
            phone: importRun.column_map.phone ?? '',
            website: importRun.column_map.website ?? '',
            social_links: importRun.column_map.social_links ?? '',
            external_id: importRun.column_map.external_id ?? '',
            source_url: importRun.column_map.source_url ?? '',
        },
    });

    const canMap =
        importRun.status === 'mapping' || importRun.status === 'failed';
    const isRunning =
        importRun.status === 'processing' || importRun.status === 'pending';

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(mapColumns.url(importRun.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`Импорт #${importRun.id}`} />

            <PageHeader
                eyebrow={`Импорт #${importRun.id} · ${importRun.status_label}`}
                title={importRun.original_filename}
                description={importRun.error_message ?? undefined}
                actions={
                    isRunning ? (
                        <IslandButton
                            variant="glass"
                            onClick={() =>
                                router.reload({ only: ['importRun'] })
                            }
                            icon={
                                <RefreshCw
                                    className="size-4"
                                    strokeWidth={1.25}
                                />
                            }
                        >
                            Обновить статус
                        </IslandButton>
                    ) : undefined
                }
            />

            {importRun.stats && (
                <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Object.entries(importRun.stats).map(
                        ([key, value], index) => (
                            <Reveal key={key} delay={index * 60}>
                                <StatTile
                                    label={key}
                                    value={value}
                                    tone={
                                        key === 'errors'
                                            ? 'rose'
                                            : key === 'created'
                                              ? 'primary'
                                              : 'neutral'
                                    }
                                    className="h-full"
                                />
                            </Reveal>
                        ),
                    )}
                </div>
            )}

            {canMap && (
                <Reveal className="mt-4">
                    <Bezel>
                        <div className="p-8">
                            <h2 className="text-lg font-semibold tracking-[-0.02em]">
                                Сопоставление колонок
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Проверьте автоматическую разметку и запустите
                                обработку.
                            </p>

                            <form
                                onSubmit={submit}
                                className="mt-8 grid gap-5 md:grid-cols-2"
                            >
                                {Object.entries(mappableFields).map(
                                    ([field, label]) => (
                                        <div
                                            key={field}
                                            className="flex flex-col gap-2"
                                        >
                                            <span className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                                                {label}
                                                {field === 'name' ? ' *' : ''}
                                            </span>
                                            <SelectField
                                                value={
                                                    form.data.column_map[
                                                        field
                                                    ] ?? ''
                                                }
                                                onChange={(value) =>
                                                    form.setData('column_map', {
                                                        ...form.data.column_map,
                                                        [field]: value,
                                                    })
                                                }
                                                className="lg:w-full"
                                                options={[
                                                    {
                                                        value: '',
                                                        label: '— не использовать —',
                                                    },
                                                    ...importRun.headers.map(
                                                        (header) => ({
                                                            value: header,
                                                            label: header,
                                                        }),
                                                    ),
                                                ]}
                                            />
                                        </div>
                                    ),
                                )}

                                <div className="md:col-span-2">
                                    <IslandButton
                                        type="submit"
                                        disabled={form.processing}
                                        icon={
                                            <ArrowUpRight
                                                className="size-4"
                                                strokeWidth={1.25}
                                            />
                                        }
                                    >
                                        Запустить обработку
                                    </IslandButton>
                                </div>
                            </form>

                            <div className="hairline mt-8 overflow-x-auto rounded-[1.5rem]">
                                <table className="min-w-full text-left text-xs">
                                    <thead className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                                        <tr>
                                            {importRun.headers.map((header) => (
                                                <th
                                                    key={header}
                                                    className="px-4 py-3 font-medium whitespace-nowrap"
                                                >
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {importRun.preview_rows.map(
                                            (row, index) => (
                                                <tr
                                                    key={index}
                                                    className="border-t border-foreground/5 dark:border-white/5"
                                                >
                                                    {importRun.headers.map(
                                                        (header) => (
                                                            <td
                                                                key={header}
                                                                className="px-4 py-3 whitespace-nowrap text-muted-foreground"
                                                            >
                                                                {String(
                                                                    row[
                                                                        header
                                                                    ] ?? '',
                                                                )}
                                                            </td>
                                                        ),
                                                    )}
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Bezel>
                </Reveal>
            )}

            {importRun.rows.length > 0 && (
                <Reveal className="mt-4">
                    <Bezel>
                        <div className="p-8">
                            <h2 className="text-lg font-semibold tracking-[-0.02em]">
                                Результаты строк
                            </h2>

                            <ul className="mt-6 space-y-2">
                                {importRun.rows.map((row) => (
                                    <li
                                        key={row.id}
                                        className="hairline flex items-center justify-between gap-4 rounded-2xl px-5 py-3"
                                    >
                                        <span className="font-mono text-xs text-muted-foreground">
                                            строка {row.row_number}
                                        </span>
                                        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                                            {row.message}
                                        </span>
                                        <Eyebrow
                                            tone={
                                                row.status === 'error'
                                                    ? 'warn'
                                                    : row.status === 'created'
                                                      ? 'primary'
                                                      : 'muted'
                                            }
                                        >
                                            {row.status_label}
                                        </Eyebrow>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Bezel>
                </Reveal>
            )}
        </>
    );
}

ImportShow.layout = {
    breadcrumbs: [
        {
            title: 'Импорты',
            href: importsIndex(),
        },
    ],
};
