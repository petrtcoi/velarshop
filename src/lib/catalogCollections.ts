import { columnColors } from '@entities/ColumnsColor'
import { designColors } from '@entities/DesignColor'
import { ironcastColors, ironcastColorTypeTitles } from '@entities/IroncastColor'
import { modelsJsonData, type ModelJson } from '@entities/Model'
import type { RadiatorJson } from '@entities/Radiator'
import { catalogNumber } from './catalogFacts'
import {
	interaxialCollections,
	type InteraxialCollectionConfig,
} from './interaxialCollections'

export type CatalogCollectionKind = 'interaxial' | 'height' | 'tube-count' | 'low-tubular' | 'convector' | 'color'

export type CollectionLink = {
	href: string
	label: string
}

/**
 * Подборка по цвету: id цвета из справочника для каждого типа моделей.
 * В подборку попадают только типы, для которых цвет задан. По этому id считается цена «от»
 * (как в корзине, getRadiatorTotalCost) и строится ссылка на модель `?color=<id>`.
 */
export type CollectionColorFilter = {
	/** id из columnColors */
	columns?: string
	/** id из designColors */
	design?: string
	/** id из ironcastColors */
	ironcast?: string
}

export type CatalogCollectionConfig = {
	kind: CatalogCollectionKind
	slug: string
	href: string
	title: string
	shortTitle: string
	seoTitle: string
	seoDescription: string
	intro: string
	eyebrow: string
	modelSectionTitle: string
	modelSectionIntro: string
	useCaseTitle: string
	useCaseText: string
	selectionNote: string
	parentHref: string
	parentLabel: string
	siblingGroup: 'interaxial' | 'height' | 'tubular' | 'convector' | 'color'
	height?: number
	spacing?: number
	tubeCount?: number
	modelIds?: string[]
	connectionLabel?: string
	image: string
	imageAlt: string
	colorFilter?: CollectionColorFilter
	/** Фото в первом экране подборки (справа на десктопе, под кнопками на телефоне). */
	heroImage?: { src: string; srcset?: string; width: number; height: number; alt: string }
	/** Фото строк вместо главного фото модели: по типу модели и точечно по id модели. */
	rowImageByType?: Partial<Record<ModelJson['type'], string>>
	rowImageByModel?: Record<string, string>
	/** Блок пояснений после списка моделей. */
	guideTitle?: string
	guide?: { title: string; text: string; links?: CollectionLink[] }[]
	useCaseLink?: CollectionLink
	/** Свои вопросы вместо типовых; в ответе можно использовать {priceFrom}. */
	faq?: { question: string; answer: string }[]
}

