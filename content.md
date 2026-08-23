# SEO-карта кластеров VelarShop

Документ сделан как рабочий план развития коммерческого SEO для velarshop.ru. Логика такая же, как в плане для k-radiator: не просто список статей, а структура `коммерческая страница → tier-1 → tier-2`, где каждая статья усиливает конкретную money page и возвращает пользователя к категории, модели, расчету или заявке.

## Аудит плана и фактической реализации от 2026-07-20

Проверка репозитория показала, что кластерная логика в целом верная, но исходный план смешивал новые информационные страницы с интентами, которые уже подробно закрыты коммерческими хабами. Страницы `/design`, `/convector`, `/floor` и `/retro` уже содержат выбор серий, сценарии, FAQ и ссылки на модели. Поэтому статьи с названиями вида `*-velar-obzor` или общий гид `dizayn-radiatory-velar-kak-vybrat` не следует создавать автоматически: они могут конкурировать с money page по одному запросу и размывать внутренний вес. Вместо них приоритет получают сравнительные и сценарные материалы с отдельным интентом, а обзор линейки остается частью коммерческого хаба.

Фактическая проверка также выявила две пары страниц с риском каннибализации: `/info/trubchatye-radiatory-vs-panelnye` и `/info/trubchatyy-radiator-ili-panelnyy`, а также несколько общих материалов про выбор и монтаж внутрипольных конвекторов. Для этих пар нужен отдельный анализ показов и запросов в Search Console. После выбора сильнейшего URL полезный текст и ссылки переносятся на него, а второй URL получает 301 redirect; создавать дополнительные близкие сравнения до консолидации не нужно.

Исправлен фактический URL расчета для угловой комнаты: в коллекции статья публикуется как `/info/raschet-radiatorov-dlya-uglovoy-komnaty`, хотя имя исходного файла отличается. Канонический URL низковольтного конвектора - `/model/kwhv24`; путь `/convector/kwhv-24v` является переадресацией и не должен использоваться для внутренней перелинковки. Статус `есть` далее означает наличие конечного URL, а не совпадение имени файла с планом.

В первую очередь добавлены два материала с разными и коммерчески понятными интентами: сравнение `/info/kwh-kwhv-kwhv24-chto-vybrat` и сценарный гид `/info/trubchatye-radiatory-velar-dlya-kvartiry`. Первый получает входящие ссылки из `/convector` и главного гида по выбору конвекторов, второй - из `/columns`, `/info/tube-radiators` и `/info/column-radiators-pros-cons`. Обе статьи возвращают пользователя к коммерческому хабу, конкретным моделям, связанным техническим материалам и форме расчета.

Проверка от 2026-08-16 показала, что отдельные URL `/info/sravnenie-modeley-dizayn-radiatorov-velar` и `/info/napolnyy-radiator-ili-vnutripolnyy-konvektor` пока создавать не нужно. Первый интент подробно закрывает коммерческая страница `/design` с таблицей серий и блоком «Какую серию Velar выбрать», второй - страница `/floor`, статья `/info/chto-postavit-pered-panoramnym-oknom` и сценарный гид по конвекторам. Вместо конкурирующих страниц добавлены две самостоятельные Tier-1 статьи: `/info/kakoy-radiator-vybrat-dlya-kvartiry` и `/info/kakoy-radiator-vybrat-dlya-chastnogo-doma`. Они разделены по типу системы и ведут в коммерческие разделы `/columns`, `/design`, `/floor`, `/convector`, `/retro` и на `/request`. Входящие ссылки добавлены из этих коммерческих разделов, `/info/oshibki-pri-vybore-radiatorov`, `/info/radiator-types`, `/info/kak-podgotovit-dannye-dlya-rascheta-radiatora` и общего списка материалов.

Проверка от 2026-08-23 выделила два следующих самостоятельных интента без прямого дубля в коллекции: `/info/nizkie-trubchatye-radiatory-pod-okno` и `/info/dizayn-radiator-s-tenom-kogda-nuzhen`. Первый углубляет короткие упоминания низких моделей в общем трубчатом гиде и ведет к `/columns`, второй раскрывает отдельный режим эксплуатации, а не повторяет коммерческий выбор серий на `/design`. Входящие ссылки установлены из коммерческих хабов и соответствующих Tier-1 статей, исходящие - на модели, расчет, альтернативные решения и `/request`.

Здесь **не расписываем tier-3**. Идея текущего этапа — собрать кластеры вокруг существующих коммерческих страниц и понять:

- какие статьи уже есть;
- какие существующие статьи нужно углубить;
- какие статьи 1-го уровня добавить;
- какие статьи 2-го уровня добавить для развития темы;
- куда каждая статья должна ссылаться.

Главная проблема текущей структуры: статьи уже есть, но они часто лежат как отдельные материалы в `/info/*`, а не как поддерживающие элементы конкретных коммерческих страниц. Поэтому кластер должен быть перестроен из вида:

```txt
Коммерческая страница
├── статья
├── статья
└── статья
```

в более понятную SEO-структуру:

```txt
Коммерческая страница / money page
└── Tier-1: опорная статья или крупный сценарий выбора
    ├── Tier-2: сравнение
    ├── Tier-2: технический разбор
    ├── Tier-2: сценарий применения
    └── Tier-2: возражения / ошибки / эксплуатация
```

---

## 1. Общая стратегия

VelarShop — коммерческий сайт, поэтому статьи не должны жить отдельно от каталога. Каждая статья должна отвечать на вопрос пользователя и вести к продаже: на категорию, модель, подбор, форму расчета или заявку.

Базовый путь пользователя:

```txt
Информационный вопрос
→ статья
→ уточнение / сравнение / сценарий
→ коммерческая страница
→ модель / подбор
→ заявка
```

Для AI-выдачи каждая новая или обновляемая статья должна начинаться с короткого ответа на 40-70 слов, затем давать таблицу выбора, затем подробный разбор и FAQ. Важно писать не просто SEO-текст, а ответ, который можно процитировать в генеративной выдаче.

