# `/columns` v5.3 — структура и SEO проверка

Дата: 2026-04-30

## 1) Изменённые файлы

- `src/pages/columns.astro`
- `src/components/columns/ColumnsHero.astro`
- `src/components/columns/QuickSelection.astro`
- `src/components/columns/ColumnsCatalog.astro`
- `src/components/columns/ColumnsFilters.tsx`
- `src/components/columns/columnsData.ts`
- `astro.config.mjs` (ранее добавленный redirect совместимости оставлен)

## 2) Новый порядок блоков (`/columns`)

1. Breadcrumbs  
2. Compact Hero  
3. Быстрый подбор chips  
4. Каталог трубчатых радиаторов Velar  
   - компактная строка популярных моделей (3030/3057/2180/3180)  
   - фильтры  
   - сетка товаров  
5. SEO-блоки:
   - Как выбрать
   - Сравнение
   - Где использовать
   - Почему Velar
   - Как заказать
   - Полезные материалы
   - FAQ

## 3) Проверка URL/каноникала

- URL страницы не менялся: `/columns`
- Canonical: `https://velarshop.ru/columns`
- H1: `Трубчатые радиаторы Velar`

## 4) Проверка якоря

- CTA `Смотреть модели` ведёт на `#model_list`
- `id="model_list"` присутствует в каталоге

## 5) Фильтры: реализовано

- Высота: `all`, `h500`, `h500_700`, `h700_1200`, `h1200`
- Количество труб: `all`, `2`, `3`, `4`
- Цена: `all`, `p7000`, `p7000_9000`, `p9000`
- Быстрые chips пробрасывают фильтр через событие `columns:setFilter`
- Есть `Сбросить фильтры` (показывается только при активных фильтрах)
- Есть состояние “ничего не найдено” + CTA `/request`
- URL не меняется при фильтрации (client-side only)

## 6) Проверка ссылок

- Внутренних ссылок (вхождения): `155`
- Уникальных внутренних `href`: `78`
- Ссылок на модели `/columns/<id>`: `49`
- Ссылок на статьи `/info/*`: `12`
- `href="#"`: `0`
- пустых `href`: `0`

Критичные ссылки сохранены:

- `/columns/3030`
- `/columns/3057`
- `/columns/2180`
- `/columns/3180`

## 7) Schema

- `BreadcrumbList`: ✅
- `ItemList`: ✅
- `Product`: ✅
- `Offer`: ✅
- `FAQPage`: ✅

## 8) Список внутренних href со страницы

- `#model_list`
- `/`
- `/#catalog`
- `/about`
- `/agreement`
- `/columns`
- `/columns/2030`
- `/columns/2037`
- `/columns/2040`
- `/columns/2045`
- `/columns/2050`
- `/columns/2055`
- `/columns/2057`
- `/columns/2060`
- `/columns/2075`
- `/columns/2090`
- `/columns/2100`
- `/columns/2110`
- `/columns/2120`
- `/columns/2150`
- `/columns/2180`
- `/columns/2200`
- `/columns/3020`
- `/columns/3030`
- `/columns/3037`
- `/columns/3040`
- `/columns/3045`
- `/columns/3050`
- `/columns/3055`
- `/columns/3057`
- `/columns/3060`
- `/columns/3075`
- `/columns/3090`
- `/columns/3100`
- `/columns/3110`
- `/columns/3120`
- `/columns/3150`
- `/columns/3180`
- `/columns/3200`
- `/columns/4030`
- `/columns/4037`
- `/columns/4040`
- `/columns/4045`
- `/columns/4050`
- `/columns/4055`
- `/columns/4057`
- `/columns/4060`
- `/columns/4075`
- `/columns/4090`
- `/columns/4100`
- `/columns/4110`
- `/columns/4120`
- `/columns/4150`
- `/columns/4180`
- `/columns/4200`
- `/convector`
- `/delivery`
- `/design`
- `/floor`
- `/guarantees`
- `/info`
- `/info/chernye-dizainerskie-radiatory-otopleniya`
- `/info/column-radiators-pros-cons`
- `/info/forma-trub-dizayn-radiatorov`
- `/info/kak-chistit-trubchatyj-radiator-otopleniya`
- `/info/kreplenie-radiatora-k-stene`
- `/info/radiator-types`
- `/info/raschet-sekciy-trubchatogo-radiatora-uglovaya-komnata`
- `/info/steel-tube-radiators-guide`
- `/info/teplootdacha-radiatora-delta-t-chto-eto`
- `/info/termostats`
- `/info/tube-radiators`
- `/info/zamena-panelnyh-radiatorov-na-trubchatye-velar`
- `/news`
- `/oferta`
- `/privacy`
- `/request`
- `/retro`

## 9) Скриншоты desktop/mobile

Пытался снять автоматом через Playwright (`chromium` и `webkit`), но в текущем окружении браузерные процессы падают с `Abort trap: 6` при запуске headless.  
Поэтому приложить валидные auto-screenshots из CI-сценария в этом запуске не удалось.

