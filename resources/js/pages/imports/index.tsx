import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowUpRight, FileSpreadsheet, Upload } from 'lucide-react';
import type { FormEvent } from 'react';
import { Bezel } from '@/components/premium/bezel';
import { Eyebrow } from '@/components/premium/eyebrow';
import { IslandButton } from '@/components/premium/island-button';
import { PageHeader } from '@/components/premium/page-header';
import { Reveal } from '@/components/premium/reveal';
import {
    index as importsIndex,
    show as importsShow,
    store,
} from '@/routes/imports';
import type { ImportSummary, Paginated } from '@/types/leads';

type Props = {
    imports: Paginated<ImportSummary>;
};

export default function ImportsIndex({ imports }: Props) {
    const form = useForm<{ file: File | null }>({
        file: null,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(store.url(), {
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Импорты" />

            <PageHeader
                eyebrow="Данные · csv / xlsx"
                title="Импорт локальных баз Алматы"
                description="Загрузите выгрузку, сопоставьте колонки и получите ту же логику дедупликации, что и у скана: сайт есть — ignore, сайта нет — лид."
            />

            <div className="mt-16 grid grid-cols-1 gap-4 xl:grid-cols-12">
                <Reveal className="xl:col-span-7">
                    <Bezel className="h-full">
                        <form onSubmit={submit} className="relative p-8">
                            <span
                                aria-hidden
                                className="absolute -top-20 -left-16 size-48 rounded-full bg-sky-400/15 blur-[90px]"
                            />

                            <div className="relative flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-full bg-foreground/[0.05] text-primary dark:bg-white/[0.07]">
                                    <Upload
                                        className="size-5"
                                        strokeWidth={1.25}
                                    />
                                </span>
                                <div>
                                    <h2 className="text-lg font-semibold tracking-[-0.02em]">
                                        Новый импорт
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        CSV, TXT, XLS или XLSX до 20 МБ
                                    </p>
                                </div>
                            </div>

                            <label className="hairline relative mt-8 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.5rem] px-6 py-12 text-center transition-colors duration-500 ease-fluid hover:bg-foreground/[0.03] dark:hover:bg-white/[0.03]">
                                <input
                                    type="file"
                                    accept=".csv,.txt,.xlsx,.xls"
                                    onChange={(event) =>
                                        form.setData(
                                            'file',
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                    className="sr-only"
                                />
                                <FileSpreadsheet
                                    className="size-7 text-muted-foreground"
                                    strokeWidth={1.25}
                                />
                                <span className="text-sm font-medium">
                                    {form.data.file
                                        ? form.data.file.name
                                        : 'Выберите файл выгрузки'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Шаблон:
                                    storage/app/samples/almaty-businesses.csv
                                </span>
                            </label>

                            {form.errors.file && (
                                <p className="relative mt-3 text-xs text-destructive-foreground">
                                    {form.errors.file}
                                </p>
                            )}

                            <div className="relative mt-8">
                                <IslandButton
                                    type="submit"
                                    disabled={
                                        form.processing || !form.data.file
                                    }
                                    icon={
                                        <ArrowUpRight
                                            className="size-4"
                                            strokeWidth={1.25}
                                        />
                                    }
                                >
                                    Загрузить и разметить
                                </IslandButton>
                            </div>
                        </form>
                    </Bezel>
                </Reveal>

                <Reveal delay={100} className="xl:col-span-5">
                    <Bezel className="h-full">
                        <div className="p-8">
                            <Eyebrow>Минимальные колонки</Eyebrow>
                            <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
                                {[
                                    ['name', 'название компании — обязательно'],
                                    [
                                        'latitude / longitude',
                                        'иначе точка не попадёт на карту',
                                    ],
                                    [
                                        'website',
                                        'заполнен — карточка уходит в ignore',
                                    ],
                                    ['phone', 'нормализуется в формат +7'],
                                ].map(([field, note]) => (
                                    <li
                                        key={field}
                                        className="flex flex-col gap-1"
                                    >
                                        <span className="font-mono text-xs text-foreground">
                                            {field}
                                        </span>
                                        <span className="text-xs leading-relaxed">
                                            {note}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Bezel>
                </Reveal>
            </div>

            <div className="mt-4 space-y-3">
                {imports.data.map((item, index) => (
                    <Reveal key={item.id} delay={Math.min(index * 40, 240)}>
                        <Link
                            href={importsShow(item.id)}
                            className="group block"
                        >
                            <Bezel className="transition-transform duration-700 ease-fluid group-hover:-translate-y-0.5">
                                <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0">
                                        <p className="truncate text-base font-semibold tracking-[-0.01em]">
                                            {item.original_filename}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {item.created_at
                                                ? new Date(
                                                      item.created_at,
                                                  ).toLocaleString('ru-RU')
                                                : '—'}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] text-muted-foreground tabular-nums">
                                        <span>
                                            всего {item.stats?.total ?? 0}
                                        </span>
                                        <span className="text-primary">
                                            новые {item.stats?.created ?? 0}
                                        </span>
                                        <span className="text-amber-600 dark:text-amber-300">
                                            ignore {item.stats?.ignored ?? 0}
                                        </span>
                                        <span className="text-rose-600 dark:text-rose-300">
                                            ошибки {item.stats?.errors ?? 0}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Eyebrow
                                            tone={
                                                item.status === 'failed'
                                                    ? 'warn'
                                                    : item.status ===
                                                        'completed'
                                                      ? 'primary'
                                                      : 'muted'
                                            }
                                        >
                                            {item.status_label}
                                        </Eyebrow>
                                        <span className="flex size-9 items-center justify-center rounded-full bg-foreground/[0.05] transition-transform duration-500 ease-fluid group-hover:translate-x-1 group-hover:-translate-y-px dark:bg-white/[0.07]">
                                            <ArrowUpRight
                                                className="size-4"
                                                strokeWidth={1.25}
                                            />
                                        </span>
                                    </div>
                                </div>
                            </Bezel>
                        </Link>
                    </Reveal>
                ))}

                {imports.data.length === 0 && (
                    <Reveal>
                        <Bezel>
                            <p className="px-6 py-16 text-center text-sm text-muted-foreground">
                                Импортов ещё нет.
                            </p>
                        </Bezel>
                    </Reveal>
                )}
            </div>
        </>
    );
}

ImportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Импорты',
            href: importsIndex(),
        },
    ],
};
