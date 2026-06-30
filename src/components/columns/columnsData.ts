import { modelsJsonData, type ModelJson } from '@entities/Model'
import { radiatorsJsonData } from '@entities/Radiator'
import { getModelSlug } from '@shared/utils/getModelSlug'

export type ColumnsModelCard = {
	id: string
	name: string
	prefix: string
	shortComment: string
	href: string
	image: string
	minPrice: number
	height: number
	tubeCount: number
	powerSection: number
	sectionsMin: number
	sectionsMax: number
	purposeTags: string[]
}

function toNum(value: string | undefined): number {
	if (!value) return 0
	const parsed = Number.parseFloat(value)
	return Number.isFinite(parsed) ? parsed : 0
}

function getPurposeTags(height: number): string[] {
	const tags = new Set<string>(['ral', 'house'])

	if (height <= 500) {
		tags.add('under-window')
		tags.add('low')
		tags.add('apartment')
		tags.add('universal')
	}
	if (height > 500 && height <= 700) {
		tags.add('under-window')
		tags.add('standard')
		tags.add('apartment')
		tags.add('universal')
	}
	if (height > 700 && height <= 1200) {
		tags.add('standard')
		tags.add('apartment')
		tags.add('universal')
	}
	if (height > 1200) {
		tags.add('high')
		tags.add('vertical')
	}

	return [...tags]
}

function getColumnsModelsSource(): ModelJson[] {
	return modelsJsonData
		.filter(model => model.type === 'columns')
		.sort((a, b) => Number.parseInt(a.id, 10) - Number.parseInt(b.id, 10))
}

const columnsModels = getColumnsModelsSource().map(model => {
	const radiators = radiatorsJsonData.filter(radiator => radiator.model_id === model.id)
	const prices = radiators.map(r => toNum(r.price)).filter(v => v > 0)
	const minPrice = prices.length ? Math.min(...prices) : 0

	const heights = radiators.map(r => toNum(r.height)).filter(v => v > 0)
	const height = heights.length ? heights[0] : 0

	const sectionsValues = radiators
		.map(r => toNum(r.sections))
		.filter(v => Number.isFinite(v) && v > 0)
	const sectionsMin = sectionsValues.length ? Math.min(...sectionsValues) : 4
	const sectionsMax = sectionsValues.length ? Math.max(...sectionsValues) : 50

	const sectionPowerCandidates = radiators
		.map(r => {
			const dt60 = toNum(r.dt60)
			const sections = toNum(r.sections)
			if (dt60 <= 0 || sections <= 0) return 0
			return dt60 / sections
		})
		.filter(v => v > 0)
	const powerSection = sectionPowerCandidates.length
		? Number.parseFloat(sectionPowerCandidates[0].toFixed(1))
		: 0

	const tubeCount = Number.parseInt(model.id[0], 10)
	const href = getModelSlug(model)
	const image = `/images/models/columns/main${model.id[0]}b.jpg`

	return {
		id: model.id,
		name: model.name,
		prefix: model.prefix,
		shortComment: model.short_comment,
		href,
		image,
		minPrice,
		height,
		tubeCount: Number.isFinite(tubeCount) ? tubeCount : 0,
		powerSection,
		sectionsMin,
		sectionsMax,
		purposeTags: getPurposeTags(height),
	} satisfies ColumnsModelCard
})

const popularIds = new Set(['3030', '3057', '2180', '3180'])

const popularModels = columnsModels.filter(model => popularIds.has(model.id))

const minCatalogPrice = columnsModels.length
	? Math.min(...columnsModels.map(model => model.minPrice).filter(v => v > 0))
	: 5800

const quickSelectionItems = [
	{ title: 'Под окно', field: 'purpose', value: 'under-window' },
	{ title: 'Низкие', field: 'purpose', value: 'low' },
	{ title: 'Стандартные', field: 'purpose', value: 'standard' },
	{ title: 'Высокие', field: 'purpose', value: 'high' },
	{ title: '2-трубчатые', field: 'tubes', value: '2' },
	{ title: '3-трубчатые', field: 'tubes', value: '3' },
	{ title: '4-трубчатые', field: 'tubes', value: '4' },
	{ title: '5-трубчатые', field: 'tubes', value: '5' },
]

