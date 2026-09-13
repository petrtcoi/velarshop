import type { ModelJson } from '@entities/Model'
import type { RadiatorJson } from '@entities/Radiator'
import {
	interaxialCollections,
	type InteraxialCollectionConfig,
} from './interaxialCollections'

export type CatalogCollectionKind = 'interaxial' | 'height' | 'tube-count' | 'low-tubular' | 'convector'

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
	siblingGroup: 'interaxial' | 'height' | 'tubular' | 'convector'
	height?: number
	spacing?: number
	tubeCount?: number
	modelIds?: string[]
	connectionLabel?: string
	image: string
	imageAlt: string
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
		seoTitle: `${title} - каталог моделей, размеры и цены`,
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
		seoTitle: `${copy.word} радиаторы (${tubeCount}-трубчатые) - каталог и цены`,
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

const lowTubularCollection: CatalogCollectionConfig = {
	kind: 'low-tubular',
	slug: 'nizkie-trubchatye-radiatory',
	href: '/collections/nizkie-trubchatye-radiatory',
	title: 'Низкие трубчатые радиаторы',
	shortTitle: 'Низкие трубчатые',
	seoTitle: 'Низкие трубчатые радиаторы под окно - каталог и цены',
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
]

export const exactHeightCollections = heightCollections
export const tubularCollections = [...tubeCollections, lowTubularCollection]
export const convectorModeCollections = convectorCollections

export function collectionMatchesModel(collection: CatalogCollectionConfig, model: ModelJson): boolean {
	if (collection.kind === 'interaxial') {
		if (model.type === 'design' || model.type === 'floor') return model.connections.split(',').includes('lat')
		return model.type === 'columns' || model.type === 'ironcast'
	}
	if (collection.kind === 'height') return model.type !== 'convector'
	if (collection.kind === 'tube-count') return model.type === 'columns' && (collection.modelIds?.includes(model.id) ?? false)
	if (collection.kind === 'low-tubular') return model.type === 'columns'
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