const heightCopy: Record<number, { intro: string; useCaseTitle: string; useCaseText: string; selectionNote: string }> = {
	300: {
		intro: 'Низкие радиаторы полной высотой 300 мм для помещений с низкими подоконниками, витражами и ограниченным местом по вертикали. В подборке показаны только реальные исполнения Velar высотой 300 мм.',
		useCaseTitle: 'Низкий радиатор высотой 300 мм',
		useCaseText: 'Такая высота подходит, когда между чистовым полом и подоконником мало места, но отопительный прибор должен оставаться доступным для уборки и обслуживания.',
		selectionNote: 'Полная высота 300 мм и межосевое расстояние 300 мм — разные параметры. До заказа проверьте оба размера и оставьте монтажные зазоры.',
	},
	400: {
		intro: 'Радиаторы полной высотой 400 мм для невысоких ниш, подоконников и спокойной горизонтальной установки. Сравните трубчатые и дизайнерские модели Velar с точной высотой корпуса 400 мм.',
		useCaseTitle: 'Компактная высота 400 мм',
		useCaseText: 'Высота 400 мм дает больше вариантов по мощности, чем совсем низкие приборы, и при этом подходит для большинства невысоких оконных зон.',
		selectionNote: 'Сравнивайте не только высоту, но и длину: необходимую мощность низкого радиатора часто набирают увеличением числа секций или длины корпуса.',
	},
	500: {
		intro: 'Радиаторы полной высотой 500 мм — распространенный размер для установки под окном и замены стандартных отопительных приборов. Здесь собраны трубчатые и дизайнерские модели Velar точной высотой 500 мм.',
		useCaseTitle: 'Стандартная высота радиатора 500 мм',
		useCaseText: 'Высота 500 мм удобна для типовых подоконных ниш и дает широкий выбор моделей, длины, мощности и вариантов подключения.',
		selectionNote: 'Не путайте полную высоту 500 мм с межосевым расстоянием: у радиатора высотой 500 мм расстояние между центрами подключений может быть другим.',
	},
	550: {
		intro: 'Радиаторы полной высотой 550 мм для стандартных оконных зон и проектов, где нужен баланс между компактностью и теплоотдачей. Подборка сформирована из фактических размеров Velar.',
		useCaseTitle: 'Радиатор высотой 550 мм под окно',
		useCaseText: 'Этот размер близок к привычному формату секционных батарей, но позволяет выбрать современную трубчатую или профильную модель.',
		selectionNote: 'До заказа измерьте расстояние от чистового пола до подоконника и вычтите рекомендуемые зазоры сверху и снизу.',
	},
	750: {
		intro: 'Радиаторы высотой 750 мм для высоких подоконников, свободных участков стены и помещений, где требуется больше теплоотдачи без чрезмерной длины прибора.',
		useCaseTitle: 'Увеличенная высота 750 мм',
		useCaseText: 'Модели высотой 750 мм занимают меньше стены по горизонтали, чем низкие радиаторы той же мощности, и подходят для жилых и коммерческих интерьеров.',
		selectionNote: 'Проверьте положение подводки и доступ к термостатической арматуре: высокая теплоотдача не отменяет требований к монтажным зазорам.',
	},
	1000: {
		intro: 'Вертикальные радиаторы высотой 1000 мм для простенков, узких стен и помещений, где под окном недостаточно места. В подборке есть трубчатые и дизайнерские модели Velar.',
		useCaseTitle: 'Вертикальный радиатор высотой 1000 мм',
		useCaseText: 'Метровая высота подходит для компактного вертикального размещения и остается визуально спокойнее очень высоких моделей 1800–2000 мм.',
		selectionNote: 'Для вертикального радиатора особенно важно проверить ширину свободной стены, направление подключения и мощность конкретной длины корпуса.',
	},
	1250: {
		intro: 'Вертикальные радиаторы высотой 1250 мм для узких участков стены, прихожих, кухонь-гостиных и проектов с нестандартной геометрией окон.',
		useCaseTitle: 'Вертикальный формат 1250 мм',
		useCaseText: 'Промежуточная высота помогает получить заметную теплоотдачу на узкой стене, не поднимая радиатор почти до потолка.',
		selectionNote: 'Согласуйте высоту установки с выключателями, мебелью, дверными наличниками и точками подключения до отделки стены.',
	},
	1500: {
		intro: 'Вертикальные радиаторы высотой 1500 мм для узких стен, простенков и современных интерьеров. Сравните трубчатые и профильные модели Velar по ширине, мощности и цене.',
		useCaseTitle: 'Высокий радиатор 1500 мм',
		useCaseText: 'Высота 1500 мм подходит, когда мощность нужно разместить на ограниченной ширине стены и использовать радиатор как аккуратный вертикальный элемент.',
		selectionNote: 'У высоких моделей заранее проверьте крепление, расстояния до пола и потолка, а также возможность подвести трубы без пересечения с мебелью.',
	},
	2000: {
		intro: 'Вертикальные радиаторы высотой 2000 мм для высоких помещений, узких простенков и выразительных интерьерных решений. В подборке собраны реальные исполнения Velar точной высотой 2 метра.',
		useCaseTitle: 'Вертикальный радиатор высотой 2 метра',
		useCaseText: 'Двухметровые модели экономят ширину стены и подходят для помещений с высокими потолками, входных зон и больших открытых пространств.',
		selectionNote: 'Проверьте высоту потолка, монтажные зазоры, несущую способность стены и схему подключения. Мощность зависит от ширины и конструкции модели.',
	},
	2250: {
		intro: 'Высокие вертикальные радиаторы 2250 мм для помещений с высокими потолками, узких стен и архитектурных проектов, где нужен вытянутый отопительный прибор.',
		useCaseTitle: 'Высокий радиатор 2250 мм',
		useCaseText: 'Такой формат используют в загородных домах, двухсветных пространствах, холлах и коммерческих интерьерах с большой высотой стен.',
		selectionNote: 'Перед заказом нужен точный монтажный план: учтите потолочные элементы, крепления, подводку и безопасный доступ к арматуре.',
	},
	2500: {
		intro: 'Вертикальные радиаторы высотой 2500 мм для двухсветных пространств, высоких холлов и нестандартных интерьеров. Подборка показывает доступные модели, размеры и мощность.',
		useCaseTitle: 'Радиатор высотой 2500 мм для высоких помещений',
		useCaseText: 'Высота 2,5 метра решает задачу отопления на очень узком участке стены и может стать частью архитектуры помещения.',
		selectionNote: 'Для таких моделей обязательны проверка стены и креплений, согласование подключения и расчет теплопотерь по проекту.',
	},
}

const heightCollections: CatalogCollectionConfig[] = Object.entries(heightCopy).map(([rawHeight, copy]) => {
	const height = Number(rawHeight)
	const vertical = height >= 1000
	const title = vertical ? `Вертикальные радиаторы высотой ${height} мм` : `Радиаторы высотой ${height} мм`

	return {
		kind: 'height',
		height,
		slug: `radiatory-vysotoy-${height}-mm`,
		href: `/collections/radiatory-vysotoy-${height}-mm`,
		title,
		shortTitle: `${height} мм`,
		seoTitle: `${title} — трубчатые и дизайнерские, цены от {priceFrom}`,
		seoDescription: `${title} Velar: подходящие трубчатые и дизайнерские модели, размеры, мощность, подключение и цены. Подбор и доставка по России.`,
		intro: copy.intro,
		eyebrow: 'Подбор по полной высоте',
		modelSectionTitle: `Модели высотой ${height} мм`,
		modelSectionIntro: `Показаны только конфигурации с точной полной высотой ${height} мм. На странице модели этот размер включится автоматически; останется выбрать длину, подключение и цвет.`,
		useCaseTitle: copy.useCaseTitle,
		useCaseText: copy.useCaseText,
		selectionNote: copy.selectionNote,
		parentHref: '/collections',
		parentLabel: 'Все подборки по высоте',
		siblingGroup: 'height',
		connectionLabel: 'по модели',
		image: `/images/models/${height >= 1500 ? 'p30v' : height >= 1000 ? 'q40v' : 'p60v'}/main.jpg`,
		imageAlt: `${title} Velar`,
	}
})

