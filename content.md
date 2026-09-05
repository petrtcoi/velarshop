# SEO-карта кластеров VelarShop

Документ сделан как рабочий план развития коммерческого SEO для velarshop.ru. Логика такая же, как в плане для k-radiator: не просто список статей, а структура `коммерческая страница → tier-1 → tier-2`, где каждая статья усиливает конкретную money page и возвращает пользователя к категории, модели, расчету или заявке.

## Перепроверка по Google Search Console от 2026-09-05

План дополнительно сверен с отчетом Google Search Console по домену `velarshop.ru` за последние 3 месяца (04.06.2026-03.09.2026). За период сайт получил 2,68 тыс. кликов и 110 тыс. показов; средний CTR составил 2,4%, средняя позиция — 8,3. Главный вывод: перед расширением контента нужно исправить уже видимое смешение информационных и коммерческих интентов.

### Что исправить до публикации новых статей

1. Консолидировать две статьи про сравнение трубчатых и панельных радиаторов. Основным URL оставить `/info/trubchatye-radiatory-vs-panelnye`: 643 показа, 6 кликов, средняя позиция 5,3. Полезные уникальные фрагменты со страницы `/info/trubchatyy-radiator-ili-panelnyy` (87 показов, 0 кликов, позиция 6,7) перенести на основной URL, все внутренние ссылки обновить, со второго URL поставить 301 redirect.
2. Развести `/columns` и `/info/column-radiators-pros-cons`. По точному запросу «трубчатые радиаторы» информационная статья получила 796 из 797 показов при средней позиции 16,7, а `/columns` — только 2 показа. `/columns` должен быть основной страницей для общих и коммерческих запросов, а статья — для формулировок «плюсы и минусы», «преимущества и недостатки», «стоит ли выбирать». Не создавать рядом еще один общий гид.
3. Усилить `/floor`, а не создавать новые общие статьи про напольные радиаторы у панорамных окон. По точному запросу «напольные радиаторы для панорамных окон» `/floor` получил 125 показов и 6 кликов при позиции 11,9, а `/info/radiatory-dlya-panoramnykh-okon-tipy-osobennosti` — 235 показов и 3 клика при позиции 8,3. Новый близкий URL только усилит каннибализацию.
4. Усилить `/convector` под коммерческий запрос «внутрипольные конвекторы». Сейчас `/convector` имеет 23 показа и позицию 15,8, `/info/convectors` — 35 показов и позицию 52. Общие обзоры конвекторов не добавлять; существующую статью `/info/convectors` сузить до объяснительного интента, а выбор и покупку закрепить за `/convector`.
5. По запросу «дизайнерские радиаторы» основная страница уже выбрана правильно: `/design` получил 579 показов и 14 кликов при позиции 10,0. Не создавать общий обзор дизайн-радиаторов; новые материалы должны закрывать только узкие сценарии.

### Следующие три самостоятельных материала

```txt
1. /info/trubchatye-radiatory-v-interere — публиковать первой
2. /info/radiator-dlya-spalni — публиковать второй
3. /info/matovyy-ili-glyantsevyy-radiator — публиковать третьей
```

У этих страниц разные интенты:

- `/info/trubchatye-radiatory-v-interere` — выбор расположения, высоты, цвета и визуальной роли трубчатого радиатора; точный запрос уже дал 27 показов, но сейчас ведет на нерелевантную статью о плюсах и минусах;
- `/info/radiator-dlya-spalni` — сценарий конкретной комнаты: мощность, место установки, терморегулирование, тишина и уход; не дублирует общие гиды для квартиры и частного дома;
- `/info/matovyy-ili-glyantsevyy-radiator` — выбор именно типа заводского покрытия: гладкое матовое, глянцевое или текстурное; уход, блики, следы, заводская окраска и влияние финиша на теплоотдачу. Статья не должна повторять подбор оттенка из `/info/colors`, психологию цвета или материал о черных радиаторах. Короткий FAQ про матовую и глянцевую отделку на `/info/colors` нужно оставить как краткий ответ и связать ссылкой с новым подробным материалом.

Первые две статьи — ближайшая очередь. Третья публикуется следом и связывает кластеры `/design`, `/columns` и `/retro` без создания еще одного общего каталожного обзора.

## Аудит плана и фактической реализации от 2026-07-20

