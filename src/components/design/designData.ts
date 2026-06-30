import { modelsJsonData, type ModelJson } from '@entities/Model'
import { radiatorsJsonData } from '@entities/Radiator'
import { getModelSlug } from '@shared/utils/getModelSlug'

export type DesignOrientation = 'vertical' | 'horizontal'

export type DesignSeries = {
	slug: string
	label: string
	title: string
	description: string
	whenChoose: string
	profile: string
	shortUse: string
	image: string
	heroImage?: string
	priceFrom: number
	href: string
	orientations: DesignOrientation[]
	models: Array<{
		id: string
		name: string
		title: string
		orientation: DesignOrientation
		href: string
		image: string
		shortComment: string
		priceFrom: number
	}>
	verticalModel?: DesignSeries['models'][number]
	horizontalModel?: DesignSeries['models'][number]
}

const seriesOrder = ['p30', 'p60', 'q40', 'q60', 'q80', 'r32', 'r42', 'r89', 's', 'sp', 'rt1', 'rt1w', 'rt2', 'qt1', 'qt2']

const seriesHeroImages: Partial<Record<string, string>> = {
	p30: '/images/design/series/p30-hero.png',
	p60: '/images/design/series/p60-hero.jpg',
	q40: '/images/design/series/q40-hero.png',
	r32: '/images/design/series/r32-hero.jpg',
	r42: '/images/design/series/r42-hero.png',
	r89: '/images/design/series/r89-hero.png',
	s: '/images/design/series/s-hero.png',
	sp: '/images/design/series/sp-hero.png',
}