const tubeCopy: Record<number, { word: string; intro: string; useCaseText: string; note: string; image: string }> = {
	2: {
		word: 'Двухтрубчатые',
		intro: 'Двухтрубчатые радиаторы Velar — наиболее компактные по глубине стальные трубчатые модели. Подходят для узких ниш, проходов и помещений, где радиатор не должен сильно выступать от стены.',
		useCaseText: 'Два ряда труб дают небольшую глубину и спокойный внешний вид. Это практичный выбор для квартир, коридоров, кухонь и установки под окном.',
		note: 'Компактная глубина означает меньшую мощность секции по сравнению с трех- и четырехтрубчатыми моделями, поэтому внимательно рассчитайте число секций.',
		image: '/images/models/columns/main2b.jpg',
	},
	3: {
		word: 'Трехтрубчатые',
		intro: 'Трехтрубчатые радиаторы Velar сочетают умеренную глубину и повышенную теплоотдачу. Это универсальный вариант для квартир, частных домов и замены стандартных батарей.',
		useCaseText: 'Три ряда труб дают хороший баланс размеров и мощности, поэтому такие модели подходят для большинства жилых помещений.',
		note: 'Перед заказом сравните глубину прибора с подоконником и шторами, а количество секций подберите по теплопотерям комнаты.',
		image: '/images/models/columns/main3b.jpg',
	},
	4: {
		word: 'Четырехтрубчатые',
		intro: 'Четырехтрубчатые радиаторы Velar — глубокие и мощные трубчатые модели для помещений с заметными теплопотерями и ограниченной шириной установки.',
		useCaseText: 'Четыре ряда труб увеличивают теплоотдачу одной секции и помогают набрать нужную мощность при меньшем количестве секций.',
		note: 'Заранее проверьте глубину радиатора и расстояние до мебели, штор и прохода: четырехтрубчатые модели сильнее выступают от стены.',
		image: '/images/models/columns/main4b.jpg',
	},
	5: {
		word: 'Пятитрубчатые',
		intro: 'Пятитрубчатые радиаторы Velar — самые глубокие и теплоемкие модели трубчатой линейки. Их выбирают, когда нужна высокая мощность на коротком участке стены.',
		useCaseText: 'Пять рядов труб позволяют сократить длину радиатора при высокой расчетной мощности — например, в больших комнатах и холодных зонах.',
		note: 'Пятитрубчатый радиатор требует достаточно глубокой ниши. Проверьте выступ от стены, положение подоконника и свободный проход.',
		image: '/images/models/columns/vertical.jpg',
	},
}

const tubeModelIds: Record<number, string[]> = {
	2: ['2030', '2037', '2040', '2045', '2050', '2052', '2055', '2057', '2060', '2075', '2090', '2100', '2110', '2120', '2150', '2180', '2200'],
	3: ['3020', '3030', '3037', '3040', '3045', '3050', '3052', '3055', '3057', '3060', '3075', '3090', '3100', '3110', '3120', '3150', '3180', '3200'],
	4: ['4030', '4037', '4040', '4045', '4050', '4052', '4055', '4057', '4060', '4075', '4090', '4100', '4110', '4120', '4150', '4180', '4200'],
	5: ['5030', '5037', '5040', '5045', '5050', '5052', '5055', '5057', '5060', '5075', '5090', '5100', '5110', '5120', '5150', '5180', '5200'],
}

const tubeCollections: CatalogCollectionConfig[] = Object.entries(tubeCopy).map(([rawCount, copy]) => {
	const tubeCount = Number(rawCount)
	const lowerWord = copy.word.toLocaleLowerCase('ru-RU')
	return {
		kind: 'tube-count',
		tubeCount,
		modelIds: tubeModelIds[tubeCount],
		slug: `${tubeCount}-trubchatye-radiatory`,
		href: `/collections/${tubeCount}-trubchatye-radiatory`,
		title: `${copy.word} радиаторы`,
		shortTitle: `${copy.word} радиаторы`,
		seoTitle: `${copy.word} радиаторы (${tubeCount}-трубчатые) — цены от {priceFrom}`,
		seoDescription: `${copy.word} стальные трубчатые радиаторы Velar: модели разных высот, число секций, мощность, размеры и цены. Подбор и доставка по России.`,
		intro: copy.intro,
		eyebrow: 'Трубчатые радиаторы по глубине',
		modelSectionTitle: `${copy.word} модели Velar`,
		modelSectionIntro: `Каждая модель в подборке имеет ${tubeCount} ряда труб. Сравните высоту, глубину, количество секций, мощность и цену подходящих исполнений.`,
		useCaseTitle: `Когда выбирают ${lowerWord} радиатор`,
		useCaseText: copy.useCaseText,
		selectionNote: copy.note,
		parentHref: '/columns',
		parentLabel: 'Все трубчатые радиаторы',
		siblingGroup: 'tubular',
		connectionLabel: 'боковое или нижнее',
		image: copy.image,
		imageAlt: `${copy.word} трубчатый радиатор Velar`,
	}
})

function assertTubularCollectionCoverage() {
	const columnModelIds = modelsJsonData
		.filter(model => model.type === 'columns')
		.map(model => model.id)
	const groupedModelIds = tubeCollections.flatMap(collection => collection.modelIds ?? [])
	const duplicateModelIds = [...new Set(groupedModelIds.filter((id, index) => groupedModelIds.indexOf(id) !== index))]
	const missingModelIds = columnModelIds.filter(id => !groupedModelIds.includes(id))
	const unknownModelIds = groupedModelIds.filter(id => !columnModelIds.includes(id))

	if (!duplicateModelIds.length && !missingModelIds.length && !unknownModelIds.length) return

	const details = [
		duplicateModelIds.length ? `повторяются: ${duplicateModelIds.join(', ')}` : '',
		missingModelIds.length ? `не распределены: ${missingModelIds.join(', ')}` : '',
		unknownModelIds.length ? `не найдены среди трубчатых моделей: ${unknownModelIds.join(', ')}` : '',
	].filter(Boolean)

	throw new Error(`Некорректное распределение трубчатых моделей по числу труб — ${details.join('; ')}`)
}