Проверка репозитория показала, что кластерная логика в целом верная, но исходный план смешивал новые информационные страницы с интентами, которые уже подробно закрыты коммерческими хабами. Страницы `/design`, `/convector`, `/floor` и `/retro` уже содержат выбор серий, сценарии, FAQ и ссылки на модели. Поэтому статьи с названиями вида `*-velar-obzor` или общий гид `dizayn-radiatory-velar-kak-vybrat` не следует создавать автоматически: они могут конкурировать с money page по одному запросу и размывать внутренний вес. Вместо них приоритет получают сравнительные и сценарные материалы с отдельным интентом, а обзор линейки остается частью коммерческого хаба.

Фактическая проверка также выявила две страницы с риском каннибализации: `/info/trubchatye-radiatory-vs-panelnye` и `/info/trubchatyy-radiator-ili-panelnyy`, а также несколько общих материалов про выбор и монтаж внутрипольных конвекторов. Анализ Search Console выполнен 2026-09-05: сильнейшим выбран `/info/trubchatye-radiatory-vs-panelnye`, полезный текст и ссылки нужно перенести на него, а второй URL направить на основной через 301 redirect. Дополнительные близкие сравнения до консолидации создавать не нужно.

Исправлен фактический URL расчета для угловой комнаты: в коллекции статья публикуется как `/info/raschet-radiatorov-dlya-uglovoy-komnaty`, хотя имя исходного файла отличается. Канонический URL низковольтного конвектора - `/model/kwhv24`; путь `/convector/kwhv-24v` является переадресацией и не должен использоваться для внутренней перелинковки. Статус `есть` далее означает наличие конечного URL, а не совпадение имени файла с планом.

В первую очередь добавлены два материала с разными и коммерчески понятными интентами: сравнение `/info/kwh-kwhv-kwhv24-chto-vybrat` и сценарный гид `/info/trubchatye-radiatory-velar-dlya-kvartiry`. Первый получает входящие ссылки из `/convector` и главного гида по выбору конвекторов, второй - из `/columns`, `/info/tube-radiators` и `/info/column-radiators-pros-cons`. Обе статьи возвращают пользователя к коммерческому хабу, конкретным моделям, связанным техническим материалам и форме расчета.

Проверка от 2026-08-16 показала, что отдельные URL `/info/sravnenie-modeley-dizayn-radiatorov-velar` и `/info/napolnyy-radiator-ili-vnutripolnyy-konvektor` пока создавать не нужно. Первый интент подробно закрывает коммерческая страница `/design` с таблицей серий и блоком «Какую серию Velar выбрать», второй - страница `/floor`, статья `/info/chto-postavit-pered-panoramnym-oknom` и сценарный гид по конвекторам. Вместо конкурирующих страниц добавлены две самостоятельные Tier-1 статьи: `/info/kakoy-radiator-vybrat-dlya-kvartiry` и `/info/kakoy-radiator-vybrat-dlya-chastnogo-doma`. Они разделены по типу системы и ведут в коммерческие разделы `/columns`, `/design`, `/floor`, `/convector`, `/retro` и на `/request`. Входящие ссылки добавлены из этих коммерческих разделов, `/info/oshibki-pri-vybore-radiatorov`, `/info/radiator-types`, `/info/kak-podgotovit-dannye-dlya-rascheta-radiatora` и общего списка материалов.

Проверка от 2026-08-23 выделила два следующих самостоятельных интента без прямого дубля в коллекции: `/info/nizkie-trubchatye-radiatory-pod-okno` и `/info/dizayn-radiator-s-tenom-kogda-nuzhen`. Первый углубляет короткие упоминания низких моделей в общем трубчатом гиде и ведет к `/columns`, второй раскрывает отдельный режим эксплуатации, а не повторяет коммерческий выбор серий на `/design`. Входящие ссылки установлены из коммерческих хабов и соответствующих Tier-1 статей, исходящие - на модели, расчет, альтернативные решения и `/request`.

## Перепроверка приоритетов от 2026-08-30

После сверки плана с фактическими статьями, коммерческими страницами и текущей поисковой выдачей выбраны четыре следующих материала. У каждого есть отдельный коммерческий микрозапрос, понятная роль в кластере и маршрут к заявке:

```txt
1. /info/trubchatye-radiatory-dlya-chastnogo-doma — добавлено 2026.08.30
2. /info/kak-podobrat-dizayn-radiator-pod-gotovye-vyvody-trub — добавлено 2026.08.30
3. /info/raschet-sekciy-chugunnogo-retro-radiatora — добавлено 2026.08.30
4. /info/kak-vybrat-reshetku-dlya-vnutripolnogo-konvektora — добавлено 2026.08.30
```

Порядок публикации: сначала статьи 1 и 2 как наиболее близкие к выбору и замене отопительного прибора, затем расчет ретро-радиатора, затем выбор решетки конвектора. Статьи должны содержать не общий обзор категории, а таблицу принятия решения, фактические данные моделей Velar, список исходных данных для подбора и один основной CTA «Получить расчет».

Не создавать отдельные страницы про трубчатые радиаторы для центрального отопления, конвектор для панорамного окна, обзор KWH/KWHV/KWHV 24V, обзор ретро-линейки Velar, вертикальный радиатор для узкой стены, горизонтальный дизайн-радиатор под окно и отдельный разбор плоского/квадратного/круглого профиля. Эти интенты уже закрыты существующими статьями или коммерческими страницами. Их развитие должно идти через обновление текущего URL, а не через новый документ.

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
    │   ├── [добавлено 2026.08.30] /info/trubchatye-radiatory-dlya-chastnogo-doma
    │   └── [не создавать отдельно: интент закрывает статья для квартиры] /info/trubchatye-radiatory-dlya-centralnogo-otopleniya
    │
    ├── [есть / углубить] /info/steel-tube-radiators-guide
    │   ├── [есть] /info/raschet-radiatorov-dlya-uglovoy-komnaty
    │   ├── [есть] /info/teplootdacha-radiatora-delta-t-chto-eto
    │   ├── [есть] /info/zamena-panelnyh-radiatorov-na-trubchatye-velar
    │   ├── [не создавать отдельно: усилить расчет в текущем техническом гиде] /info/kak-rasschitat-trubchatyy-radiator-velar
    │   ├── [2026.06.25] /info/2-3-4-trubchatye-radiatory-chto-vybrat
    │   └── [добавлено 2026.08.23] /info/nizkie-trubchatye-radiatory-pod-okno
    │
    ├── [2026.07.08 - updated] /info/column-radiators-pros-cons
    │   ├── [есть] /info/zamena-panelnyh-radiatorov-na-trubchatye-velar
    │   ├── [оставить основным] /info/trubchatye-radiatory-vs-panelnye
    │   ├── [объединить и поставить 301] /info/trubchatyy-radiator-ili-panelnyy
    │   ├── [добавить] /info/trubchatyy-radiator-ili-dizayn-radiator
    │   └── [добавить 2026.09.05] /info/trubchatye-radiatory-v-interere
    │
    └── [есть / углубить] /info/kak-chistit-trubchatyj-radiator-otopleniya
        ├── [есть] /info/termostats
        ├── [есть] /info/termostat-installation-errors
        ├── [не создавать отдельно: закрыто статьями о чистке и ошибках эксплуатации] /info/kak-uhazhivat-za-trubchatym-radiatorom
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

### `[добавлено 2026.08.30] /info/trubchatye-radiatory-dlya-chastnogo-doma`

Tier-2. О выборе именно трубчатого радиатора для частного дома: автономная и низкотемпературная система, фактическая мощность при рабочем ΔT, большие помещения, подключение, балансировка и сочетание с теплыми полами. Не повторяет общий материал `/info/kakoy-radiator-vybrat-dlya-chastnogo-doma`, который сравнивает разные типы приборов.

Связи: `/columns`, `/info/kakoy-radiator-vybrat-dlya-chastnogo-doma`, `/info/teplootdacha-radiatora-delta-t-chto-eto`, `/info/2-3-4-trubchatye-radiatory-chto-vybrat`, `/request`.

### `[не создавать отдельно] /info/trubchatye-radiatory-dlya-centralnogo-otopleniya`

Интент уже подробно закрыт на `/info/trubchatye-radiatory-velar-dlya-kvartiry`: там есть отдельные блоки про рабочее и опрессовочное давление, требования управляющей организации, разводку и монтаж. Дополнительный URL будет конкурировать с этой статьей. Усиливать нужно существующий материал и его FAQ.

Связи: `/columns`, `/info/trubchatye-radiatory-velar-dlya-kvartiry`, `/info/zamena-panelnyh-radiatorov-na-trubchatye-velar`, `/request`.

