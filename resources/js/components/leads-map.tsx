import { config, Map, NavigationControl } from 'maplibre-gl';
import type {
    ExpressionSpecification,
    GeoJSONSource,
    Map as MapLibreMap,
} from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { useEffect, useRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { BusinessCard } from '@/types/leads';

// MapLibre resolves its worker relative to its own module URL, which the bundled
// build does not emit. Point it at the asset Vite fingerprints for us.
config.WORKER_URL = workerUrl;

const statusColor: ExpressionSpecification = [
    'match',
    ['get', 'status'],
    'lead',
    '#10b981',
    'needs_website_check',
    '#a78bfa',
    'ignored_has_website',
    '#f59e0b',
    'ignored_manual',
    '#f43f5e',
    '#94a3b8',
];

type MapConfig = {
    center: { lat: number; lng: number };
    zoom: number;
    styleUrl: string;
    styleUrlLight?: string;
};

const resolveStyle = (dark: string, light?: string): string => {
    const prefersLight =
        typeof document !== 'undefined' &&
        !document.documentElement.classList.contains('dark');

    return prefersLight && light ? light : dark;
};

type Props = {
    businesses: BusinessCard[];
    mapConfig: MapConfig;
    selectedId: number | null;
    onSelect: (business: BusinessCard | null) => void;
};

export function LeadsMap({
    businesses,
    mapConfig,
    selectedId,
    onSelect,
}: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<MapLibreMap | null>(null);
    const businessesRef = useRef(businesses);

    useEffect(() => {
        businessesRef.current = businesses;
    }, [businesses]);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) {
            return;
        }

        const map = new Map({
            container: containerRef.current,
            style: resolveStyle(mapConfig.styleUrl, mapConfig.styleUrlLight),
            center: [mapConfig.center.lng, mapConfig.center.lat],
            zoom: mapConfig.zoom,
            attributionControl: { compact: true },
        });

        map.addControl(
            new NavigationControl({ visualizePitch: true }),
            'top-right',
        );
        mapRef.current = map;

        map.on('load', () => {
            map.addSource('businesses', {
                type: 'geojson',
                data: toFeatureCollection(businessesRef.current),
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 52,
            });

            map.addLayer({
                id: 'cluster-halo',
                type: 'circle',
                source: 'businesses',
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': '#10b981',
                    'circle-opacity': 0.14,
                    'circle-blur': 0.6,
                    'circle-radius': [
                        'step',
                        ['get', 'point_count'],
                        30,
                        10,
                        40,
                        50,
                        52,
                    ],
                },
            });

            map.addLayer({
                id: 'clusters',
                type: 'circle',
                source: 'businesses',
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': '#0f172a',
                    'circle-opacity': 0.92,
                    'circle-stroke-width': 1.5,
                    'circle-stroke-color': '#34d399',
                    'circle-radius': [
                        'step',
                        ['get', 'point_count'],
                        17,
                        10,
                        23,
                        50,
                        30,
                    ],
                },
            });

            map.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: 'businesses',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': '{point_count_abbreviated}',
                    'text-size': 12,
                    'text-letter-spacing': 0.06,
                },
                paint: {
                    'text-color': '#ecfdf5',
                },
            });

            map.addLayer({
                id: 'point-halo',
                type: 'circle',
                source: 'businesses',
                filter: ['!', ['has', 'point_count']],
                paint: {
                    'circle-color': statusColor,
                    'circle-opacity': 0.18,
                    'circle-blur': 0.5,
                    'circle-radius': 16,
                },
            });

            map.addLayer({
                id: 'unclustered-point',
                type: 'circle',
                source: 'businesses',
                filter: ['!', ['has', 'point_count']],
                paint: {
                    'circle-color': statusColor,
                    'circle-radius': 6,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#0b0f14',
                    'circle-stroke-opacity': 0.55,
                },
            });
        });

        map.on('click', 'clusters', (event) => {
            const features = map.queryRenderedFeatures(event.point, {
                layers: ['clusters'],
            });
            const clusterId = features[0]?.properties?.cluster_id;
            const source = map.getSource('businesses') as GeoJSONSource;

            if (typeof clusterId !== 'number') {
                return;
            }

            source.getClusterExpansionZoom(clusterId).then((zoom) => {
                const geometry = features[0]?.geometry;

                if (geometry?.type !== 'Point') {
                    return;
                }

                map.easeTo({
                    center: geometry.coordinates as [number, number],
                    zoom,
                });
            });
        });

        map.on('click', 'unclustered-point', (event) => {
            const feature = event.features?.[0];
            const id = Number(feature?.properties?.id);
            const business =
                businessesRef.current.find((item) => item.id === id) ?? null;
            onSelect(business);
        });

        map.on('click', (event) => {
            const hits = map.queryRenderedFeatures(event.point, {
                layers: ['unclustered-point', 'clusters'],
            });

            if (hits.length === 0) {
                onSelect(null);
            }
        });

        map.on('mouseenter', 'clusters', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters', () => {
            map.getCanvas().style.cursor = '';
        });
        map.on('mouseenter', 'unclustered-point', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'unclustered-point', () => {
            map.getCanvas().style.cursor = '';
        });

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [
        mapConfig.center.lat,
        mapConfig.center.lng,
        mapConfig.styleUrl,
        mapConfig.styleUrlLight,
        mapConfig.zoom,
        onSelect,
    ]);

    useEffect(() => {
        const map = mapRef.current;
        const source = map?.getSource('businesses') as
            GeoJSONSource | undefined;

        if (!source) {
            return;
        }

        source.setData(toFeatureCollection(businesses));
    }, [businesses]);

    useEffect(() => {
        const map = mapRef.current;

        if (!map) {
            return;
        }

        const emphasize = () => {
            if (!map.getLayer('unclustered-point')) {
                return;
            }

            const isSelected: ExpressionSpecification = [
                '==',
                ['get', 'id'],
                selectedId ?? -1,
            ];

            map.setPaintProperty('unclustered-point', 'circle-radius', [
                'case',
                isSelected,
                10,
                6,
            ]);
            map.setPaintProperty('point-halo', 'circle-radius', [
                'case',
                isSelected,
                30,
                16,
            ]);
        };

        if (map.isStyleLoaded()) {
            emphasize();
        } else {
            map.once('load', emphasize);
        }

        if (selectedId === null) {
            return;
        }

        const selected = businesses.find((item) => item.id === selectedId);

        if (!selected?.latitude || !selected?.longitude) {
            return;
        }

        map.easeTo({
            center: [Number(selected.longitude), Number(selected.latitude)],
            zoom: Math.max(map.getZoom(), 14),
            duration: 900,
            easing: (t) => 1 - Math.pow(1 - t, 4),
        });
    }, [selectedId, businesses]);

    return (
        <div
            ref={containerRef}
            className="h-full min-h-[420px] w-full [&_.maplibregl-ctrl-attrib]:rounded-full [&_.maplibregl-ctrl-attrib]:text-[10px]"
        />
    );
}

type FeatureCollection = {
    type: 'FeatureCollection';
    features: Array<{
        type: 'Feature';
        properties: {
            id: number;
            name: string;
            status: string;
        };
        geometry: {
            type: 'Point';
            coordinates: [number, number];
        };
    }>;
};

function toFeatureCollection(businesses: BusinessCard[]): FeatureCollection {
    return {
        type: 'FeatureCollection',
        features: businesses
            .filter((item) => item.latitude != null && item.longitude != null)
            .map((item) => ({
                type: 'Feature' as const,
                properties: {
                    id: item.id,
                    name: item.name,
                    status: item.status,
                },
                geometry: {
                    type: 'Point' as const,
                    coordinates: [
                        Number(item.longitude),
                        Number(item.latitude),
                    ] as [number, number],
                },
            })),
    };
}