assertTubularCollectionCoverage()

const lowTubularCollection: CatalogCollectionConfig = {
	kind: 'low-tubular',
	slug: 'nizkie-trubchatye-radiatory',
	href: '/collections/nizkie-trubchatye-radiatory',
	title: 'Низкие трубчатые радиаторы',
	shortTitle: 'Низкие трубчатые',
	seoTitle: 'Низкие трубчатые радиаторы под окно — цены от {priceFrom}',
	seoDescription: 'Низкие трубчатые радиаторы Velar высотой до 600 мм для низких подоконников и панорамных окон. Размеры, мощность, секции, подключение и цены.',
	intro: 'Низкие трубчатые радиаторы высотой до 600 мм подходят под невысокие подоконники, в ниши и вдоль окон, где стандартный высокий прибор не помещается. В подборке собраны только трубчатые модели Velar соответствующей высоты.',
	eyebrow: 'Трубчатые радиаторы по задаче',
	modelSectionTitle: 'Низкие трубчатые модели высотой до 600 мм',
	modelSectionIntro: 'Сравните модели по точной высоте, глубине, длине, мощности и цене. После перехода можно выбрать конкретное число секций и подключение.',
	useCaseTitle: 'Трубчатый радиатор под низкое окно',
	useCaseText: 'Невысокий прибор сохраняет свободный обзор и помещается там, где мало вертикального пространства. Требуемую мощность обычно набирают длиной и числом секций.',
	selectionNote: 'Оставьте зазор до пола и подоконника. Если высота ограничена особенно жестко, выбирайте отдельную подборку по точной полной высоте.',
	parentHref: '/columns',
	parentLabel: 'Все трубчатые радиаторы',
	siblingGroup: 'tubular',
	connectionLabel: 'боковое или нижнее',
	image: '/images/models/columns/main2b.jpg',
	imageAlt: 'Низкий трубчатый радиатор Velar под окно',
}

const convectorCollections: CatalogCollectionConfig[] = [
	{
		kind: 'convector',
		modelIds: ['kwh'],
		slug: 'vnutripolnye-konvektory-bez-ventilyatora',
		href: '/collections/vnutripolnye-konvektory-bez-ventilyatora',
		title: 'Внутрипольные конвекторы без вентилятора',
		shortTitle: 'Конвекторы без вентилятора',
		seoTitle: 'Внутрипольные конвекторы без вентилятора - каталог и цены',
		seoDescription: 'Внутрипольные конвекторы без вентилятора Velar KWH с естественной конвекцией: длина, глубина, высота, мощность, решетки и цены.',
		intro: 'Внутрипольные конвекторы без вентилятора работают за счет естественной конвекции, не требуют электропитания и подходят для спокойной тепловой завесы у панорамных окон.',
		eyebrow: 'Естественная конвекция',
		modelSectionTitle: 'Конвекторы Velar без вентилятора',
		modelSectionIntro: 'Модель KWH доступна в большом числе размеров по длине, ширине и глубине канала. Сравните исполнения по мощности и цене.',
		useCaseTitle: 'Когда выбирают конвектор без вентилятора',
		useCaseText: 'Такой вариант подходит, когда важны тишина, простая конструкция и отсутствие электропитания, а теплопотери помещения позволяют использовать естественную конвекцию.',
		selectionNote: 'Для больших панорамных окон мощности естественной конвекции может быть недостаточно. Перед заказом нужен расчет теплопотерь и проверка размеров ниши.',
		parentHref: '/convector',
		parentLabel: 'Все внутрипольные конвекторы',
		siblingGroup: 'convector',
		connectionLabel: 'естественная конвекция',
		image: '/images/models/kwh/main.jpg',
		imageAlt: 'Внутрипольный конвектор Velar KWH без вентилятора',
	},
	{
		kind: 'convector',
		modelIds: ['kwhv', 'kwhv24'],
		slug: 'vnutripolnye-konvektory-s-ventilyatorom',
		href: '/collections/vnutripolnye-konvektory-s-ventilyatorom',
		title: 'Внутрипольные конвекторы с вентилятором',
		shortTitle: 'Конвекторы с вентилятором',
		seoTitle: 'Внутрипольные конвекторы с вентилятором - каталог и цены',
		seoDescription: 'Внутрипольные конвекторы с вентилятором Velar KWHV и KWHV 24V для панорамных окон. Размеры, мощность, управление, решетки и цены.',
		intro: 'Внутрипольные конвекторы с вентилятором создают принудительную конвекцию и повышенную теплоотдачу у панорамных окон. В подборке представлены модели KWHV и низковольтная KWHV 24V.',
		eyebrow: 'Принудительная конвекция',
		modelSectionTitle: 'Конвекторы Velar с вентиляторами',
		modelSectionIntro: 'Сравните стандартную модель KWHV и версию KWHV 24V по питанию, размерам канала, мощности и стоимости.',
		useCaseTitle: 'Когда нужен внутрипольный конвектор с вентилятором',
		useCaseText: 'Принудительную конвекцию выбирают при больших площадях остекления, выраженных теплопотерях и необходимости быстро создавать тепловую завесу у стекла.',
		selectionNote: 'До монтажа предусмотрите питание, управление и доступ к вентиляторам для обслуживания. Мощность и длину прибора подбирают по расчету.',
		parentHref: '/convector',
		parentLabel: 'Все внутрипольные конвекторы',
		siblingGroup: 'convector',
		connectionLabel: 'принудительная конвекция',
		image: '/images/models/kwhv/main.jpg',
		imageAlt: 'Внутрипольный конвектор Velar KWHV с вентилятором',
	},
]