### `/info/2-3-4-trubchatye-radiatory-chto-vybrat`

Tier-2. Как выбрать количество труб: глубина, мощность, внешний вид, где лучше 2-трубчатый, 3-трубчатый или 4-трубчатый радиатор.

Связи: `/columns`, модели 2030/3030/4030/2057/3057/4057, `/request`.

### `[добавлено 2026.08.23] /info/nizkie-trubchatye-radiatory-pod-okno`

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
    │   ├── [не создавать: интент закрывают /floor и /info/floor-design-radiators] /info/napolnye-radiatory-velar-obzor
    │   ├── [не создавать: усиливает каннибализацию /floor и статьи о панорамных окнах] /info/napolnye-radiatory-dlya-panoramnyh-okon
    │   ├── [не создавать - каннибализация] /info/napolnyy-radiator-ili-vnutripolnyy-konvektor
    │   └── [не создавать: интент закрывает /info/floor-design-radiators] /info/napolnye-radiatory-v-interere
    │
    └── [есть / углубить] /info/radiatory-dlya-panoramnykh-okon-tipy-osobennosti
        ├── [2026.06.08] /info/chto-postavit-pered-panoramnym-oknom
        ├── [не создавать: сравнение уже есть в /info/chto-postavit-pered-panoramnym-oknom] /info/nizkiy-radiator-ili-konvektor
        └── [не создавать: интент закрыт статьями о панорамных окнах] /info/radiator-pered-oknom-v-pol