// Плоский список сохранён для обратной совместимости и для разметки/ссылок.
const usefulArticles = [
	{
		href: '/info/termostats',
		title: 'Как правильно устанавливать термоголовки для радиаторов',
	},
	{
		href: '/info/column-radiators-pros-cons',
		title: 'Трубчатые радиаторы: преимущества и недостатки',
	},
	{
		href: '/info/tube-radiators',
		title: 'Стальные трубчатые радиаторы Velar',
	},
	{
		href: '/info/forma-trub-dizayn-radiatorov',
		title: 'Форма труб радиаторов',
	},
	{
		href: '/info/kreplenie-radiatora-k-stene',
		title: 'Крепление радиатора к стене',
	},
	{
		href: '/info/radiator-types',
		title: 'Виды радиаторов отопления',
	},
	{
		href: '/info/chernye-dizainerskie-radiatory-otopleniya',
		title: 'Черные дизайнерские радиаторы отопления',
	},
	{
		href: '/info/steel-tube-radiators-guide',
		title: 'Стальные трубчатые радиаторы: полное руководство по выбору и установке',
	},
	{
		href: '/info/2-3-4-trubchatye-radiatory-chto-vybrat',
		title: '2-, 3- и 4-трубчатые радиаторы: что выбрать',
	},
	{
		href: '/info/kak-chistit-trubchatyj-radiator-otopleniya',
		title: 'Как правильно чистить трубчатый радиатор отопления',
	},
	{
		href: '/info/raschet-radiatorov-dlya-uglovoy-komnaty',
		title: 'Как правильно рассчитать количество секций трубчатого радиатора для угловой комнаты',
	},
	{
		href: '/info/zamena-panelnyh-radiatorov-na-trubchatye-velar',
		title: 'Замена панельных радиаторов на трубчатые Velar + онлайн калькулятор',
	},
	{
		href: '/info/teplootdacha-radiatora-delta-t-chto-eto',
		title: 'Теплоотдача радиатора и ΔT - почему мощность меняется в реальных условиях',
	},
	{
		href: '/info/trubchatye-radiatory-vs-panelnye',
		title: 'Трубчатые радиаторы vs панельные батареи',
	},
	{
		href: '/info/trubchatyy-radiator-ili-panelnyy',
		title: 'Трубчатый радиатор или панельный - что выбрать',
	},
]

// Те же ссылки, сгруппированные по смыслу. Все href сохранены.
const usefulArticleGroups = [
	{
		title: 'Выбор трубчатого радиатора',
		items: [
			{
				href: '/info/column-radiators-pros-cons',
				title: 'Трубчатые радиаторы: преимущества и недостатки',
			},
			{
				href: '/info/tube-radiators',
				title: 'Стальные трубчатые радиаторы Velar',
			},
			{
				href: '/info/steel-tube-radiators-guide',
				title: 'Стальные трубчатые радиаторы: полное руководство по выбору и установке',
			},
			{
				href: '/info/2-3-4-trubchatye-radiatory-chto-vybrat',
				title: '2-, 3- и 4-трубчатые радиаторы: что выбрать',
			},
			{
				href: '/info/trubchatye-radiatory-vs-panelnye',
				title: 'Трубчатые радиаторы vs панельные батареи',
			},
			{
				href: '/info/trubchatyy-radiator-ili-panelnyy',
				title: 'Трубчатый радиатор или панельный - что выбрать',
			},
		],
	},
	{
		title: 'Расчет и мощность',
		items: [
			{
				href: '/info/raschet-radiatorov-dlya-uglovoy-komnaty',
				title: 'Как правильно рассчитать количество секций трубчатого радиатора для угловой комнаты',
			},
			{
				href: '/info/teplootdacha-radiatora-delta-t-chto-eto',
				title: 'Теплоотдача радиатора и ΔT - почему мощность меняется в реальных условиях',
			},
			{
				href: '/info/zamena-panelnyh-radiatorov-na-trubchatye-velar',
				title: 'Замена панельных радиаторов на трубчатые Velar + онлайн калькулятор',
			},
		],
	},
	{
		title: 'Монтаж и эксплуатация',
		items: [
			{
				href: '/info/termostats',
				title: 'Как правильно устанавливать термоголовки для радиаторов',
			},
			{
				href: '/info/kreplenie-radiatora-k-stene',
				title: 'Крепление радиатора к стене',
			},
			{
				href: '/info/kak-chistit-trubchatyj-radiator-otopleniya',
				title: 'Как правильно чистить трубчатый радиатор отопления',
			},
		],
	},
	{
		title: 'Интерьер и смежные решения',
		items: [
			{
				href: '/info/forma-trub-dizayn-radiatorov',
				title: 'Форма труб радиаторов',
			},
			{
				href: '/info/radiator-types',
				title: 'Виды радиаторов отопления',
			},
			{
				href: '/info/chernye-dizainerskie-radiatory-otopleniya',
				title: 'Черные дизайнерские радиаторы отопления',
			},
		],
	},
]