/* ------------------------------------------------------------------ */
/* Подборки по цвету                                                    */
/* ------------------------------------------------------------------ */
// Цены и наценки в текстах ниже берутся из справочников цветов (columnColors, designColors, ironcastColors).
// Тексты исходят из того, что глянец и мат одного цвета стоят одинаково: если это изменится, сборка упадет на проверке.

function findColor<T extends { id: string }>(list: T[], id: string, source: string): T {
	const color = list.find(item => item.id === id)
	if (!color) throw new Error(`catalogCollections: нет цвета ${id} в ${source}`)
	return color
}

function assertSameMultiplicate(colors: { id: string; multiplicate: number }[], reason: string) {
	if (colors.every(color => color.multiplicate === colors[0].multiplicate)) return
	throw new Error(`catalogCollections: у цветов ${colors.map(color => color.id).join(', ')} разная наценка, а текст подборки исходит из одинаковой (${reason})`)
}

function surchargePercent(multiplicate: number): number {
	return Math.round((multiplicate - 1) * 100)
}

/** «без наценки» или «наценка 20%». */
function surchargePhrase(multiplicate: number): string {
	const percent = surchargePercent(multiplicate)
	return percent === 0 ? 'без наценки' : `наценка ${percent}%`
}

function priceVsWhiteSentence(subject: string, color: { multiplicate: number }, white: { multiplicate: number }): string {
	const diff = Math.round((color.multiplicate / white.multiplicate - 1) * 100)
	if (diff === 0) return `${subject} стоит столько же, сколько белый того же размера в RAL 9016.`
	return `${subject} ${diff > 0 ? `дороже белого на ${diff}%` : `дешевле белого на ${-diff}%`}.`
}

function formatRub(value: number): string {
	return `${Math.round(value).toLocaleString('ru-RU')} ₽`
}

const columnWhiteGloss = findColor(columnColors, 'ral_9016_gloss', 'columnColors')
const columnWhiteMatte = findColor(columnColors, 'ral_9016_matte', 'columnColors')
const columnBlackGloss = findColor(columnColors, 'ral_9005_gloss', 'columnColors')
const columnBlackMatte = findColor(columnColors, 'ral_9005_matte', 'columnColors')
const columnAnyRal = findColor(columnColors, 'ral_any', 'columnColors')
const designWhiteGloss = findColor(designColors, 'ral_9016_gloss', 'designColors')
const designBlackGloss = findColor(designColors, 'ral_9005_gloss', 'designColors')
const designBlackMatte = findColor(designColors, 'ral_9005_matte', 'designColors')
const designAnyRal = findColor(designColors, 'ral_any', 'designColors')
const ironcastBlack = findColor(ironcastColors, 'emal_black', 'ironcastColors')

assertSameMultiplicate([columnWhiteGloss, columnWhiteMatte], 'белый глянец и мат по одной цене')
assertSameMultiplicate([columnBlackGloss, columnBlackMatte], 'черный глянец и мат по одной цене')
assertSameMultiplicate([designBlackGloss, designBlackMatte], 'черный глянец и мат по одной цене')

const ironcastBlackPerSection = formatRub(catalogNumber(ironcastBlack.price_section))
const ironcastBlackFinish = (
	ironcastColorTypeTitles.find(item => item.id === ironcastBlack.type_id)?.title ?? 'Эмаль'
).toLocaleLowerCase('ru-RU')

const columnPremiumPercents = columnColors
	.filter(color => color.multiplicate > columnAnyRal.multiplicate)
	.map(color => surchargePercent(color.multiplicate))
const columnPremiumRange = columnPremiumPercents.length
	? Math.min(...columnPremiumPercents) === Math.max(...columnPremiumPercents)
		? `${Math.min(...columnPremiumPercents)}%`
		: `${Math.min(...columnPremiumPercents)}-${Math.max(...columnPremiumPercents)}%`
	: ''

const blackColumnsSentence = priceVsWhiteSentence('Черный трубчатый радиатор', columnBlackMatte, columnWhiteGloss)
const blackDesignSentence = priceVsWhiteSentence('Черный дизайн-радиатор', designBlackMatte, designWhiteGloss)
const blackColumnsFree = columnBlackMatte.multiplicate === columnWhiteGloss.multiplicate

const linkBlackCollection: CollectionLink = { href: '/collections/chernye-radiatory-otopleniya', label: 'Черные радиаторы отопления' }
const linkWhiteCollection: CollectionLink = { href: '/collections/belye-trubchatye-radiatory', label: 'Белые трубчатые радиаторы' }
const linkMatteGloss: CollectionLink = { href: '/info/matovyy-ili-glyantsevyy-radiator', label: 'Матовый или глянцевый радиатор: что выбрать' }

