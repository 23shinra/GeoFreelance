import {
    Ban,
    ClipboardList,
    LayoutGrid,
    MapPinned,
    Radar,
    Store,
    Upload,
} from 'lucide-react';
import { dashboard, map } from '@/routes';
import { index as businessesIndex } from '@/routes/businesses';
import { index as importsIndex } from '@/routes/imports';
import { index as scansIndex } from '@/routes/scans';
import type { NavItem } from '@/types';

export const primaryNavItems: NavItem[] = [
    {
        title: 'Обзор',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Карта',
        href: map(),
        icon: MapPinned,
    },
    {
        title: 'Скан 2GIS',
        href: scansIndex(),
        icon: Radar,
    },
    {
        title: 'Лиды',
        href: businessesIndex(),
        icon: Store,
    },
    {
        title: 'Импорты',
        href: importsIndex(),
        icon: Upload,
    },
];

export const secondaryNavItems: NavItem[] = [
    {
        title: 'Проверенные',
        href: businessesIndex({ query: { view: 'checked' } }),
        icon: ClipboardList,
    },
    {
        title: 'Ignore-лист',
        href: businessesIndex({ query: { view: 'ignored' } }),
        icon: Ban,
    },
];