const columnsFaqItems = [
	{
		question: 'Чем трубчатые радиаторы отличаются от панельных?',
		answer:
			'Трубчатые радиаторы дают больше вариантов по высоте, количеству секций, глубине, подключению и цвету. Их проще подобрать под интерьер, нестандартную стену или замену старой батареи. Панельные радиаторы чаще выбирают как более бюджетное типовое решение.',
	},
	{
		question: 'Можно ли заказать радиатор в цвет RAL?',
		answer:
			'Да, трубчатые радиаторы Velar можно заказать в цвет по шкале RAL. Радиатор можно сделать в цвет стены, выбрать спокойный белый, серый или графитовый оттенок либо использовать его как акцент в интерьере.',
	},
	{
		question: 'Как рассчитать мощность?',
		answer:
			'Для расчета нужно учитывать площадь помещения, высоту потолков, теплопотери, количество окон, температурный график системы и место установки радиатора. Для точного подбора лучше отправить параметры помещения - менеджер рассчитает мощность и количество секций.',
	},
	{
		question: 'Сколько длится производство?',
		answer:
			'Срок зависит от модели, цвета, подключения, количества секций и загрузки производства. Популярные варианты могут быть доступны быстрее, индивидуальные конфигурации изготавливаются под заказ. Точный срок менеджер подтвердит после согласования параметров.',
	},
	{
		question: 'Можно ли установить в квартире?',
		answer:
			'Да, при корректном подборе по рабочему давлению, подключению и параметрам системы трубчатые радиаторы подходят для квартир. Для замены старых батарей особенно важно проверить межосевое расстояние, высоту подоконника и схему подключения.',
	},
	{
		question: 'Какой тип подключения выбрать?',
		answer:
			'Тип подключения выбирают по разводке труб и месту установки. Если трубы уже выведены, лучше подбирать радиатор под существующую схему. Если отопление проектируется заново, можно заранее согласовать более аккуратное нижнее подключение.',
	},
	{
		question: 'Можно ли сделать нестандартный размер?',
		answer:
			'Можно подобрать высоту, количество секций, цвет и подключение под задачу помещения. Если нужен нестандартный проект, отправьте размеры стены, фото или план - менеджер проверит возможность изготовления и предложит подходящий вариант.',
	},
	{
		question: 'Какой трубчатый радиатор выбрать под окно?',
		answer:
			'Под окно обычно выбирают низкие или стандартные модели высотой 300-600 мм. Если важна небольшая глубина, смотрите 2-трубчатые модели. Если нужна большая теплоотдача при похожей высоте, лучше рассмотреть 3- или 4-трубчатые варианты.',
	},
	{
		question: 'Какой трубчатый радиатор выбрать на узкую стену?',
		answer:
			'Для узкой стены, простенка или прихожей подходят высокие модели 1500-2000 мм. 2-трубчатые высокие радиаторы выглядят легче и меньше выступают от стены, 3- и 4-трубчатые дают больше теплоотдачи.',
	},
	{
		question: 'Что нужно отправить для расчета?',
		answer:
			'Для расчета желательно отправить город, тип помещения, размеры стены или окна, желаемую высоту радиатора, фото места установки, параметры системы отопления и пожелания по цвету. Если данных пока нет, можно начать с площади помещения и фото стены.',
	},
]

const columnsHowToSteps = [
	{
		title: 'Отправьте параметры',
		text: 'Укажите город, помещение, размеры стены или окна, желаемую высоту радиатора и тип системы отопления. Можно приложить фото, план или проект.',
	},
	{
		title: 'Получите расчет мощности',
		text: 'Менеджер рассчитает нужную теплоотдачу и предложит подходящие модели по высоте, глубине и количеству секций.',
	},
	{
		title: 'Выберите модель и исполнение',
		text: 'Согласуем количество труб, высоту, секции, подключение, цвет RAL и дополнительные параметры.',
	},
	{
		title: 'Согласуйте стоимость и оплату',
		text: 'После проверки конфигурации менеджер подтвердит итоговую цену, срок производства, условия оплаты и документы.',
	},
	{
		title: 'Производство или резерв',
		text: 'Если модель есть в подходящем исполнении, ее можно зарезервировать. Если нужен индивидуальный вариант, заказ передается в производство.',
	},
	{
		title: 'Доставка по России',
		text: 'Подберем способ доставки до вашего города. После отправки передадим информацию по заказу и сопроводительные документы.',
	},
]

export {
	columnsFaqItems,
	columnsHowToSteps,
	columnsModels,
	minCatalogPrice,
	popularModels,
	quickSelectionItems,
	usefulArticles,
	usefulArticleGroups,
}