const colorCollections: CatalogCollectionConfig[] = [
	{
		kind: 'color',
		colorFilter: { columns: columnBlackMatte.id, design: designBlackMatte.id, ironcast: ironcastBlack.id },
		slug: 'chernye-radiatory-otopleniya',
		href: linkBlackCollection.href,
		title: 'Черные радиаторы отопления',
		shortTitle: 'Черные радиаторы',
		seoTitle: 'Черные радиаторы отопления Velar — цены от {priceFrom}',
		seoDescription: 'Черные радиаторы отопления Velar в RAL 9005, матовые и глянцевые: трубчатые, дизайнерские и чугунные модели. Размеры, мощность, цены от {priceFrom}, доставка по России.',
		intro: 'Черные радиаторы отопления Velar в цвете RAL 9005, матовом или глянцевом. В подборке трубчатые, дизайнерские и чугунные модели, для которых черный цвет можно выбрать прямо на странице модели. Цены «от» посчитаны сразу для черного исполнения.',
		eyebrow: 'Радиаторы по цвету',
		modelSectionTitle: 'Модели Velar в черном цвете',
		modelSectionIntro: 'В строке модели указана цена самого доступного размера в черном цвете. Ссылка «Выбрать размер» откроет страницу модели с уже выбранным черным: у стальных моделей это RAL 9005 матовый (глянец переключается там же), у чугунных черная эмаль.',
		guideTitle: 'Как выбрать черный радиатор и сколько стоит цвет',
		guide: [
			{
				title: 'Трубчатые радиаторы',
				text: `У стальных трубчатых радиаторов в выборе цвета есть черный RAL 9005 глянцевый и матовый. ${blackColumnsSentence} Другой цвет по шкале RAL: ${surchargePhrase(columnAnyRal.multiplicate)}.`,
				links: [
					...(blackColumnsFree ? [{ href: '/news/ral9005', label: 'Трубчатые радиаторы в RAL 9005 без наценки' }] : []),
					linkWhiteCollection,
				],
			},
			{
				title: 'Дизайн-радиаторы',
				text: `Вертикальные и горизонтальные дизайн-радиаторы с плоским, квадратным, круглым и овальным профилем тоже доступны в RAL 9005 глянцевом и матовом. ${blackDesignSentence} Вертикальная модель визуально вытягивает помещение и становится акцентом на свободной стене, горизонтальная логично встает под окно.`,
				links: [
					{ href: '/design', label: 'Все дизайн-радиаторы Velar' },
					{ href: '/design/vertikalnye', label: 'Вертикальные дизайн-радиаторы' },
				],
			},
			{
				title: 'Чугунные ретро-радиаторы',
				text: `Черный цвет у Nostalgia с цветочным орнаментом и Historic без орнамента: ${ironcastBlackFinish}, ${ironcastBlackPerSection} за секцию. Эта доплата уже входит в цены на этой странице. Для лофта чаще выбирают Historic: он спокойнее и лучше сочетается с кирпичом, бетоном и металлом.`,
				links: [{ href: '/retro', label: 'Чугунные радиаторы в стиле ретро' }],
			},
			{
				title: 'Матовый или глянцевый',
				text: 'Матовый финиш меньше бликует и выглядит спокойнее, глянец сильнее раскрывает цвет и форму. На матовых черных поверхностях могут быть заметнее следы от прикосновений, пыль и мелкие загрязнения, поэтому радиатор в проходной зоне потребует более регулярной сухой уборки.',
				links: [linkMatteGloss],
			},
			{
				title: 'Напольные радиаторы',
				text: 'Напольные модели Q500, P200 и P300 тоже окрашивают в цвета RAL, но на странице модели цвет для них не выбирается, поэтому в списке их нет. Стоимость черного исполнения рассчитает менеджер.',
				links: [{ href: '/floor', label: 'Напольные радиаторы Velar' }],
			},
		],
		useCaseTitle: 'Где черный радиатор смотрится уместно',
		useCaseText: 'Черный радиатор эффектнее всего смотрится на фоне светлых стен и там, где в интерьере уже есть темные элементы: оконные рамы, светильники, фурнитура. Он уместен в минимализме, скандинавском и индустриальном интерьере и сочетается с бетоном, деревом, стеклом, металлом и натуральным камнем.',
		selectionNote: 'Цвет не меняет подбор мощности: размер и число секций считают по теплопотерям комнаты и паспортной мощности модели. Сначала выберите модель и размер, затем цвет и фактуру.',
		useCaseLink: { href: '/info/chernye-dizainerskie-radiatory-otopleniya', label: 'Черные радиаторы в интерьере: как использовать темные акценты' },
		faq: [
			{
				question: 'Сколько стоит черный радиатор отопления?',
				answer: `Самое доступное черное исполнение в подборке стоит от {priceFrom}. ${blackColumnsSentence === blackDesignSentence.replace('Черный дизайн-радиатор', 'Черный трубчатый радиатор') && blackColumnsSentence.includes('столько же') ? 'Черные трубчатые и дизайн-радиаторы стоят столько же, сколько белые того же размера в RAL 9016.' : `${blackColumnsSentence} ${blackDesignSentence}`} У чугунных моделей черная эмаль добавляет ${ironcastBlackPerSection} за секцию.`,
			},
			{
				question: 'Что выбрать: черный матовый или глянцевый?',
				answer: 'Матовый RAL 9005 меньше бликует и выглядит сдержанно и графично, глянцевый сильнее отражает свет и привлекает внимание. У трубчатых и дизайн-радиаторов оба варианта есть в выборе цвета и стоят одинаково.',
			},
			{
				question: 'Можно ли заказать другой темный оттенок, например графит?',
				answer: `Да, стальные радиаторы можно окрасить в цвет по шкале RAL. Для трубчатых моделей ${surchargePhrase(columnAnyRal.multiplicate)}, для дизайн-радиаторов ${surchargePhrase(designAnyRal.multiplicate)}. Номер RAL лучше согласовать заранее: один и тот же цвет на матовой и глянцевой поверхности выглядит по-разному.`,
			},
			{
				question: 'Как открыть модель сразу в черном цвете?',
				answer: 'Нажмите «Выбрать размер» в строке модели: страница откроется с выбранным черным цветом. Останется выбрать размер, число секций и подключение, а цвет при необходимости можно сменить в блоке «Цвет радиатора».',
			},
		],
		parentHref: '/collections',
		parentLabel: 'Все подборки',
		siblingGroup: 'color',
		connectionLabel: 'по модели',
		image: '/images/collections/chernyy-trubchatyy-radiator.jpg',
		imageAlt: 'Черный трубчатый радиатор Velar RAL 9005',
		heroImage: {
			src: '/images/columns/hero/black-tubular-interior-1200.webp',
			srcset: '/images/columns/hero/black-tubular-interior-640.webp 640w, /images/columns/hero/black-tubular-interior-1200.webp 1200w',
			width: 1200,
			height: 750,
			alt: 'Черный вертикальный трубчатый радиатор Velar в светлом интерьере',
		},
		rowImageByType: { columns: '/images/collections/chernyy-trubchatyy-radiator.jpg' },
		rowImageByModel: {
			historic500: '/images/models/historic500/1.jpg',
			historic300: '/images/models/historic300/1.jpg',
			nostalgia500: '/images/retro/retro_6.jpg',
			nostalgia300: '/images/retro/retro_6.jpg',
		},
	},
	{
		kind: 'color',
		colorFilter: { columns: columnWhiteGloss.id },
		slug: 'belye-trubchatye-radiatory',
		href: linkWhiteCollection.href,
		title: 'Белые трубчатые радиаторы',
		shortTitle: 'Белые трубчатые',
		seoTitle: 'Белые трубчатые радиаторы RAL 9016 — цены от {priceFrom}',
		seoDescription: 'Белые трубчатые радиаторы Velar в RAL 9016, глянцевые и матовые: от 2 до 5 труб в секции, низкие и высокие модели. Размеры, мощность, цены от {priceFrom}, доставка по России.',
		intro: 'Белые трубчатые радиаторы Velar в цвете RAL 9016, глянцевом или матовом. Цены на этой странице указаны для белого исполнения. В подборке все трубчатые модели: от низких под окно до высоких вертикальных, с двумя, тремя, четырьмя и пятью трубками в секции.',
		eyebrow: 'Радиаторы по цвету',
		modelSectionTitle: 'Белые трубчатые модели Velar',
		modelSectionIntro: 'В строке модели указана цена самого доступного размера в белом RAL 9016. Ссылка «Выбрать размер» откроет страницу модели с уже выбранным белым глянцем, матовый белый переключается там же.',
		guideTitle: 'Как выбрать белый трубчатый радиатор',
		guide: [
			{
				title: 'RAL 9016: глянец или мат',
				text: 'В выборе цвета два белых варианта: RAL 9016 глянцевый и RAL 9016 матовый, оба по одной цене. Матовый финиш меньше бликует и спокойнее соединяется со стеной, глянцевый сильнее раскрывает цвет.',
				links: [linkMatteGloss],
			},
			{
				title: 'Число труб и глубина',
				text: 'Чем больше труб в секции, тем больше глубина радиатора и мощность секции. Двухтрубчатые модели самые компактные по глубине, пятитрубчатые самые глубокие и помогают набрать мощность на коротком участке стены.',
				links: [
					{ href: '/collections/2-trubchatye-radiatory', label: '2 трубки' },
					{ href: '/collections/3-trubchatye-radiatory', label: '3 трубки' },
					{ href: '/collections/4-trubchatye-radiatory', label: '4 трубки' },
					{ href: '/collections/5-trubchatye-radiatory', label: '5 трубок' },
				],
			},
			{
				title: 'Высота и место установки',
				text: 'Под низкий подоконник подходят модели высотой до 600 мм, на свободную стену высокие вертикальные. Полная высота корпуса и межосевое расстояние не одно и то же: при замене старой батареи сверяйте оба размера.',
				links: [
					{ href: '/collections/nizkie-trubchatye-radiatory', label: 'Низкие трубчатые радиаторы' },
					{ href: '/collections/verticalnye-radiatory-1800-mm', label: 'Вертикальные около 1800 мм' },
					{ href: '/collections/radiatory-po-mezhosevomu-rasstoyaniyu', label: 'По межосевому расстоянию' },
				],
			},
			{
				title: 'Если нужен не белый',
				text: `Тот же радиатор можно заказать в черном RAL 9005, глянцевом или матовом. ${blackColumnsSentence} Свой цвет по шкале RAL: ${surchargePhrase(columnAnyRal.multiplicate)}.${columnPremiumRange ? ` Металлик, лаки и цвета Bronze, Gold, Old Gold считаются с наценкой ${columnPremiumRange}.` : ''}`,
				links: [linkBlackCollection],
			},
		],
		useCaseTitle: 'Где белый трубчатый радиатор уместен',
		useCaseText: 'Лаконичный белый радиатор под окно или на свободную стену не создает визуальной перегрузки. Для спокойных интерьеров чаще выбирают белый, графитовый или цвет стены.',
		selectionNote: 'Сначала подберите высоту, число труб и секций по месту установки и теплопотерям комнаты, затем финиш: глянец или мат. Перед заказом проверьте глубину радиатора и расстояние до подоконника и штор.',
		faq: [
			{
				question: 'Сколько стоят белые трубчатые радиаторы?',
				answer: `Самый доступный белый трубчатый радиатор в подборке стоит от {priceFrom}. Цена зависит от высоты, числа труб, количества секций и подключения. Белый RAL 9016, глянцевый и матовый, ${columnWhiteGloss.multiplicate === 1 ? 'входит в базовую цену' : `считается с наценкой ${surchargePercent(columnWhiteGloss.multiplicate)}%`}.`,
			},
			{
				question: 'Какой оттенок белого у трубчатых радиаторов Velar?',
				answer: `В выборе цвета белый RAL 9016, глянцевый или матовый. Другой оттенок белого можно заказать по шкале RAL: ${surchargePhrase(columnAnyRal.multiplicate)}.`,
			},
			{
				question: 'Есть ли белые трубчатые радиаторы в наличии?',
				answer: 'Наличие и срок зависят от модели, цвета, подключения, количества секций и загрузки производства. Добавьте вариант в корзину или отправьте заявку: менеджер проверит наличие или срок производства и рассчитает итоговую стоимость с доставкой.',
			},
			{
				question: 'Как открыть модель сразу в белом цвете?',
				answer: 'Нажмите «Выбрать размер» в строке модели: страница откроется с выбранным белым RAL 9016 глянцевым. Останется выбрать размер, число секций и подключение, а матовый белый выбирается в блоке «Цвет радиатора».',
			},
		],
		parentHref: '/columns',
		parentLabel: 'Все трубчатые радиаторы',
		siblingGroup: 'color',
		connectionLabel: 'боковое или нижнее',
		image: '/images/models/columns/main3b.jpg',
		imageAlt: 'Белый трубчатый радиатор Velar RAL 9016',
		heroImage: {
			src: '/images/columns/interiors/classic.webp',
			width: 900,
			height: 675,
			alt: 'Белый трубчатый радиатор Velar в светлой гостиной',
		},
	},
]

