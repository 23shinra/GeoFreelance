# Almaty Leads MVP

Кабинет и карта бизнес-лидов Алматы: официальный 2GIS Places API, импорт CSV/XLSX, дедупликация, ignore-лист для компаний с сайтом и подготовка к ChatAgents.

## Стек

- Laravel 13 / PHP 8.3
- Inertia.js + React + TypeScript + Tailwind
- MapLibre GL (кластеры маркеров)
- SQLite по умолчанию (легко сменить на PostgreSQL)
- Очереди: `sync` локально, можно переключить на `database`/`redis`

## Быстрый старт

```bash
export PATH="$HOME/.config/herd-lite/bin:$PATH"
composer install
cp .env.example .env   # если ещё нет
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
npm install
npm run build
php artisan serve
```

Откройте `http://localhost:8000`.

Демо-пользователь после `db:seed`:

- email: `admin@almaty.leads`
- password: `password`

Для фронтенда в режиме разработки:

```bash
npm run dev
```

## Дизайн-система

- Тёмная OLED-палитра (`#050505`-класса) с mesh-градиентами и фиксированным film-grain оверлеем; светлая тема — «soft structuralism» на серебристом фоне
- Шрифты Plus Jakarta Sans (текст) и JetBrains Mono (числа), self-hosted через `laravel-vite-plugin/fonts`
- Примитивы в `resources/js/components/premium`: `Bezel` (двойная окантовка), `IslandButton` (pill + вложенная иконка), `Eyebrow`, `StatTile`, `Reveal` (появление через `IntersectionObserver`), `MeshBackdrop`
- Навигация — плавающий стеклянный island-nav (`components/island-nav.tsx`) с morph-гамбургером и полноэкранным меню на мобильных
- Анимации только на `transform`/`opacity` с кривой `--ease-fluid: cubic-bezier(0.32, 0.72, 0, 1)`

## Импорт

1. Войдите в кабинет → **Импорты**
2. Загрузите CSV/XLSX
3. Проверьте сопоставление колонок
4. Запустите обработку

Пример файла: [`storage/app/samples/almaty-businesses.csv`](storage/app/samples/almaty-businesses.csv)

Поддерживаемые поля:

| Поле | Описание |
|------|----------|
| `name` | Название (обязательно) |
| `category` | Категория |
| `address` | Адрес |
| `latitude` / `longitude` | Координаты для карты |
| `phone` | Телефон |
| `website` | Сайт (соцсети сюда тоже можно — они не считаются сайтом) |
| `social_links` | Соцсети через запятую |
| `external_id` | Внешний ID для дедупликации |
| `source_url` | Ссылка-источник для ручной сверки |

### Правила статусов

- нет сайта + есть координаты → `lead`
- есть обычный сайт → `ignored_has_website` (игнор-лист)
- Instagram/Telegram/WhatsApp/и т.п. → это соцсети, не сайт
- нет координат → `needs_coordinates`
- уже проигнорированные записи не возвращаются в список лидов при повторном импорте

## Скан 2GIS (parser-2gis)

Контакты собирает open-source [parser-2gis](https://github.com/interlark/parser-2gis) через реальный Google Chrome (CDP), а не официальный Places API.

### Установка парсера

```bash
python3 -m venv tools/parser-2gis/.venv
tools/parser-2gis/.venv/bin/pip install -r tools/parser-2gis/requirements.txt
```

Нужен установленный Google Chrome. В `.env`:

```env
LEADS_SOURCE_DRIVER=parser2gis
PARSER2GIS_CHROME_BINARY="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PARSER2GIS_DOMAIN=kz
PARSER2GIS_CITY_SLUG=almaty
PARSER2GIS_MAX_RECORDS=50
PARSER2GIS_DELAY_MS=100
PARSER2GIS_HEADLESS=false
```

В кабинете откройте **Скан 2GIS**, выберите категории и запустите. На время скана откроется окно Chrome — так устроен парсер. Держите воркер:

```bash
php artisan queue:work
```

Результаты дедуплицируются по 2GIS ID, домену, телефону и fingerprint. Телефоны и сайты приходят сразу: сайт → `ignored_has_website`, нет сайта → `lead` с WhatsApp-кнопкой.

## WhatsApp-outreach

- `App\Services\Businesses\WhatsappLinkBuilder` собирает `https://wa.me/<номер>` с предзаполненным сообщением
- Текст первого сообщения — `LEADS_WHATSAPP_TEMPLATE`, `:name` подставляется названием компании
- Ссылка отдаётся фронтенду как `whatsapp_url` в `App\Http\Resources\BusinessCardResource`
- Кнопка есть в карточке на карте, в списке точек и в списке лидов; телефон рядом кликабелен через `tel:`

## Карта

- Центр по умолчанию: Алматы
- Кластеризация через MapLibre GeoJSON source, цвет точки зависит от статуса
- Тайлы OpenFreeMap без ключа: `LEADS_MAP_STYLE_URL` (тёмная тема) и `LEADS_MAP_STYLE_URL_LIGHT` (светлая)
- Под нагрузкой замените тайлы на провайдера с подходящей лицензией и SLA

## Интеграционные контракты

- `App\Contracts\BusinessSource` → `Parser2gisBusinessSource` или `NullBusinessSource`
- `App\Contracts\Geocoder` → `NullGeocoder`
- `App\Contracts\OutreachGateway` → `NullOutreachGateway` (+ таблица `outreach_attempts`)

```env
# CHATAGENTS_API_URL=
# CHATAGENTS_API_TOKEN=
```

## Тесты

```bash
php artisan test
```

## UI

Установлен Taste Skill (`Leonxlnx/taste-skill`). Текущий визуал кабинета: тёмный dense ops / Linear-clean. Можно переключить направление через скиллы в `.agents/skills/`.