---

## 2. Уровни страниц

### Коммерческий уровень

Это страницы, где пользователь выбирает категорию, серию, модель или отправляет заявку:

```txt
/
/columns
/floor
/convector
/retro
/design
/model/kwh
/model/kwhv
/model/kwhv24
/request
```

Также нужно добавить или усилить коммерческие хабы:

```txt
/design/p30
/design/p60
/design/q40
/design/q60
/design/q80
/design/r32
/design/r42
/design/r89

/columns/3030
/columns/3057
/columns/2180
/columns/3180

/retro/nostalgia
/retro/historic

/convector/kwh
/convector/kwhv
/convector/kwhv-24v
```

Если URL пока не меняются, можно оставить текущие `/columns`, `/convector`, `/retro`, `/floor`, `/design`, но внутри сайта уже строить логику как у будущих ЧПУ-разделов.

### Tier-1

Опорные статьи и крупные сценарии выбора. Они объясняют направление и ведут к коммерческой странице.

Примеры текущих:

```txt
/info/tube-radiators
/info/steel-tube-radiators-guide
/info/column-radiators-pros-cons
/info/kak-vybirat-vnutripolnye-konvektory
/info/iron-cast-radiators
/info/vertical-designer-radiators
/info/horizontal-designer-radiators
/info/floor-design-radiators
```

### Tier-2

Углубляющие статьи: сравнения, частные сценарии, технические вопросы, ошибки, монтаж, эксплуатация, расчет.

Примеры текущих:

```txt
/info/tube-radiators-myths-and-facts
/info/raschet-radiatorov-dlya-uglovoy-komnaty
/info/zamena-panelnyh-radiatorov-na-trubchatye-velar
/info/vnutripolnye-konvektory-prinuditelnaia-vs-estestvennaia-konvekciia
/info/vnutripolnye-konvektory-s-ventilyatorom
/info/220v-vs-24v
/info/oshibki-pri-vybore-dizain-radiatorov
/info/forma-trub-dizayn-radiatorov
```

---

# 3. Кластер “Трубчатые радиаторы Velar”

## Структура

```txt
Трубчатые радиаторы Velar
└── [есть] /columns
    ├── [есть / углубить] /info/tube-radiators
    │   ├── [есть] /info/steel-tube-radiators-guide
    │   ├── [есть] /info/column-radiators-pros-cons
    │   ├── [есть] /info/tube-radiators-myths-and-facts
    │   ├── [есть] /info/radiator-types
    │   ├── [2026.07.20] /info/trubchatye-radiatory-velar-dlya-kvartiry
    │   ├── [добавить] /info/trubchatye-radiatory-velar-dlya-chastnogo-doma
    │   └── [добавить] /info/trubchatye-radiatory-dlya-centralnogo-otopleniya
    │
    ├── [есть / углубить] /info/steel-tube-radiators-guide
    │   ├── [есть] /info/raschet-radiatorov-dlya-uglovoy-komnaty
    │   ├── [есть] /info/teplootdacha-radiatora-delta-t-chto-eto
    │   ├── [есть] /info/zamena-panelnyh-radiatorov-na-trubchatye-velar
    │   ├── [добавить] /info/kak-rasschitat-trubchatyy-radiator-velar
    │   ├── [2026.06.25] /info/2-3-4-trubchatye-radiatory-chto-vybrat
    │   └── [2026.08.23] /info/nizkie-trubchatye-radiatory-pod-okno
    │
    ├── [2026.07.08 - updated] /info/column-radiators-pros-cons
    │   ├── [есть] /info/zamena-panelnyh-radiatorov-na-trubchatye-velar
    │   ├── [2026.06.08] /info/trubchatyy-radiator-ili-panelnyy
    │   ├── [добавить] /info/trubchatyy-radiator-ili-dizayn-radiator
    │   └── [добавить] /info/trubchatye-radiatory-v-interere
    │
    └── [есть / углубить] /info/kak-chistit-trubchatyj-radiator-otopleniya
        ├── [есть] /info/termostats
        ├── [есть] /info/termostat-installation-errors
        ├── [добавить] /info/kak-uhazhivat-za-trubchatym-radiatorom
        └── [2026.08.05] /info/oshibki-ekspluatacii-trubchatyh-radiatorov
```

## Роли страниц

### `/columns`

Коммерческий хаб. Должен закрывать запросы “трубчатые радиаторы”, “стальные трубчатые радиаторы”, “трубчатые радиаторы отопления”, “трубчатые радиаторы Velar”.

На странице нужно усилить:

```txt
- первый экран с УТП и CTA;
- блок популярных моделей;
- быстрый подбор по высоте и сценарию;
- сравнение с панельными и дизайн-радиаторами;
- FAQ;
- блок полезных статей;
- форму “Получить расчет”.
```

Связи: `/columns` должен ссылаться на все Tier-1 статьи кластера, на модели 3030/3057/2180/3180, на `/request`, а также на смежные разделы `/design`, `/floor`, `/convector`.

### `/info/tube-radiators`

Tier-1. Базовая статья про трубчатые радиаторы Velar. Ее нужно сделать не просто описательной, а опорной статьей кластера: что это, кому подходят, какие варианты есть, как выбрать, какие модели Velar смотреть.

Связи: вверх на `/columns`, вниз на статьи про стальные трубчатые радиаторы, плюсы/минусы, мифы, квартиру, частный дом и центральное отопление.

### `/info/steel-tube-radiators-guide`

Tier-1. Большой технический гид. Нужно углубить расчетом мощности, ΔT, количеством секций, высотой, подключением и сценариями выбора.

Связи: `/columns`, `/info/raschet-radiatorov-dlya-uglovoy-komnaty`, `/info/teplootdacha-radiatora-delta-t-chto-eto`, `/request`.

### `/info/column-radiators-pros-cons`