/** Цвет подборки для модели (id из справочника ее типа) или undefined, если тип в подборку не входит. */
export function collectionColorId(collection: CatalogCollectionConfig, model: ModelJson): string | undefined {
	const filter = collection.colorFilter
	if (!filter) return undefined
	if (model.type === 'columns') return filter.columns
	if (model.type === 'design') return filter.design
	if (model.type === 'ironcast') return filter.ironcast
	return undefined
}

/**
 * Цена исполнения в цвете подборки, как в корзине (getRadiatorTotalCost): у трубчатых и дизайн-радиаторов
 * цена × коэффициент цвета, у чугунных + цена цвета за секцию. Подключение по умолчанию без доплаты.
 * Для подборок без цвета это просто цена из каталога.
 */
export function collectionRadiatorPrice(collection: CatalogCollectionConfig, model: ModelJson, radiator: RadiatorJson): number {
	const base = catalogNumber(radiator.price)
	if (!base) return 0
	const colorId = collectionColorId(collection, model)
	if (!colorId) return base
	if (model.type === 'columns') return Math.round(findColor(columnColors, colorId, 'columnColors').multiplicate * base)
	if (model.type === 'design') return Math.round(findColor(designColors, colorId, 'designColors').multiplicate * base)
	if (model.type === 'ironcast') {
		const perSection = catalogNumber(findColor(ironcastColors, colorId, 'ironcastColors').price_section)
		return Math.round(base + perSection * catalogNumber(radiator.sections))
	}
	return base
}