const seriesMeta: Record<string, { label: string; description: string; whenChoose: string; profile: string; shortUse: string }> = {
	p30: {
		label: 'P30',
		description: 'Дизайн-радиатор из профильной трубы 30x60 мм. Универсальная серия для современных интерьеров, доступна в вертикальном и горизонтальном исполнении.',
		whenChoose: 'если нужен спокойный плоский радиатор без визуальной перегрузки - для квартиры, спальни, гостиной, кухни или прихожей.',
		profile: 'плоский профиль 30x60 мм',
		shortUse: 'квартиры, дома, современные интерьеры',
	},
	p60: {
		label: 'P60',
		description: 'Плоская серия с более выразительной шириной профиля. Подходит для лаконичных интерьеров, где радиатор должен выглядеть спокойно и архитектурно.',
		whenChoose: 'если нравится плоская форма P30, но нужен более заметный и широкий профиль.',
		profile: 'плоский профиль 60 мм',
		shortUse: 'гостиные, спальни, кабинеты',
	},
	q40: {
		label: 'Q40',
		description: 'Серия с квадратным профилем 40x40 мм. Четкая геометрия хорошо сочетается с минимализмом, современными квартирами и коммерческими пространствами.',
		whenChoose: 'если нужен строгий квадратный профиль без лишнего декора.',
		profile: 'квадрат 40x40 мм',
		shortUse: 'минимализм, офисы, современные квартиры',
	},
	q60: {
		label: 'Q60',
		description: 'Квадратный профиль 60x60 мм для более заметного визуального акцента. Доступны вертикальное и горизонтальное исполнения.',
		whenChoose: 'если Q40 кажется слишком легким, а радиатор должен выглядеть более основательно.',
		profile: 'квадрат 60x60 мм',
		shortUse: 'акцентные стены, просторные комнаты',
	},
	q80: {
		label: 'Q80',
		description: 'Массивная квадратная серия 80x80 мм для интерьеров, где радиатор должен стать заметной частью композиции.',
		whenChoose: 'если нужен крупный дизайнерский акцент и достаточно места для визуально сильного радиатора.',
		profile: 'квадрат 80x80 мм',
		shortUse: 'лофт, большие пространства, коммерческие зоны',
	},
	r32: {
		label: 'R32',
		description: 'Серия с круглой трубой диаметром 32 мм. Более мягкий силуэт для жилых интерьеров, доступен в вертикальной и горизонтальной версиях.',
		whenChoose: 'если нужен спокойный круглый профиль для квартиры, спальни, гостиной или прихожей.',
		profile: 'круг 32 мм',
		shortUse: 'спальни, гостиные, спокойные интерьеры',
	},
	r42: {
		label: 'R42',
		description: 'Круглый профиль 42 мм дает более выразительный объем, но сохраняет чистую современную форму.',
		whenChoose: 'если R32 кажется слишком тонким, но крупный R89 будет визуально тяжелым.',
		profile: 'круг 42 мм',
		shortUse: 'современные квартиры и дома',
	},
	r89: {
		label: 'R89',
		description: 'Крупная круглая труба 89 мм для сильного интерьерного акцента и помещений, где важна выразительная форма радиатора.',
		whenChoose: 'если радиатор должен быть заметным объектом в интерьере, а не фоновым отопительным прибором.',
		profile: 'круг 89 мм',
		shortUse: 'лофт, общественные пространства, акцентные зоны',
	},
	s: {
		label: 'S',
		description: 'Серия с овальным сечением трубы. Хорошо смотрится в интерьерах, где нужна более мягкая и спокойная форма.',
		whenChoose: 'если хочется уйти от строгой плоской, квадратной или круглой геометрии.',
		profile: 'овальный профиль',
		shortUse: 'жилые комнаты, кухни, кабинеты',
	},
	sp: {
		label: 'SP',
		description: 'Овальная серия с секциями вдоль стены. Подходит для аккуратного настенного размещения без визуальной перегрузки.',
		whenChoose: 'если нужен спокойный настенный радиатор с мягкой формой и минимальной визуальной активностью.',
		profile: 'овальная секция',
		shortUse: 'квартиры, дома, общественные зоны',
	},
	rt1: {
		label: 'RT1',
		description: 'Однорядный вертикальный дизайн-радиатор с круглыми секциями. Подходит для узких простенков и выразительного настенного размещения.',
		whenChoose: 'если нужен вертикальный радиатор с легким круглым силуэтом и небольшим визуальным объемом.',
		profile: 'один ряд, круг 32 мм',
		shortUse: 'узкие стены, прихожие, акцентные зоны',
	},
	rt1w: {
		label: 'RT1W',
		description: 'Оригинальная вертикальная версия с круглой трубой 32 мм. Используется как декоративный радиатор в современных интерьерах.',
		whenChoose: 'если нужен более необычный вертикальный радиатор с декоративным характером.',
		profile: 'вертикальная круглая секция',
		shortUse: 'дизайн-проекты и акцентные зоны',
	},
	rt2: {
		label: 'RT2',
		description: 'Двухрядный вертикальный радиатор с круглой трубой 32 мм. Выбирают, когда нужен более мощный вертикальный формат.',
		whenChoose: 'если нужен вертикальный радиатор с большей теплоотдачей, чем у однорядных моделей.',
		profile: 'два ряда, круг 32 мм',
		shortUse: 'помещения с повышенной теплопотерей',
	},
	qt1: {
		label: 'QT1',
		description: 'Однорядный вертикальный радиатор с квадратной секцией 40x40 мм. Чистая геометрия для современных интерьеров.',
		whenChoose: 'если нужен строгий вертикальный радиатор с квадратным профилем и аккуратной глубиной.',
		profile: 'один ряд, квадрат 40x40 мм',
		shortUse: 'минимализм, простенки, входные зоны',
	},
	qt2: {
		label: 'QT2',
		description: 'Двухрядный вертикальный радиатор с квадратной секцией 40x40 мм. Более мощная версия для вертикального размещения.',
		whenChoose: 'если нужен вертикальный квадратный радиатор с увеличенной теплоотдачей.',
		profile: 'два ряда, квадрат 40x40 мм',
		shortUse: 'высокие помещения и большие комнаты',
	},
}

function getSeriesSlug(model: ModelJson): string {
	const id = model.id.toLowerCase()
	if (id === 'sv' || id === 'sh') return 's'
	if (id === 'spv' || id === 'sph') return 'sp'
	return id.replace(/[vh]$/, '')
}

function toNum(value: string | undefined): number {
	if (!value) return 0
	const parsed = Number.parseFloat(value)
	return Number.isFinite(parsed) ? parsed : 0
}

