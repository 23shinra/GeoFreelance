<?php

declare(strict_types=1);

return [
    'city' => env('LEADS_CITY', 'Алматы'),

    'map' => [
        'center_lat' => (float) env('LEADS_MAP_CENTER_LAT', 43.238949),
        'center_lng' => (float) env('LEADS_MAP_CENTER_LNG', 76.945465),
        'zoom' => (int) env('LEADS_MAP_ZOOM', 12),
        // OpenFreeMap serves OSM-based vector tiles without an API key.
        'style_url' => env(
            'LEADS_MAP_STYLE_URL',
            'https://tiles.openfreemap.org/styles/dark',
        ),
        'style_url_light' => env(
            'LEADS_MAP_STYLE_URL_LIGHT',
            'https://tiles.openfreemap.org/styles/positron',
        ),
    ],

    'source_driver' => env('LEADS_SOURCE_DRIVER', 'null'),
    'geocoder_driver' => env('LEADS_GEOCODER_DRIVER', 'null'),
    'outreach_driver' => env('LEADS_OUTREACH_DRIVER', 'null'),

    // Open-source Chrome CDP parser: https://github.com/interlark/parser-2gis
    'parser2gis' => [
        'binary' => env(
            'PARSER2GIS_BINARY',
            base_path('tools/parser-2gis/.venv/bin/parser-2gis'),
        ),
        'chrome_binary' => env(
            'PARSER2GIS_CHROME_BINARY',
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        ),
        'domain' => env('PARSER2GIS_DOMAIN', 'kz'),
        'city_slug' => env('PARSER2GIS_CITY_SLUG', 'almaty'),
        'max_records' => (int) env('PARSER2GIS_MAX_RECORDS', 100),
        'delay_between_clicks_ms' => (int) env('PARSER2GIS_DELAY_MS', 100),
        'headless' => filter_var(env('PARSER2GIS_HEADLESS', false), FILTER_VALIDATE_BOOL),
        'process_timeout' => (int) env('PARSER2GIS_PROCESS_TIMEOUT', 3600),
    ],

    'whatsapp' => [
        // :name подставляется названием компании.
        'message_template' => env(
            'LEADS_WHATSAPP_TEMPLATE',
            'Здравствуйте! Пишу по поводу :name — хочу предложить сайт и продвижение.',
        ),
    ],
];