Tier-1. Статья для пользователя, который выбирает тип радиатора. Нужно добавить таблицу “трубчатые / панельные / дизайн / чугунные” и обязательно вести на `/columns`.

Связи: `/columns`, `/design`, `/retro`, `/info/zamena-panelnyh-radiatorov-na-trubchatye-velar`.

## Что добавить

### `[2026.07.20] /info/trubchatye-radiatory-velar-dlya-kvartiry`

Tier-2. О выборе трубчатых радиаторов в квартиру: центральное отопление, давление, мощность, подключение, замена старых батарей, высота под подоконник.

Связи: `/columns`, `/info/zamena-panelnyh-radiatorov-na-trubchatye-velar`, `/info/teplootdacha-radiatora-delta-t-chto-eto`, `/request`.

### `/info/trubchatye-radiatory-velar-dlya-chastnogo-doma`

Tier-2. О выборе для частного дома: автономное отопление, большие помещения, гостиные, панорамные окна, дизайнерский интерьер, нестандартные цвета.

Связи: `/columns`, `/floor`, `/convector`, `/design`, `/request`.

### `/info/trubchatye-radiatory-dlya-centralnogo-otopleniya`

Tier-2. Снимает страх “можно ли трубчатые радиаторы в центральное отопление”.

Связи: `/columns`, `/info/trubchatye-radiatory-velar-dlya-kvartiry`, `/info/zamena-panelnyh-radiatorov-na-trubchatye-velar`, `/request`.

### `/info/2-3-4-trubchatye-radiatory-chto-vybrat`

Tier-2. Как выбрать количество труб: глубина, мощность, внешний вид, где лучше 2-трубчатый, 3-трубчатый или 4-трубчатый радиатор.

Связи: `/columns`, модели 2030/3030/4030/2057/3057/4057, `/request`.

### `[2026.08.23] /info/nizkie-trubchatye-radiatory-pod-okno`

Tier-2. Подбор низких трубчатых радиаторов под подоконник, для низких окон и ограниченной высоты.

Связи: `/columns`, `/floor`, `/info/radiatory-dlya-panoramnykh-okon-tipy-osobennosti`.

---

# 4. Кластер “Напольные радиаторы Velar”

## Структура

```txt
Напольные радиаторы Velar
└── [есть] /floor
    ├── [есть / углубить] /info/floor-design-radiators
    │   ├── [есть] /info/radiatory-dlya-panoramnykh-okon-tipy-osobennosti
    │   ├── [добавить] /info/napolnye-radiatory-velar-obzor
    │   ├── [добавить] /info/napolnye-radiatory-dlya-panoramnyh-okon
    │   ├── [не создавать - каннибализация] /info/napolnyy-radiator-ili-vnutripolnyy-konvektor
    │   └── [добавить] /info/napolnye-radiatory-v-interere
    │
    └── [есть / углубить] /info/radiatory-dlya-panoramnykh-okon-tipy-osobennosti
        ├── [2026.06.08] /info/chto-postavit-pered-panoramnym-oknom
        ├── [добавить] /info/nizkiy-radiator-ili-konvektor
        └── [добавить] /info/radiator-pered-oknom-v-pol
```

## Роли страниц

### `/floor`

Коммерческий хаб напольных радиаторов. Должен продавать не просто тип монтажа, а сценарии: панорамные окна, низкие подоконники, невозможность настенного монтажа, дизайнерский интерьер.

Связи: `/info/floor-design-radiators`, `/info/radiatory-dlya-panoramnykh-okon-tipy-osobennosti`, `/convector`, `/design`, `/request`.

### `/info/floor-design-radiators`

Tier-1. Уже есть статья про напольные дизайн-радиаторы. Ее нужно усилить как главный гид: когда нужен напольный радиатор, чем он отличается от настенного и внутрипольного конвектора, какие ограничения по монтажу.

Связи: `/floor`, `/convector`, `/info/radiatory-dlya-panoramnykh-okon-tipy-osobennosti`.

## Что добавить

### `/info/napolnye-radiatory-velar-obzor`

Tier-1. Опорный обзор напольных радиаторов Velar. Нужен, если текущая статья `/info/floor-design-radiators` останется более общей и информационной.

Связи: `/floor`, `/design`, `/convector`, `/request`.

### `[не создавать - каннибализация] /info/napolnyy-radiator-ili-vnutripolnyy-konvektor`

Tier-2. Сравнение двух решений для панорамных окон: напольный радиатор и внутрипольный конвектор.

Связи: `/floor`, `/convector`, `/info/radiatory-dlya-panoramnykh-okon-tipy-osobennosti`, `/request`.

### `/info/chto-postavit-pered-panoramnym-oknom`

Tier-2. AI-friendly статья с таблицей: напольный радиатор, внутрипольный конвектор, низкий трубчатый радиатор, вертикальный радиатор рядом с окном.

Связи: `/floor`, `/convector`, `/columns`, `/design`.

---

# 5. Кластер “Внутрипольные конвекторы Velar”

## Структура

```txt
Внутрипольные конвекторы Velar
└── [есть] /convector
    ├── [2026.07.08 - updated] /info/kak-vybirat-vnutripolnye-konvektory
    │   ├── [есть] /info/convectors
    │   ├── [есть] /info/convectors-pros-cons
    │   ├── [есть] /info/panoramnie-okna
    │   ├── [есть] /info/vnutripolnye-konvektory-podbor-i-montazh
    │   ├── [не создавать отдельно: интент закрывает /convector] /info/vnutripolnye-konvektory-velar-obzor
    │   ├── [2026.07.20] /info/kwh-kwhv-kwhv24-chto-vybrat
    │   └── [добавить] /info/vnutripolnyy-konvektor-dlya-kvartiry
    │
    ├── [2026.07.08 - updated] /info/panoramnie-okna
    │   ├── [есть] /info/teplovaya-zavesa-u-panoramnyh-okon
    │   ├── [есть] /info/vnutripolnye-konvektory-prinuditelnaia-vs-estestvennaia-konvekciia
    │   ├── [добавить] /info/konvektor-dlya-panoramnogo-okna
    │   └── [добавить] /info/kak-ubrat-holod-ot-panoramnogo-okna
    │
    ├── [есть] /model/kwh
    │   ├── [есть] /info/convectors
    │   ├── [есть] /info/convectors-pros-cons
    │   └── [добавить] /info/velar-kwh-obzor
    │
    ├── [есть] /model/kwhv
    │   ├── [есть] /info/vnutripolnye-konvektory-s-ventilyatorom
    │   ├── [есть] /info/vnutripolnye-konvektory-prinuditelnaia-vs-estestvennaia-konvekciia
    │   └── [добавить] /info/velar-kwhv-obzor
    │
    └── [есть] /model/kwhv24
        ├── [есть] /info/220v-vs-24v
        ├── [есть] /info/vnutripolnye-konvektory-s-ventilyatorom
        └── [добавить] /info/velar-kwhv24-obzor
```