function adaptInteraxialCollection(collection: InteraxialCollectionConfig): CatalogCollectionConfig {
	return {
		...collection,
		kind: 'interaxial',
		shortTitle: `${collection.spacing} мм`,
		eyebrow: 'Подбор по монтажному размеру',
		modelSectionTitle: `Модели с межосевым расстоянием ${collection.spacing} мм`,
		modelSectionIntro: `В строке модели показан диапазон подходящих конфигураций. На странице модели сразу включатся межосевое ${collection.spacing} мм и боковое подключение; затем можно выбрать точную длину или количество секций.`,
		parentHref: '/collections/radiatory-po-mezhosevomu-rasstoyaniyu',
		parentLabel: 'Все межосевые расстояния',
		siblingGroup: 'interaxial',
		connectionLabel: 'боковое',
		image: '/images/models/columns/main3b.jpg',
		imageAlt: `Радиатор Velar с межосевым расстоянием ${collection.spacing} мм`,
	}
}

export const catalogCollections: CatalogCollectionConfig[] = [
	...interaxialCollections.map(adaptInteraxialCollection),
	...heightCollections,
	...tubeCollections,
	lowTubularCollection,
	...convectorCollections,
	...colorCollections,
]

export const exactHeightCollections = heightCollections
export const tubularCollections = [...tubeCollections, lowTubularCollection]
export const convectorModeCollections = convectorCollections
export const colorModeCollections = colorCollections

export function collectionMatchesModel(collection: CatalogCollectionConfig, model: ModelJson): boolean {
	if (collection.kind === 'interaxial') {
		if (model.type === 'design' || model.type === 'floor') return model.connections.split(',').includes('lat')
		return model.type === 'columns' || model.type === 'ironcast'
	}
	if (collection.kind === 'height') return model.type !== 'convector'
	if (collection.kind === 'tube-count') return model.type === 'columns' && (collection.modelIds?.includes(model.id) ?? false)
	if (collection.kind === 'low-tubular') return model.type === 'columns'
	if (collection.kind === 'color') return Boolean(collectionColorId(collection, model))
	return collection.modelIds?.includes(model.id) ?? false
}

export function collectionMatchesRadiator(
	collection: CatalogCollectionConfig,
	model: ModelJson,
	radiator: RadiatorJson,
): boolean {
	if (!collectionMatchesModel(collection, model)) return false
	if (collection.kind === 'interaxial') return Number(radiator.n_spacing) === collection.spacing
	if (collection.kind === 'height') return Number(radiator.height) === collection.height
	if (collection.kind === 'low-tubular') return Number(radiator.height) <= 600
	return true
}