```

## Роли страниц

### `/floor`

Коммерческий хаб напольных радиаторов. Должен продавать не просто тип монтажа, а сценарии: панорамные окна, низкие подоконники, невозможность настенного монтажа, дизайнерский интерьер.

Связи: `/info/floor-design-radiators`, `/info/radiatory-dlya-panoramnykh-okon-tipy-osobennosti`, `/convector`, `/design`, `/request`.

### `/info/floor-design-radiators`

Tier-1. Уже есть статья про напольные дизайн-радиаторы. Ее нужно усилить как главный гид: когда нужен напольный радиатор, чем он отличается от настенного и внутрипольного конвектора, какие ограничения по монтажу.

Связи: `/floor`, `/convector`, `/info/radiatory-dlya-panoramnykh-okon-tipy-osobennosti`.

## Что не создавать отдельно

### `[не создавать] /info/napolnye-radiatory-velar-obzor`

Отдельный обзор повторит коммерческий хаб `/floor` и существующую статью `/info/floor-design-radiators`. Вместо нового URL нужно усилить `/floor` под выбор и покупку, а текущую статью оставить главным информационным гидом.

Связи: `/floor`, `/design`, `/convector`, `/request`.

### `[не создавать - каннибализация] /info/napolnyy-radiator-ili-vnutripolnyy-konvektor`

Сравнение двух решений уже есть в `/info/chto-postavit-pered-panoramnym-oknom` и материалах о панорамных окнах. Новый URL разделит один и тот же запрос между несколькими страницами.

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
    │   └── [не создавать отдельно: закрыто гидом и сценарной статьей] /info/vnutripolnyy-konvektor-dlya-kvartiry
    │
    ├── [2026.07.08 - updated] /info/panoramnie-okna
    │   ├── [есть] /info/teplovaya-zavesa-u-panoramnyh-okon
    │   ├── [есть] /info/vnutripolnye-konvektory-prinuditelnaia-vs-estestvennaia-konvekciia
    │   ├── [не создавать отдельно: прямой дубль /info/panoramnie-okna] /info/konvektor-dlya-panoramnogo-okna
    │   └── [не создавать отдельно: интент закрывает статья о тепловой завесе] /info/kak-ubrat-holod-ot-panoramnogo-okna
    │
    ├── [есть] /model/kwh
    │   ├── [есть] /info/convectors
    │   ├── [есть] /info/convectors-pros-cons
    │   └── [не создавать отдельно: интент закрывает /model/kwh] /info/velar-kwh-obzor
    │
    ├── [есть] /model/kwhv
    │   ├── [есть] /info/vnutripolnye-konvektory-s-ventilyatorom
    │   ├── [есть] /info/vnutripolnye-konvektory-prinuditelnaia-vs-estestvennaia-konvekciia
    │   └── [не создавать отдельно: интент закрывает /model/kwhv] /info/velar-kwhv-obzor
    │
    └── [есть] /model/kwhv24
        ├── [есть] /info/220v-vs-24v
        ├── [есть] /info/vnutripolnye-konvektory-s-ventilyatorom
        ├── [не создавать отдельно: интент закрывает /model/kwhv24] /info/velar-kwhv24-obzor
        └── [добавлено 2026.08.30] /info/kak-vybrat-reshetku-dlya-vnutripolnogo-konvektora
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

### `[не создавать отдельно] /info/konvektor-dlya-panoramnogo-okna`

Практический интент уже закрывает `/info/panoramnie-okna`, а выбор между естественной и принудительной конвекцией - отдельная существующая статья. Новый URL будет прямым семантическим дублем.

Связи: `/convector`, `/info/panoramnie-okna`, `/info/teplovaya-zavesa-u-panoramnyh-okon`.

### `[не создавать отдельно] /info/velar-kwh-obzor`

Модельный интент должен оставаться на `/model/kwh`. Информацию о сценариях естественной конвекции нужно усиливать в карточке модели и существующих сравнительных статьях.

Связи: `/model/kwh`, `/convector`, `/info/convectors-pros-cons`.

### `[не создавать отдельно] /info/velar-kwhv-obzor`

Модельный интент должен оставаться на `/model/kwhv`. Отдельная статья будет конкурировать с карточкой модели; информационный вопрос уже закрывает материал о конвекторах с вентилятором.

Связи: `/model/kwhv`, `/convector`, `/info/vnutripolnye-konvektory-s-ventilyatorom`.

### `[не создавать отдельно] /info/velar-kwhv24-obzor`

Модельный интент должен оставаться на `/model/kwhv24`, а отличие от 220V уже раскрыто на `/info/220v-vs-24v`. Новый обзорный URL не нужен.

Связи: `/model/kwhv24`, `/info/220v-vs-24v`, `/convector`.

### `[добавлено 2026.08.30] /info/kak-vybrat-reshetku-dlya-vnutripolnogo-konvektora`

Tier-2. Выбор видимой и функциональной части конвектора: алюминиевая или деревянная решетка, рулонное или линейное исполнение, направление ламелей, нагрузка, влажность, цвет, рамка и сочетание с напольным покрытием. Это самостоятельный товарный выбор, который не повторяет существующие статьи о мощности, типе конвекции, размерах ниши и монтаже.

Связи: `/convector`, `/model/kwh`, `/model/kwhv`, `/model/kwhv24`, `/info/vnutripolnye-konvektory-podbor-i-montazh`, `/request`.

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
    │   ├── [не создавать отдельно: интент закрывает /retro] /info/retro-radiatory-velar-obzor
    │   ├── [не создавать отдельно: усилить /retro и общий квартирный гид] /info/chugunnye-retro-radiatory-dlya-kvartiry
    │   ├── [не создавать отдельно: усилить /retro и общий гид для дома] /info/chugunnye-retro-radiatory-dlya-chastnogo-doma
    │   └── [добавлено 2026.08.30] /info/raschet-sekciy-chugunnogo-retro-radiatora
    │
    ├── [2026.06.08] /info/nostalgia-ili-historic-chto-vybrat
    │   ├── [2026.06.25] /info/radiatory-s-ornamentom-ili-bez
    │   ├── [не создавать: раздел есть в /info/chugunnye-retro-radiatory-v-interere] /info/retro-radiator-v-klassicheskom-interere
    │   └── [не создавать: раздел есть в /info/chugunnye-retro-radiatory-v-interere] /info/retro-radiator-v-loft-interere
    │
    └── [есть / углубить] /info/kak-otlichit-kachestvennoe-lite-radiatorov
        ├── [есть] /info/restavratsiya-chugunnyh-radiatorov
        ├── [не создавать отдельно: усилить текущую статью про ретро-радиаторы в интерьере] /info/patina-bronza-zoloto-serebro-dlya-retro-radiatorov
        └── [не создавать отдельно: усилить текущую статью про ретро-радиаторы в интерьере] /info/kak-vybrat-cvet-chugunnogo-radiatora
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

### `[не создавать отдельно] /info/retro-radiatory-velar-obzor`

Обзор линейки, моделей, высот, орнамента, цвета и патины уже является задачей коммерческого хаба `/retro`. Отдельная брендовая статья будет конкурировать с money page.

Связи: `/retro`, будущие `/retro/nostalgia`, `/retro/historic`, `/request`.

### `/info/nostalgia-ili-historic-chto-vybrat`

Tier-2. Сравнение двух основных ретро-серий.

Связи: `/retro`, `/retro/nostalgia`, `/retro/historic`, `/request`.

### `/info/radiatory-s-ornamentom-ili-bez`

Tier-2. Как выбрать между декоративным орнаментом и спокойной классикой.

Связи: `/retro`, `/info/chugunnye-retro-radiatory-v-interere`.

### `[не создавать отдельно] /info/patina-bronza-zoloto-serebro-dlya-retro-radiatorov`

Цвета, патина и декоративная отделка уже подробно относятся к интенту `/info/chugunnye-retro-radiatory-v-interere`. Нужные примеры следует добавить в существующую статью, не создавая еще одну страницу про тот же выбор.

Связи: `/retro`, `/info/chugunnye-retro-radiatory-v-interere`, `/request`.

### `[добавлено 2026.08.30] /info/raschet-sekciy-chugunnogo-retro-radiatora`

Tier-2. Коммерческий расчет: сколько секций Nostalgia или Historic нужно для комнаты, как учитывать паспортную теплоотдачу одной секции, ΔT, угловую комнату, высоту потолка, окна, нишу и потери от подключения. В существующих статьях расчет только упоминается, поэтому отдельный практический URL не дублирует `/retro` или общие материалы о чугуне.

Связи: `/retro`, модели Nostalgia и Historic, `/info/iron-cast-radiators`, `/info/teplootdacha-radiatora-delta-t-chto-eto`, `/request`.

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
    │   ├── [не создавать отдельно: интент закрывают /design/vertikalnye и текущие статьи] /info/vertikalnye-dizayn-radiatory-velar-dlya-kvartiry
    │   ├── [не создавать отдельно: интент закрывает /design/vertikalnye] /info/vertikalnyy-radiator-dlya-uzkoy-steny
    │   └── [не создавать отдельно: усилить /info/power и вертикальный хаб] /info/kak-rasschitat-moshchnost-vertikalnogo-dizayn-radiatora
    │
    ├── [есть / углубить] /info/horizontal-designer-radiators
    │   ├── [есть] /info/kak-podobrat-radiatory-dlya-kuhni
    │   ├── [не создавать отдельно: интент закрывает /design/gorizontalnye] /info/gorizontalnye-dizayn-radiatory-pod-okno
    │   ├── [добавить] /info/gorizontalnyy-dizayn-radiator-ili-trubchatyy
    │   └── [добавить] /info/dizayn-radiator-dlya-kuhni-gostinoy
    │
    ├── [2026.07.08] /info/wall
    │   ├── [есть] /info/vertical-designer-radiators
    │   ├── [есть] /info/horizontal-designer-radiators
    │   ├── [добавить позже] /info/nastennyy-ili-napolnyy-dizayn-radiator
    │   ├── [не создавать в общей формулировке] /info/dizayn-radiator-vmesto-obychnoi-batarei
    │   └── [добавлено 2026.08.30] /info/kak-podobrat-dizayn-radiator-pod-gotovye-vyvody-trub
    │
    ├── [есть / углубить] /info/tsvet-interera-i-radiator
    │   ├── [есть] /info/chernye-dizainerskie-radiatory-otopleniya
    │   ├── [не создавать отдельно: интент закрывает /info/tsvet-interera-i-radiator] /info/radiator-v-cvet-steny-ili-akcentnyy
    │   ├── [не создавать отдельно: интент закрывают статьи о цвете и черных радиаторах] /info/belyy-chernyy-ili-cvetnoy-dizayn-radiator
    │   ├── [не создавать отдельно: интент закрывает /info/tsvet-interera-i-radiator] /info/radiatory-ral-v-interere
    │   └── [добавить 2026.09.05] /info/matovyy-ili-glyantsevyy-radiator
    │
    └── [не создавать отдельно: интент закрывает /design] /info/dizayn-radiatory-velar-kak-vybrat
        ├── [не создавать - каннибализация] /info/p30-p60-q40-r32-chto-vybrat
        ├── [не создавать отдельно: дубль /info/forma-trub-dizayn-radiatorov] /info/ploskiy-kvadratnyy-kruglyy-profil-radiatora
        ├── [добавлено 2026.08.23] /info/dizayn-radiator-s-tenom-kogda-nuzhen
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

### `[не создавать отдельно] /info/ploskiy-kvadratnyy-kruglyy-profil-radiatora`

Интент уже закрывает `/info/forma-trub-dizayn-radiatorov`. Таблицу плоского, квадратного, круглого и овального профиля нужно добавить в существующую статью, сохранив один URL.

Связи: `/info/forma-trub-dizayn-radiatorov`, `/design`, серии P/Q/R.

### `[добавлено 2026.08.23] /info/dizayn-radiator-s-tenom-kogda-nuzhen`

Tier-2. Когда нужен электрический ТЭН в дизайнерском радиаторе, ограничения, сезонное использование, ванная/прихожая/кухня.

Связи: `/design`, модельные страницы с возможностью ТЭНа, `/request`.

### `[добавлено 2026.08.30] /info/kak-podobrat-dizayn-radiator-pod-gotovye-vyvody-trub`

Tier-2. Сценарий замены после разведения труб или в готовом ремонте: какие размеры снять, как проверить межосевое расстояние, когда сохранить боковое подключение, когда возможно нижнее, как учесть термовентиль, габариты арматуры и фактическую мощность. Узкая постановка не конкурирует с каталогом `/design`, который отвечает на запрос выбора категории и серии.

Связи: `/design`, `/design/vertikalnye`, `/design/gorizontalnye`, подходящие модельные страницы, `/info/kak-podgotovit-dannye-dlya-rascheta-radiatora`, `/request`.

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
    ├── [не создавать: интент закрывает /info/bezopasnost-radiatorov-dlya-detej] /info/radiator-dlya-detskoy-komnaty
    ├── [добавить 2026.09.05] /info/radiator-dlya-spalni
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
/info/2-3-4-trubchatye-radiatory-chto-vybrat - добавлено 2026.06.25
/info/kwh-kwhv-kwhv24-chto-vybrat - добавлено 2026.07.20
/info/trubchatye-radiatory-dlya-chastnogo-doma - добавлено 2026.08.30
/info/kak-podobrat-dizayn-radiator-pod-gotovye-vyvody-trub - добавлено 2026.08.30
/info/raschet-sekciy-chugunnogo-retro-radiatora - добавлено 2026.08.30
/info/kak-vybrat-reshetku-dlya-vnutripolnogo-konvektora - добавлено 2026.08.30
/info/trubchatye-radiatory-dlya-centralnogo-otopleniya - не создавать, интент закрывает статья для квартиры
/info/konvektor-dlya-panoramnogo-okna - не создавать, прямой дубль /info/panoramnie-okna
/info/napolnyy-radiator-ili-vnutripolnyy-konvektor - не создавать, интент закрыт существующими страницами
/info/nostalgia-ili-historic-chto-vybrat - добавлено 2026.06.08
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
/info/trubchatye-radiatory-v-interere — новый отдельный интерьерный интент; публиковать первой
/info/radiator-dlya-spalni — отдельный комнатный сценарий; публиковать второй
```