## Роли страниц

### `/convector`

Коммерческий хаб. Должен объяснять выбор между KWH, KWHV и KWHV 24V, а не просто показывать товары.

Связи: `/model/kwh`, `/model/kwhv`, `/model/kwhv24`, `/info/kak-vybirat-vnutripolnye-konvektory`, `/info/vnutripolnye-konvektory-prinuditelnaia-vs-estestvennaia-konvekciia`, `/request`.

### `/info/kak-vybirat-vnutripolnye-konvektory`

Tier-1. Главный гид по выбору внутрипольных конвекторов. Нужно добавить таблицу выбора: естественная конвекция / вентилятор / 24V, квартира / дом / коммерческое помещение.

Связи: `/convector`, `/model/kwh`, `/model/kwhv`, `/model/kwhv24`, `/request`.

### `/info/panoramnie-okna`

Tier-1. Статья про конвекторы для панорамного остекления. Нужно связать ее с коммерческим хабом `/convector` и статьями про тепловую завесу, холод от окон и выбор типа конвектора.

## Что добавить

### `[не создавать отдельно] /info/vnutripolnye-konvektory-velar-obzor`

Этот общий интент уже закрывает коммерческий хаб `/convector`. Отдельная обзорная статья будет конкурировать с ним по брендовым запросам, поэтому фактические данные о линейке нужно усиливать на money page, а информационный кластер развивать через сравнения и сценарии.

Связи: `/convector`, `/model/kwh`, `/model/kwhv`, `/model/kwhv24`.

### `[2026.07.20] /info/kwh-kwhv-kwhv24-chto-vybrat`

Tier-2. Сравнение трех моделей. Очень важная статья для конверсии и AI-выдачи.

Связи: `/convector`, `/model/kwh`, `/model/kwhv`, `/model/kwhv24`, `/request`.

### `/info/konvektor-dlya-panoramnogo-okna`

Tier-2. Практическая статья: какой конвектор выбрать под панорамное окно, когда хватит естественной конвекции, когда нужен вентилятор.

Связи: `/convector`, `/info/panoramnie-okna`, `/info/teplovaya-zavesa-u-panoramnyh-okon`.

### `/info/velar-kwh-obzor`

Tier-2. Модельный обзор KWH как конвектора с естественной конвекцией.

Связи: `/model/kwh`, `/convector`, `/info/convectors-pros-cons`.

### `/info/velar-kwhv-obzor`

Tier-2. Модельный обзор KWHV как конвектора с вентилятором.

Связи: `/model/kwhv`, `/convector`, `/info/vnutripolnye-konvektory-s-ventilyatorom`.

### `/info/velar-kwhv24-obzor`

Tier-2. Модельный обзор KWHV 24V и отличие от 220V-решений.

Связи: `/model/kwhv24`, `/info/220v-vs-24v`, `/convector`.

---

# 6. Кластер “Чугунные ретро-радиаторы Velar”

## Структура

```txt
Чугунные ретро-радиаторы Velar
└── [есть] /retro
    ├── [есть / углубить] /info/iron-cast-radiators
    │   ├── [есть] /info/ironcast
    │   ├── [есть] /info/pravila-ekspluatacii-chugunnyh-radiatorov
    │   ├── [есть] /info/kak-otlichit-kachestvennoe-lite-radiatorov
    │   ├── [есть] /info/restavratsiya-chugunnyh-radiatorov
    │   ├── [добавить] /info/retro-radiatory-velar-obzor
    │   ├── [добавить] /info/chugunnye-retro-radiatory-dlya-kvartiry
    │   └── [добавить] /info/chugunnye-retro-radiatory-dlya-chastnogo-doma
    │
    ├── [2026.06.08] /info/nostalgia-ili-historic-chto-vybrat
    │   ├── [2026.06.25] /info/radiatory-s-ornamentom-ili-bez
    │   ├── [добавить] /info/retro-radiator-v-klassicheskom-interere
    │   └── [добавить] /info/retro-radiator-v-loft-interere
    │
    └── [есть / углубить] /info/kak-otlichit-kachestvennoe-lite-radiatorov
        ├── [есть] /info/restavratsiya-chugunnyh-radiatorov
        ├── [добавить] /info/patina-bronza-zoloto-serebro-dlya-retro-radiatorov
        └── [добавить] /info/kak-vybrat-cvet-chugunnogo-radiatora
```

## Роли страниц

### `/retro`

Коммерческий хаб ретро-радиаторов. Должен продавать эмоцию, стиль и визуал, а не только технические характеристики.

Связи: `/info/iron-cast-radiators`, `/info/ironcast`, `/info/kak-otlichit-kachestvennoe-lite-radiatorov`, будущие страницы Nostalgia/Historic, `/request`.

### `/info/iron-cast-radiators`

Tier-1. Статья про чугунные радиаторы в ретро-стиле. Нужно усилить ее как основной информационный вход: стиль, орнамент, цвет, патина, монтаж, когда выбирать чугун.