function getMinPrice(modelId: string): number {
	const prices = radiatorsJsonData
		.filter(radiator => radiator.model_id === modelId)
		.map(radiator => toNum(radiator.price))
		.filter(Boolean)
	return prices.length ? Math.min(...prices) : 0
}

function normalizeOrientation(model: ModelJson): DesignOrientation {
	return model.orientation === 'horizontal' ? 'horizontal' : 'vertical'
}

const designModels = modelsJsonData
	.filter(model => model.type === 'design')
	.map(model => {
		const orientation = normalizeOrientation(model)
		const seriesSlug = getSeriesSlug(model)
		return {
			id: model.id,
			name: model.name,
			title: `Velar ${model.name.replace(/\s+/g, ' ')}`,
			orientation,
			href: getModelSlug(model),
			image: `/images/models/${model.slug}/main.jpg`,
			shortComment: model.short_comment,
			priceFrom: getMinPrice(model.id),
			seriesSlug,
		}
	})

export const designSeries: DesignSeries[] = seriesOrder
	.map(slug => {
		const models = designModels.filter(model => model.seriesSlug === slug)
		if (models.length === 0) return null
		const verticalModel = models.find(model => model.orientation === 'vertical')
		const horizontalModel = models.find(model => model.orientation === 'horizontal')
		const mainModel = verticalModel ?? models[0]
		const meta = seriesMeta[slug]
		const priceFrom = Math.min(...models.map(model => model.priceFrom).filter(Boolean))

		return {
			slug,
			label: meta?.label ?? slug.toUpperCase(),
			title: `Velar ${meta?.label ?? slug.toUpperCase()}`,
			description: meta?.description ?? mainModel.shortComment,
			whenChoose: meta?.whenChoose ?? 'если нужен радиатор под интерьер, место установки и тепловую задачу проекта.',
			profile: meta?.profile ?? mainModel.shortComment,
			shortUse: meta?.shortUse ?? 'современные интерьеры',
			image: mainModel.image,
			heroImage: seriesHeroImages[slug],
			priceFrom: Number.isFinite(priceFrom) ? priceFrom : 0,
			href: models.length > 1 ? `/design/${slug}` : mainModel.href,
			orientations: [...new Set(models.map(model => model.orientation))],
			models,
			verticalModel,
			horizontalModel,
		} satisfies DesignSeries
	})
	.filter((series): series is DesignSeries => Boolean(series))

export const verticalDesignSeries = designSeries.filter(series => series.verticalModel)
export const horizontalDesignSeries = designSeries.filter(series => series.horizontalModel)

export function formatRub(value: number): string {
	return `${value.toLocaleString('ru-RU')} ₽`
}

export function getDesignSeriesBySlug(slug: string): DesignSeries | undefined {
	return designSeries.find(series => series.slug === slug)
}

export const designUsefulLinkGroups = [
	{
		title: 'Выбор дизайн-радиатора',
		links: [
			['/info/wall', 'Настенные дизайнерские радиаторы отопления'],
			['/info/vertical-designer-radiators', 'Вертикальные дизайнерские радиаторы: экономия места и стиль'],
			['/info/horizontal-designer-radiators', 'Горизонтальные дизайн-радиаторы: где использовать лучше'],
			['/info/tsvet-interera-i-radiator', 'Как выбрать дизайнерский радиатор под стиль интерьера'],
		],
	},
	{
		title: 'Мощность и безопасность',
		links: [
			['/info/power', 'Как определить требуемую мощность радиатора'],
			['/info/oshibki-pri-vybore-radiatorov', 'Ошибки при выборе радиаторов отопления'],
			['/info/bezopasnost-radiatorov-dlya-detej', 'Безопасность радиаторов в доме'],
		],
	},
	{
		title: 'Форма, кухня и альтернативы',
		links: [
			['/info/forma-trub-dizayn-radiatorov', 'Конструкция труб радиаторов'],
			['/info/kak-podobrat-radiatory-dlya-kuhni', 'Как подобрать радиаторы для кухни'],
			['/info/chugunnye-retro-radiatory-v-interere', 'Ретро-радиаторы как альтернатива современным дизайн-радиаторам'],
		],
	},
] as const

export const designUsefulLinks = designUsefulLinkGroups.flatMap(group => group.links)
