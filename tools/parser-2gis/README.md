# parser-2gis

Локальный CLI на Chrome CDP для сбора карточек 2GIS (телефоны, сайты, координаты).

## Установка

Нужен Google Chrome.

```bash
python3 -m venv tools/parser-2gis/.venv
tools/parser-2gis/.venv/bin/pip install -r tools/parser-2gis/requirements.txt
```

## Проверка

```bash
tools/parser-2gis/.venv/bin/parser-2gis \
  -i "https://2gis.kz/almaty/search/стоматологии" \
  -o /tmp/out.json \
  -f json \
  --parser.max-records 5
```

Laravel вызывает этот бинарь через `Parser2gisBusinessSource`.