Связи: `/retro`, `/info/ironcast`, `/info/kak-otlichit-kachestvennoe-lite-radiatorov`, `/request`.

### `/info/ironcast`

Tier-1/Tier-2. Общая статья про особенности чугунных радиаторов. Должна ссылаться на `/retro`, но не конкурировать с коммерческой страницей.

## Что добавить

### `/info/retro-radiatory-velar-obzor`

Tier-1. Обзор ретро-линейки Velar: модели, высоты, орнамент, цвет, патина, сценарии интерьера.

Связи: `/retro`, будущие `/retro/nostalgia`, `/retro/historic`, `/request`.

### `/info/nostalgia-ili-historic-chto-vybrat`

Tier-2. Сравнение двух основных ретро-серий.

Связи: `/retro`, `/retro/nostalgia`, `/retro/historic`, `/request`.

### `/info/radiatory-s-ornamentom-ili-bez`

Tier-2. Как выбрать между декоративным орнаментом и спокойной классикой.

Связи: `/retro`, `/info/retro-radiator-v-klassicheskom-interere`.

### `/info/patina-bronza-zoloto-serebro-dlya-retro-radiatorov`

Tier-2. Цвета и декоративная отделка ретро-радиаторов.

Связи: `/retro`, `/info/kak-vybrat-cvet-chugunnogo-radiatora`, `/request`.

---

# 7. Кластер “Дизайн-радиаторы Velar”

## Структура

```txt
Дизайн-радиаторы Velar
└── [есть] /design
    ├── [есть / углубить] /info/vertical-designer-radiators
    │   ├── [есть] /info/power
    │   ├── [есть] /info/oshibki-pri-vybore-dizain-radiatorov
    │   ├── [есть] /info/forma-trub-dizayn-radiatorov
    │   ├── [добавить] /info/vertikalnye-dizayn-radiatory-velar-dlya-kvartiry
    │   ├── [добавить] /info/vertikalnyy-radiator-dlya-uzkoy-steny
    │   └── [добавить] /info/kak-rasschitat-moshchnost-vertikalnogo-dizayn-radiatora
    │
    ├── [есть / углубить] /info/horizontal-designer-radiators
    │   ├── [есть] /info/kak-podobrat-radiatory-dlya-kuhni
    │   ├── [добавить] /info/gorizontalnye-dizayn-radiatory-pod-okno
    │   ├── [добавить] /info/gorizontalnyy-dizayn-radiator-ili-trubchatyy
    │   └── [добавить] /info/dizayn-radiator-dlya-kuhni-gostinoy
    │
    ├── [2026.07.08] /info/wall
    │   ├── [есть] /info/vertical-designer-radiators
    │   ├── [есть] /info/horizontal-designer-radiators
    │   ├── [добавить] /info/nastennyy-ili-napolnyy-dizayn-radiator
    │   └── [добавить] /info/dizayn-radiator-vmesto-obychnoi-batarei
    │
    ├── [есть / углубить] /info/tsvet-interera-i-radiator
    │   ├── [есть] /info/chernye-dizainerskie-radiatory-otopleniya
    │   ├── [добавить] /info/radiator-v-cvet-steny-ili-akcentnyy
    │   ├── [добавить] /info/belyy-chernyy-ili-cvetnoy-dizayn-radiator
    │   └── [добавить] /info/radiatory-ral-v-interere
    │
    └── [не создавать отдельно: интент закрывает /design] /info/dizayn-radiatory-velar-kak-vybrat
        ├── [не создавать - каннибализация] /info/p30-p60-q40-r32-chto-vybrat
        ├── [добавить] /info/ploskiy-kvadratnyy-kruglyy-profil-radiatora
        ├── [2026.08.23] /info/dizayn-radiator-s-tenom-kogda-nuzhen
        └── [не создавать - каннибализация] /info/sravnenie-modeley-dizayn-radiatorov-velar
```

## Роли страниц

### `/design`

Коммерческий хаб дизайнерских радиаторов. Нужно развести его с главной: главная — бренд Velar, `/design` — товарная категория “дизайнерские радиаторы”.

Связи: `/info/vertical-designer-radiators`, `/info/horizontal-designer-radiators`, `/info/wall`, `/info/tsvet-interera-i-radiator`, модели P/Q/R/S, `/request`.

### `/info/vertical-designer-radiators`

Tier-1. Опорная статья по вертикальным дизайн-радиаторам. Нужно добавить таблицу моделей Velar, сценарии установки, расчет мощности, ссылки на модельные страницы.

Связи: `/design`, `/design/p30`, `/design/p60`, `/design/q40`, `/info/power`, `/request`.

### `/info/horizontal-designer-radiators`

Tier-1. Опорная статья по горизонтальным дизайн-радиаторам. Нужно связать ее с моделями, кухней-гостиной, установкой под окно и сравнением с трубчатыми.

Связи: `/design`, `/info/kak-podobrat-radiatory-dlya-kuhni`, `/columns`, `/request`.

### `/info/wall`

Tier-1. Статья про настенные дизайнерские радиаторы. Нужно сделать ее не общей, а навигационной: вертикальные, горизонтальные, с ТЭНом, цвет, профиль.

Связи: `/design`, вертикальный и горизонтальный кластер, `/request`.

## Что добавить

### `[не создавать отдельно] /info/dizayn-radiatory-velar-kak-vybrat`

Главный гид по выбору уже реализован внутри `/design`: на странице есть вертикальные и горизонтальные сценарии, профили P/Q/R/S, мощность, цвет, подключение и ТЭН. Создание второго URL под тот же запрос увеличит риск каннибализации. Развивать кластер нужно узкими сравнениями серий и форм профиля, которые ссылаются обратно на `/design`.

Связи: `/design`, все серии P/Q/R/S, `/info/vertical-designer-radiators`, `/info/horizontal-designer-radiators`, `/request`.

### `[не создавать - каннибализация] /info/p30-p60-q40-r32-chto-vybrat`

