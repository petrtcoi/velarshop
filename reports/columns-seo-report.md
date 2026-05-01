# SEO SAFE REPORT — `/columns` (master vs v2)

Date: 2026-04-30

## 1) Измененные файлы

- `astro.config.mjs`
- `src/pages/columns.astro`
- `src/components/columns/columnsData.ts`
- `src/components/columns/ColumnsHero.astro`
- `src/components/columns/QuickSelection.astro`
- `src/components/columns/PopularModels.astro`
- `src/components/columns/ColumnsFilters.tsx`
- `src/components/columns/ColumnsCatalog.astro`
- `src/components/columns/ColumnsGuide.astro`
- `src/components/columns/ColumnsComparison.astro`
- `src/components/columns/ColumnsUseCases.astro`
- `src/components/columns/ColumnsWhyVelar.astro`
- `src/components/columns/ColumnsHowToOrder.astro`
- `src/components/columns/UsefulArticles.astro`
- `src/components/columns/ColumnsFaq.astro`

## 2) Какие блоки добавлены на `/columns`

- Hero с H1 и CTA
- Быстрый подбор по задаче
- Популярные модели
- Фильтры (client-side, без SEO URL)
- Каталог моделей (`ItemList/Product/Offer`)
- Как выбрать
- Сравнение типов радиаторов
- Где использовать
- Почему Velar
- Как заказать
- Полезные материалы (статьи)
- FAQ (`FAQPage`)

## 3) Ссылки и перелинковка (до/после)

- Внутренние ссылки всего (вхождения): `104 -> 158`
- Уникальные внутренние href: `76 -> 78`
- Ссылки на статьи `/info/*`: `12 -> 12`
- Ссылки на модели `/columns/<id>`: `49 -> 49`
- Потерянные href: `0`
- Добавленные href: `2` (`/#catalog`, `#model_list`)

Критичные ссылки сохранены:

- `/columns/3030`
- `/columns/3057`
- `/columns/2180`
- `/columns/3180`

## 4) Проверки качества ссылок

- `href="#"`: `0`
- пустых `href`: `0`
- битых внутренних ссылок (по build `dist`): `0`

## 5) SEO-проверки

- Canonical: `https://velarshop.ru/columns`
- H1: `Трубчатые радиаторы Velar`
- Schema:
  - `BreadcrumbList`: ✅
  - `ItemList`: ✅
  - `Product`: ✅
  - `Offer`: ✅
  - `FAQPage`: ✅

## 6) Redirect совместимости

Добавлен redirect:

- `/info/raschet-sekciy-trubchatogo-radiatora-uglovaya-komnata`
  -> `/info/raschet-radiatorov-dlya-uglovoy-komnaty`

## 7) Полный список внутренних href (`/columns`)

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

## Итог

Status: **SAFE**

- Перелинковка сохранена и усилена.
- SEO-schema сохранена + FAQPage добавлена.
- Каноникал и H1 корректные.
- Битых внутренних ссылок нет.