## Высокий приоритет

```txt
/info/matovyy-ili-glyantsevyy-radiator — отдельный интент покрытия и ухода; публиковать третьей
```

## До новых публикаций

```txt
/info/trubchatye-radiatory-vs-panelnye — оставить основным сравнительным URL
/info/trubchatyy-radiator-ili-panelnyy — объединить с основным URL и поставить 301
/columns — усилить под общий коммерческий запрос «трубчатые радиаторы»
/info/column-radiators-pros-cons — сузить под «плюсы и минусы», не под общий запрос
/floor — усилить под коммерческий запрос о напольных радиаторах для панорамных окон
/convector — усилить под коммерческий запрос «внутрипольные конвекторы»
```

## Сначала обновить существующие URL, не создавать новые

```txt
/info/trubchatye-radiatory-velar-dlya-kvartiry — усилить блок о центральном отоплении
/info/steel-tube-radiators-guide — усилить универсальный расчет
/info/panoramnie-okna — сохранить главным URL про конвектор у панорамного окна
/info/forma-trub-dizayn-radiatorov — добавить сравнительную таблицу профилей
/design/vertikalnye — усилить выбор для узкой стены и расчет мощности
/design/gorizontalnye — усилить выбор радиатора под окно
/retro — сохранить обзор линейки Nostalgia/Historic на коммерческой странице
/model/kwh, /model/kwhv, /model/kwhv24 — развивать модельный интент в карточках, не в обзорах
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