Tier-2. Сравнение популярных серий по форме профиля, визуальной массе, мощности и сценариям.

Связи: `/design`, `/design/p30`, `/design/p60`, `/design/q40`, `/design/r32`.

### `/info/ploskiy-kvadratnyy-kruglyy-profil-radiatora`

Tier-2. Разбор формы труб дизайн-радиаторов: плоский, квадратный, круглый профиль. Может углублять уже существующую статью `/info/forma-trub-dizayn-radiatorov`.

Связи: `/info/forma-trub-dizayn-radiatorov`, `/design`, серии P/Q/R.

### `[2026.08.23] /info/dizayn-radiator-s-tenom-kogda-nuzhen`

Tier-2. Когда нужен электрический ТЭН в дизайнерском радиаторе, ограничения, сезонное использование, ванная/прихожая/кухня.

Связи: `/design`, модельные страницы с возможностью ТЭНа, `/request`.

### `[не создавать - каннибализация] /info/sravnenie-modeley-dizayn-radiatorov-velar`

Tier-2. Большая сравнительная статья по сериям Velar. Хорошая страница для AI-выдачи.

Связи: `/design`, все модельные хабы, `/request`.

---

# 8. Кластер “Общие вопросы выбора радиаторов”

## Структура

```txt
Общие вопросы выбора радиаторов
└── [есть] /info/oshibki-pri-vybore-radiatorov
    ├── [есть] /info/bezopasnost-radiatorov-dlya-detej
    ├── [есть] /info/power
    ├── [есть] /info/radiator-types
    ├── [добавлено 2026.08.16] /info/kakoy-radiator-vybrat-dlya-kvartiry
    ├── [добавлено 2026.08.16] /info/kakoy-radiator-vybrat-dlya-chastnogo-doma
    ├── [добавить] /info/radiator-dlya-detskoy-komnaty
    ├── [добавить] /info/radiator-dlya-spalni
    └── [2026.08.05] /info/kak-podgotovit-dannye-dlya-rascheta-radiatora
```

## Зачем нужен кластер

Это общий поддерживающий слой, который должен распределять пользователя по коммерческим разделам:

```txt
Если нужен обычный надежный радиатор → /columns
Если важен дизайн → /design
Если панорамные окна → /floor или /convector
Если ретро-интерьер → /retro
```

## Что добавить

### `[добавлено 2026.08.16] /info/kakoy-radiator-vybrat-dlya-kvartiry`

Tier-1. Общий гид выбора радиатора для квартиры добавлен. Исходящие ссылки ведут в `/columns`, `/design`, `/floor`, `/convector`, `/retro`, на модели, связанные технические статьи, парный гид для частного дома и `/request`. Входящие ссылки установлены с `/columns`, `/design`, `/floor`, `/convector`, `/retro`, общего списка `/info`, статей `/info/oshibki-pri-vybore-radiatorov`, `/info/radiator-types` и `/info/kak-podgotovit-dannye-dlya-rascheta-radiatora`.

### `[добавлено 2026.08.16] /info/kakoy-radiator-vybrat-dlya-chastnogo-doma`

Tier-1. Гид по выбору радиаторов для частного дома добавлен: автономное отопление, температурный график, материалы, гидравлика, большие помещения и панорамные окна. Исходящие ссылки ведут в основные коммерческие разделы, на модели конвекторов, связанные технические статьи, парный гид для квартиры и `/request`. Входящие ссылки установлены с `/columns`, `/design`, `/floor`, `/convector`, `/retro`, общего списка `/info`, статей `/info/oshibki-pri-vybore-radiatorov`, `/info/radiator-types` и `/info/kak-podgotovit-dannye-dlya-rascheta-radiatora`.

### `[2026.08.05] /info/kak-podgotovit-dannye-dlya-rascheta-radiatora`

Tier-2. Практическая статья перед заявкой: какие данные нужны менеджеру для подбора и расчета.

Связи: `/request`, все основные коммерческие разделы.

---

# 9. Как углублять существующие статьи

## `/info/tube-radiators`

Добавить:

```txt
answer-first блок;
таблицу выбора трубчатых радиаторов;
ссылку на /columns;
ссылки на статьи про стальные трубчатые, плюсы/минусы, расчет, квартиру;
FAQ;
CTA на расчет.
```

Дочерние статьи второго уровня:

```txt
/info/trubchatye-radiatory-velar-dlya-kvartiry
/info/trubchatye-radiatory-velar-dlya-chastnogo-doma
/info/trubchatye-radiatory-dlya-centralnogo-otopleniya
/info/2-3-4-trubchatye-radiatory-chto-vybrat
```

## `/info/steel-tube-radiators-guide`

Добавить:

```txt
таблицу: высота / количество труб / мощность / где использовать;
блок про ΔT;
ссылку на расчет секций;
ссылку на /columns;
CTA “Получить расчет”.
```

Дочерние статьи второго уровня:

```txt
/info/kak-rasschitat-trubchatyy-radiator-velar
/info/nizkie-trubchatye-radiatory-pod-okno - добавлено 2026.08.23
/info/trubchatyy-radiator-ili-panelnyy
```

## `/info/kak-vybirat-vnutripolnye-konvektory`

Добавить:

```txt
answer-first;
таблицу KWH / KWHV / KWHV 24V;
ссылку на /convector;
ссылки на все три модели;
FAQ;
CTA на подбор.
```

Дочерние статьи второго уровня:

```txt
/info/kwh-kwhv-kwhv24-chto-vybrat
/info/konvektor-dlya-panoramnogo-okna
/info/velar-kwh-obzor
/info/velar-kwhv-obzor
/info/velar-kwhv24-obzor
```

## `/info/iron-cast-radiators`

Добавить:

```txt
ссылку на /retro;
таблицу: Nostalgia / Historic / с орнаментом / без орнамента;
блок про цвета и патину;
FAQ;
CTA.
```

Дочерние статьи второго уровня:

