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
]

const usefulArticles = [
	{
		href: '/info/termostats',
		title: 'Как правильно устанавливать термоголовки для радиаторов',
		description: 'Практические рекомендации по корректной установке термоголовок.',
	},
	{
		href: '/info/column-radiators-pros-cons',
		title: 'Трубчатые радиаторы: преимущества и недостатки',
		description: 'Краткий разбор плюсов и ограничений трубчатых моделей.',
	},
	{
		href: '/info/tube-radiators',
		title: 'Стальные трубчатые радиаторы Velar',
		description: 'Обзор линейки и ключевых характеристик трубчатых радиаторов.',
	},
	{
		href: '/info/forma-trub-dizayn-radiatorov',
		title: 'Форма труб радиаторов',
		description: 'Как форма секций влияет на стиль и восприятие радиатора в интерьере.',
	},
	{
		href: '/info/kreplenie-radiatora-k-stene',
		title: 'Крепление радиатора к стене',
		description: 'Что важно учесть при выборе крепежа и высоты установки.',
	},
	{
		href: '/info/radiator-types',
		title: 'Виды радиаторов отопления',
		description: 'Сравнение основных типов отопительных приборов для дома и квартиры.',
	},
	{
		href: '/info/chernye-dizainerskie-radiatory-otopleniya',
		title: 'Черные дизайнерские радиаторы отопления',
		description: 'Как использовать темные оттенки радиаторов в современных интерьерах.',
	},
	{
		href: '/info/steel-tube-radiators-guide',
		title: 'Стальные трубчатые радиаторы: полное руководство по выбору и установке',
		description: 'Подробное руководство по подбору, монтажу и эксплуатации.',
	},
	{
		href: '/info/kak-chistit-trubchatyj-radiator-otopleniya',
		title: 'Как правильно чистить трубчатый радиатор отопления',
		description: 'Пошаговая инструкция по уходу за трубчатыми радиаторами.',
	},
	{
		href: '/info/raschet-sekciy-trubchatogo-radiatora-uglovaya-komnata',
		title: 'Как правильно рассчитать количество секций трубчатого радиатора для угловой комнаты',
		description: 'Методика расчета секций с учетом повышенных теплопотерь.',
	},
	{
		href: '/info/zamena-panelnyh-radiatorov-na-trubchatye-velar',
		title: 'Замена панельных радиаторов на трубчатые Velar + онлайн калькулятор',
		description: 'На что обратить внимание при замене и как оценить нужную мощность.',
	},
	{
		href: '/info/teplootdacha-radiatora-delta-t-chto-eto',
		title: 'Теплоотдача радиатора и ΔT — почему мощность меняется в реальных условиях',
		description: 'Разбор влияния температурного графика на фактическую теплоотдачу.',
	},
]

const columnsFaqItems = [
	{
		question: 'Подходят ли трубчатые радиаторы для центрального отопления?',
		answer:
			'Да, при корректном подборе по рабочему давлению и параметрам системы трубчатые радиаторы подходят для квартир с центральным отоплением.',
	},
	{
		question: 'Можно ли устанавливать трубчатые радиаторы в открытую систему отопления?',
		answer:
			'Можно, но важно учитывать качество теплоносителя и условия эксплуатации. Для проекта лучше заранее согласовать технические параметры с менеджером.',
	},
	{
		question: 'Чем трубчатые радиаторы отличаются от чугунных?',
		answer:
			'Трубчатые модели легче, быстрее реагируют на регулировку и дают больше вариантов по размерам и цветам. Чугунные обычно массивнее и более инерционные.',
	},
	{
		question: 'Что означают цифры в обозначении моделей 2030, 3030, 2180?',
		answer:
			'Первая цифра обычно указывает на количество трубок в секции, а остальные — на геометрию серии. Точные параметры по высоте и глубине есть в карточке модели.',
	},
	{
		question: 'Почему трубчатые радиаторы иногда слабее панельных при одинаковой длине?',
		answer:
			'Теплоотдача зависит не только от длины, но и от глубины, числа трубок, высоты и температурного графика. Для точного сравнения нужно считать по мощности в ваших условиях.',
	},
	{
		question: 'Можно ли изменить количество секций под конкретную комнату?',
		answer: 'Да, это стандартный сценарий для трубчатых моделей. Мы подбираем количество секций по расчетной мощности помещения.',
	},
	{
		question: 'Можно ли заказать трубчатый радиатор в цвет RAL?',
		answer: 'Да, доступны варианты окраски по шкале RAL. Подбор цвета выполняется под интерьер или требования дизайн-проекта.',
	},
]

const columnsHowToSteps = [
	'Выберите модель',
	'Укажите высоту, секции, цвет и подключение',
	'Получите расчет',
	'Подтвердите заказ',
	'Производство',
	'Доставка',
]

export {
	columnsFaqItems,
	columnsHowToSteps,
	columnsModels,
	minCatalogPrice,
	popularModels,
	quickSelectionItems,
	usefulArticles,
}