```txt
/info/retro-radiatory-velar-obzor
/info/nostalgia-ili-historic-chto-vybrat
/info/radiatory-s-ornamentom-ili-bez
/info/patina-bronza-zoloto-serebro-dlya-retro-radiatorov
```

## `/info/vertical-designer-radiators`

Добавить:

```txt
таблицу моделей;
ссылку на /design;
ссылки на вертикальные версии P/Q/R/S;
блок про мощность;
блок “когда вертикальный радиатор не подходит”;
FAQ;
CTA.
```

Дочерние статьи второго уровня:

```txt
/info/vertikalnye-dizayn-radiatory-velar-dlya-kvartiry
/info/vertikalnyy-radiator-dlya-uzkoy-steny
/info/kak-rasschitat-moshchnost-vertikalnogo-dizayn-radiatora
```

## `/info/horizontal-designer-radiators`

Добавить:

```txt
таблицу сценариев: под окно / кухня / гостиная / панорамное окно;
ссылку на /design;
ссылки на горизонтальные модели;
сравнение с трубчатыми радиаторами;
FAQ.
```

Дочерние статьи второго уровня:

```txt
/info/gorizontalnye-dizayn-radiatory-pod-okno
/info/gorizontalnyy-dizayn-radiator-ili-trubchatyy
/info/dizayn-radiator-dlya-kuhni-gostinoy
```

## `/info/tsvet-interera-i-radiator`

Добавить:

```txt
примеры: белый, черный, графит, цвет стены, акцентный цвет;
ссылку на /design;
ссылку на черные дизайн-радиаторы;
FAQ;
CTA.
```

Дочерние статьи второго уровня:

```txt
/info/radiator-v-cvet-steny-ili-akcentnyy
/info/belyy-chernyy-ili-cvetnoy-dizayn-radiator
/info/radiatory-ral-v-interere
```

---

# 10. Правила перелинковки

## Из коммерческой страницы

```txt
на Tier-1 статьи;
на самые важные Tier-2 статьи;
на модели;
на смежные категории;
на заявку.
```

Пример:

```txt
/columns
→ /info/tube-radiators
→ /info/steel-tube-radiators-guide
→ /info/column-radiators-pros-cons
→ /info/trubchatye-radiatory-velar-dlya-kvartiry
→ /request
```

## Из Tier-1 статьи

```txt
вверх на коммерческий хаб;
на 3-6 моделей или товарных страниц;
на 3-5 дочерних Tier-2;
на заявку.
```

Пример:

```txt
/info/kak-vybirat-vnutripolnye-konvektory
→ /convector
→ /model/kwh
→ /model/kwhv
→ /model/kwhv24
→ /info/kwh-kwhv-kwhv24-chto-vybrat
→ /request
```

## Из Tier-2 статьи

```txt
вверх на Tier-1;
вверх на коммерческий хаб;
на сравниваемые модели;
на заявку.
```

Пример:

```txt
/info/kwh-kwhv-kwhv24-chto-vybrat
→ /convector
→ /info/kak-vybirat-vnutripolnye-konvektory
→ /model/kwh
→ /model/kwhv
→ /model/kwhv24
→ /request
```

---

# 11. Шаблон статьи под AI-выдачу

```md
---
title: 'H1 с точным интентом'
metaTitle: '40-60 знаков, ключ входит естественно'
metaDescription: '140-160 знаков, конкретный ответ и польза страницы'
---

Первый абзац на 4-5 предложений сразу отвечает на вопрос. Ключ входит в первое предложение, но не повторяется механически.

## Быстрый выбор

| Ситуация | Что выбрать | Почему |
|---|---|---|

## Подробное объяснение

...

## Какие модели Velar подходят

- Модель 1
- Модель 2
- Модель 3

## Когда лучше выбрать другую серию

...

## Частые ошибки

...

## FAQ

### Вопрос 1
Ответ.

### Вопрос 2
Ответ.

## CTA

Нужен подбор под конкретное помещение? Отправьте размеры, фото стены и параметры системы отопления - подберем модель, мощность и подключение.
```

H1 выводится шаблоном страницы из поля `title`, поэтому внутри MDX нельзя добавлять второй H1 или дублирующий первый H2. Основной текст начинается с answer-first абзаца, после него идет сводная таблица, затем H2 и H3. Смысловые абзацы состоят минимум из 4 предложений; списки используются только для параметров, рисков, шагов и сценариев, где перечисление действительно ускоряет чтение. В текст не попадают TODO, комментарии редактора, формулировки задания, указания по SEO, заглушки для изображений и другие следы производственного процесса.

## ТЗ на Schema.org для статей

Каждая статья должна выводить `Article` в JSON-LD с полями `headline`, `description`, `mainEntityOfPage`, `url`, `author`, `publisher`, `inLanguage`, `image`, `datePublished` и `dateModified`. Значения заголовка, описания, canonical URL, изображения и дат берутся из той же записи коллекции, которая формирует видимую страницу. Canonical должен вести на конечный URL статьи со слешем, а `dateModified` меняется только после содержательного обновления материала. Хлебные крошки формируются общим шаблоном как `BreadcrumbList`, поэтому второй набор крошек в MDX не добавляется.

Если на странице есть видимый раздел FAQ, дополнительно выводится `FAQPage`. Каждый видимый вопрос становится `Question`, ответ - `acceptedAnswer` типа `Answer`, а тексты в JSON-LD должны совпадать с содержанием страницы по смыслу и фактам. Разметка не добавляется к статье без реального FAQ и не создается из скрытого от пользователя текста. Наличие валидного `FAQPage` помогает поисковым и AI-системам понимать структуру материала, но не гарантирует расширенный сниппет в Google.

В реализации коллекция статей получает необязательное поле `faq` с массивом `{ question, answer }`. Шаблон `/info/[article]` формирует отдельный JSON-LD блок `FAQPage` только при непустом массиве, а `Article` остается самостоятельной сущностью. Перед публикацией нужно собрать production HTML, извлечь оба JSON-LD блока, проверить JSON, абсолютные URL, совпадение FAQ с видимым текстом и отсутствие разметки `Product` или `Offer` на информационной странице.

---

# 12. Приоритет работ

## Этап 1. Углубить текущие Tier-1

Сначала обновить существующие статьи, которые уже входят в кластеры:

```txt
/info/tube-radiators
/info/steel-tube-radiators-guide
/info/column-radiators-pros-cons
/info/kak-vybirat-vnutripolnye-konvektory
/info/panoramnie-okna
/info/floor-design-radiators
/info/iron-cast-radiators
/info/vertical-designer-radiators
/info/horizontal-designer-radiators
/info/wall
/info/tsvet-interera-i-radiator
```

В каждую добавить:

```txt
1. Answer-first блок
2. Таблицу выбора
3. Ссылку на коммерческий хаб
4. Ссылки на модели / категории
5. Ссылки на дочерние Tier-2
6. FAQ
7. CTA на расчет
```

## Этап 2. Создать самые важные Tier-1

```txt
/info/kakoy-radiator-vybrat-dlya-kvartiry - добавлено 2026.08.16
/info/kakoy-radiator-vybrat-dlya-chastnogo-doma - добавлено 2026.08.16
```

Общие брендовые обзоры дизайн-радиаторов, конвекторов, напольных и ретро-моделей исключены из плана отдельных URL. Эти интенты уже должны закрывать соответствующие коммерческие хабы `/design`, `/convector`, `/floor` и `/retro`. Новая Tier-1 создается только при наличии отдельного интента, который нельзя полноценно закрыть на money page без ухудшения ее коммерческой структуры.

## Этап 3. Создать приоритетные Tier-2

```txt
/info/trubchatye-radiatory-velar-dlya-kvartiry - добавлено 2026.07.20
/info/trubchatye-radiatory-dlya-centralnogo-otopleniya
/info/2-3-4-trubchatye-radiatory-chto-vybrat - добавлено 2026.06.25
/info/kwh-kwhv-kwhv24-chto-vybrat - добавлено 2026.07.20
/info/konvektor-dlya-panoramnogo-okna
/info/napolnyy-radiator-ili-vnutripolnyy-konvektor - не создавать, интент закрыт существующими страницами
/info/nostalgia-ili-historic-chto-vybrat
/info/p30-p60-q40-r32-chto-vybrat - не создавать, интент закрывает /design
/info/sravnenie-modeley-dizayn-radiatorov-velar - не создавать, интент закрывает /design
/info/kak-podgotovit-dannye-dlya-rascheta-radiatora - добавлено 2026.08.05
```

## Этап 4. После статей — усилить коммерческие страницы

```txt
/columns
/floor
/convector
/retro
/design
```

Для каждой:

```txt
- добавить блок “Полезные статьи”;
- добавить ссылки на дочерние статьи;
- добавить FAQ;
- добавить CTA;
- добавить ссылки на модели;
- добавить сценарии выбора.
```

---

# 13. Самый короткий приоритетный список

## Очень высокий приоритет

```txt
/info/tube-radiators — углубить
/info/steel-tube-radiators-guide — углубить
/info/kak-vybirat-vnutripolnye-konvektory — углубить
/info/vertical-designer-radiators — углубить
/info/horizontal-designer-radiators — углубить
/info/dizayn-radiatory-velar-kak-vybrat - не создавать, интент закрывает /design
/info/kwh-kwhv-kwhv24-chto-vybrat - добавлено 2026.07.20
/info/trubchatye-radiatory-velar-dlya-kvartiry - добавлено 2026.07.20
/info/2-3-4-trubchatye-radiatory-chto-vybrat - добавлено 2026.06.25
/info/sravnenie-modeley-dizayn-radiatorov-velar — не создавать, интент закрывает /design
```

## Высокий приоритет

```txt
/info/floor-design-radiators — углубить
/info/iron-cast-radiators — углубить
/info/panoramnie-okna — углубить
/info/napolnyy-radiator-ili-vnutripolnyy-konvektor — не создавать, интент закрывают /floor и /info/chto-postavit-pered-panoramnym-oknom
/info/retro-radiatory-velar-obzor — добавить
/info/nostalgia-ili-historic-chto-vybrat — добавить
/info/p30-p60-q40-r32-chto-vybrat — не создавать, сравнение серий закрывает /design
/info/kakoy-radiator-vybrat-dlya-kvartiry — добавлено 2026.08.16
```

## Средний приоритет

```txt
/info/napolnye-radiatory-velar-obzor
/info/chto-postavit-pered-panoramnym-oknom
/info/radiator-v-cvet-steny-ili-akcentnyy
/info/belyy-chernyy-ili-cvetnoy-dizayn-radiator
/info/dizayn-radiator-s-tenom-kogda-nuzhen - добавлено 2026.08.23
/info/kak-podgotovit-dannye-dlya-rascheta-radiatora - добавлено 2026.08.05
/info/kak-uhazhivat-za-trubchatym-radiatorom
```

---

# 14. Итог

Сейчас у VelarShop уже есть база: коммерческие страницы, категории и много полезных статей. Но статьи пока не работают как единая система вокруг money pages.

Главная задача — превратить структуру:

```txt
коммерческая страница + набор отдельных статей
```

в структуру:

```txt
money page
→ Tier-1 гиды и крупные сценарии
→ Tier-2 сравнения, технические разборы и возражения
→ обратно в money page / модель / заявку
```

Самые важные направления роста:

1. трубчатые радиаторы Velar;
2. внутрипольные конвекторы Velar;
3. дизайн-радиаторы Velar;
4. напольные решения для панорамных окон;
5. ретро-радиаторы;
6. общие статьи выбора радиаторов для квартиры, дома и дизайн-проектов.

Главная идея: каждая статья должна не просто отвечать на вопрос, а вести пользователя к подбору конкретного решения Velar.
