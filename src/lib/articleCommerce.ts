import { modelsJsonData, type ModelJson } from '@entities/Model'
import { radiatorsJsonData } from '@entities/Radiator'
import { getModelMainImagePath } from '@shared/utils/getModelMainImagePath'
import { getModelSlug } from '@shared/utils/getModelSlug'
import { designSeries } from '../components/design/designData'
import { catalogNumber } from './catalogFacts'

/**
 * Коммерческая настройка статей /info.
 *
 * Для статей с наибольшим трафиком задаем явно: тему (связанные материалы), блок предложения в середине статьи
 * (ArticleOffer в MDX), финальный CTA со ссылкой на коммерческий раздел, разделы и карточки подходящих моделей.
 * Остальные статьи используют тему по регулярному выражению из src/pages/info/[article].astro.
 *
 * Цены и характеристики карточек считаются из modelsJsonData + radiatorsJsonData, как в каталоге.
 * В тексте предложения можно использовать токен {priceFrom:id1,id2}: он заменяется на минимальную цену
 * среди указанных моделей, например «20 700 ₽».
 */

export type ArticleTopic = 'safety' | 'design' | 'columns' | 'convector' | 'retro' | 'generic'

export type ArticleLink = {
	href: string
	label: string
}

export type ArticleOfferConfig = {
	title: string
	text: string
	button?: string
}

export type ArticleEndingCtaConfig = {
	title: string
	description: string
	button?: string
	hub: ArticleLink
}

export type ArticleCommerceConfig = {
	topic: ArticleTopic
	offer: ArticleOfferConfig
	endingCta: ArticleEndingCtaConfig
	/** id моделей из modelsJsonData, ровно в таком порядке выводятся карточки. */
	models: string[]
	/** Коммерческие разделы для блока «Перейти в раздел». */
	hubs: ArticleLink[]
}

const hubColumns: ArticleLink = { href: '/columns', label: 'Трубчатые радиаторы Velar: цены и размеры' }
const hubDesign: ArticleLink = { href: '/design', label: 'Дизайн-радиаторы Velar в цвет RAL' }
const hubDesignVertical: ArticleLink = { href: '/design/vertikalnye', label: 'Вертикальные дизайн-радиаторы' }
const hubLowTubular: ArticleLink = { href: '/collections/nizkie-trubchatye-radiatory', label: 'Низкие трубчатые радиаторы под окно' }
const hubInteraxial500: ArticleLink = {
	href: '/collections/radiatory-mezhosevoe-rasstoyanie-500-mm',
	label: 'Радиаторы с межосевым расстоянием 500 мм',
}
const hubFourTube: ArticleLink = { href: '/collections/4-trubchatye-radiatory', label: 'Четырехтрубчатые радиаторы' }

export const articleCommerceBySlug: Record<string, ArticleCommerceConfig> = {
	'kreplenie-radiatora-k-stene': {
		topic: 'columns',
		offer: {
			title: 'Высокий радиатор на гипсокартон или газобетон?',
			text: 'Пришлите фото стены, материал основания и размеры места установки. Подберем модель Velar по мощности и массе с водой и подскажем схему монтажа: на стену или на напольных опорах.',
		},
		endingCta: {
			title: 'Подберем радиатор под вашу стену',
			description:
				'Учтем материал стены, массу прибора с водой, высоту и мощность. Отправьте фото и размеры, подготовим расчет модели, количества секций и цены.',
			hub: hubColumns,
		},
		models: ['3057', 'p30v', 'p200'],
		hubs: [hubColumns, { href: '/floor', label: 'Напольные радиаторы Velar' }, hubDesignVertical],
	},
	'compatibility-materials-radiators': {
		topic: 'columns',
		offer: {
			title: 'Подберем радиатор под ваши трубы',
			text: 'Пришлите фото труб, подводки и старой батареи и укажите, это квартира с центральным отоплением или частный дом. Определим материалы и подберем стальной трубчатый или чугунный радиатор Velar под вашу систему.',
		},
		endingCta: {
			title: 'Меняете батарею и не уверены в совместимости?',
			description: 'Пришлите фото труб и старого радиатора. Подберем модель Velar, подключение и размеры под вашу систему отопления.',
			hub: hubColumns,
		},
		models: ['3057', '3030', 'nostalgia500'],
		hubs: [hubColumns, { href: '/retro', label: 'Чугунные ретро-радиаторы Velar' }, hubInteraxial500],
	},
	termostats: {
		topic: 'columns',
		offer: {
			title: 'Подберем радиатор и подключение под термоголовку',
			text: 'Если батарея старая и плохо греет, рассчитаем замену: модель, количество секций и подключение под ваши трубы, с местом для термоголовки в открытой зоне.',
		},
		endingCta: {
			title: 'Нужен радиатор с нижним или боковым подключением?',
			description:
				'Пришлите фото выводов труб и размеры места установки. Подберем модель Velar, количество секций и схему подключения с учетом термоголовки.',
			hub: hubColumns,
		},
		models: ['3057', '2180', 'p30v'],
		hubs: [hubColumns, hubLowTubular, hubDesignVertical],
	},
	'air-in-radiators': {
		topic: 'columns',
		offer: {
			title: 'Старая батарея снова холодная?',
			text: 'Если радиатор старый и плохо греет даже после удаления воздуха, рассчитаем замену: модель, количество секций и подключение под ваши трубы.',
		},
		endingCta: {
			title: 'Рассчитаем замену старой батареи',
			description:
				'Отправьте размеры старого радиатора, расстояние между трубами и площадь комнаты. Подберем модель Velar, количество секций и подключение.',
			hub: hubColumns,
		},
		models: ['3057', 'p30v', 'nostalgia500'],
		hubs: [hubColumns, hubDesign, hubInteraxial500],
	},
	'teplootdacha-radiatora-delta-t-chto-eto': {
		topic: 'columns',
		offer: {
			title: 'Рассчитаем секции при вашей температуре теплоносителя',
			text: 'Укажите температуру подачи и обратки, площадь комнаты и место установки. Пересчитаем мощность трубчатого радиатора Velar под ваш ΔT и подберем количество секций с запасом.',
		},
		endingCta: {
			title: 'Система работает в режиме 55/45 или 70/55?',
			description:
				'Пришлите температуру подачи и обратки и размеры комнаты. Пересчитаем мощность под ваш ΔT и подберем модель и количество секций.',
			hub: hubColumns,
		},
		models: ['2057', '3057', 'q40v'],
		hubs: [hubColumns, hubFourTube, { href: '/tablica-modeley', label: 'Таблица моделей Velar с ценами' }],
	},
	wall: {
		topic: 'design',
		offer: {
			title: 'Пришлите размеры стены и параметры отопления',
			text: 'Подготовим расчет с серией Velar, высотой, мощностью, цветом RAL, ценой и сроками. Подойдет и фото помещения или дизайн-проект.',
		},
		endingCta: {
			title: 'Подберем настенный радиатор под ваш интерьер',
			description:
				'Учтем ширину стены, мощность, профиль трубы и цвет RAL. Пришлите размеры или фото, подготовим расчет с ценой.',
			hub: hubDesign,
		},
		models: ['p30v', 'q40v', 'r32v'],
		hubs: [
			hubDesign,
			hubDesignVertical,
			{ href: '/design/gorizontalnye', label: 'Горизонтальные дизайн-радиаторы' },
			{ href: '/collections/verticalnye-radiatory-1800-mm', label: 'Вертикальные радиаторы 1800 мм' },
		],
	},
	'restavratsiya-chugunnyh-radiatorov': {
		topic: 'retro',
		offer: {
			title: 'Сравним реставрацию с новым чугунным радиатором',
			text: 'Новые чугунные ретро-радиаторы Velar Nostalgia и Historic стоят от {priceFrom:nostalgia500,historic500,nostalgia300,historic300}. Пришлите размеры и фото старой батареи, подберем новую модель нужной мощности, количество секций и отделку.',
		},
		endingCta: {
			title: 'Не уверены, что старую батарею стоит восстанавливать?',
			description:
				'Пришлите фото и размеры радиатора. Сравним реставрацию с новым ретро-радиатором Nostalgia или Historic и подберем количество секций и покрытие.',
			hub: { href: '/retro', label: 'Чугунные радиаторы в стиле ретро: цены и размеры' },
		},
		models: ['nostalgia500', 'historic500', 'nostalgia300'],
		hubs: [
			{ href: '/retro', label: 'Чугунные ретро-радиаторы Velar' },
			{ href: '/model/nostalgia500', label: 'Чугунный радиатор Nostalgia с орнаментом' },
			{ href: '/model/historic500', label: 'Чугунный радиатор Historic без орнамента' },
		],
	},
	'radiatory-dlya-panoramnykh-okon-tipy-osobennosti': {
		topic: 'convector',
		offer: {
			title: 'Рассчитаем конвектор под ваш витраж',
			text: 'Пришлите ширину и высоту остекления, глубину ниши в полу и температурный режим. Подберем длину и мощность внутрипольного конвектора KWH или KWHV, а если ниши нет, напольный радиатор P200 или P300.',
		},
		endingCta: {
			title: 'Подберем отопление для панорамного остекления',
			description:
				'Учтем длину витража, глубину ниши, режим отопления и нужную тепловую завесу. Пришлите размеры, рассчитаем конвектор или напольный радиатор.',
			hub: { href: '/convector', label: 'Внутрипольные конвекторы для панорамных окон' },
		},
		models: ['kwh', 'kwhv', 'p200'],
		hubs: [
			{ href: '/convector', label: 'Внутрипольные конвекторы Velar' },
			{ href: '/collections/vnutripolnye-konvektory-s-ventilyatorom', label: 'Внутрипольные конвекторы с вентилятором' },
			{ href: '/floor', label: 'Напольные радиаторы для панорамных окон' },
		],
	},
	'termostat-installation-errors': {
		topic: 'columns',
		offer: {
			title: 'Экран прячет старую батарею?',
			text: 'Если батарея старая и плохо греет, рассчитаем замену: модель, количество секций и подключение под ваши трубы. Трубчатый или дизайн-радиатор Velar можно оставить открытым, и экран не будет мешать термоголовке.',
		},
		endingCta: {
			title: 'Радиатор в нише или под низким подоконником?',
			description:
				'Пришлите фото и размеры места установки. Подберем высоту, количество секций и подключение так, чтобы термоголовка оставалась в открытой зоне.',
			hub: hubColumns,
		},
		models: ['3030', '3057', '2180'],
		hubs: [hubColumns, hubLowTubular, hubDesign],
	},
	'raschet-radiatorov-dlya-uglovoy-komnaty': {
		topic: 'columns',
		offer: {
			title: 'Рассчитаем секции для вашей угловой комнаты',
			text: 'Пришлите площадь, высоту потолков, размеры окон и температурный режим, а если знаете, то и мощность радиаторов от застройщика. Подберем модель Velar и количество секций, при необходимости на два радиатора.',
		},
		endingCta: {
			title: 'Угловая комната и холодные стены?',
			description:
				'Пришлите площадь, высоту потолков и размеры окон. Рассчитаем мощность с поправкой на две наружные стены и подберем модель и количество секций.',
			hub: hubColumns,
		},
		models: ['3057', '4057', '2180'],
		hubs: [hubColumns, hubFourTube, hubDesignVertical],
	},
}

export function getArticleCommerce(slug: string): ArticleCommerceConfig | undefined {
	return articleCommerceBySlug[slug]
}

/** Ссылка на форму заявки с меткой статьи: LeadWidget допишет в комментарий «Со статьи: <заголовок>». */
export function getArticleRequestHref(slug: string): string {
	return `/request?from=${encodeURIComponent(slug)}`
}

/* ------------------------------------------------------------------ */
/* Цены и карточки моделей                                              */
/* ------------------------------------------------------------------ */

function findModel(id: string): ModelJson {
	const model = modelsJsonData.find(item => item.id === id)
	if (!model) throw new Error(`articleCommerce: не найдена модель ${id}`)
	return model
}

function variantsOf(modelId: string) {
	return radiatorsJsonData.filter(item => item.model_id === modelId)
}

function minPositive(values: number[]): number {
	const positive = values.filter(value => value > 0)
	return positive.length ? Math.min(...positive) : 0
}

function modelPriceFrom(modelId: string): number {
	return minPositive(variantsOf(modelId).map(item => catalogNumber(item.price)))
}

export function formatRub(value: number): string {
	return `${Math.round(value).toLocaleString('ru-RU')} ₽`
}

/** Заменяет {priceFrom:id1,id2} на минимальную цену из каталога. Токен с неизвестной моделью или без цены ломает сборку. */
export function fillPriceTokens(text: string): string {
	return text.replace(/\{priceFrom:([a-z0-9,]+)\}/gi, (_match, rawIds: string) => {
		const ids = rawIds.split(',').map(id => id.trim()).filter(Boolean)
		ids.forEach(findModel)
		const price = minPositive(ids.map(modelPriceFrom))
		if (!price) throw new Error(`articleCommerce: нет цены для ${rawIds}`)
		return formatRub(price)
	})
}

function formatMm(value: number): string {
	return value.toLocaleString('ru-RU', { maximumFractionDigits: 0 })
}

/** Одно значение или диапазон через обычный дефис, например «1 500-2 000». */
function rangeText(values: number[]): string {
	const unique = [...new Set(values.filter(value => value > 0))].sort((a, b) => a - b)
	if (!unique.length) return ''
	if (unique.length === 1) return formatMm(unique[0])
	return `${formatMm(unique[0])}-${formatMm(unique[unique.length - 1])}`
}

const designProfileById = new Map<string, string>()
for (const series of designSeries) {
	for (const model of series.models) designProfileById.set(model.id, series.profile)
}

function normalizeModelName(name: string): string {
	// Как в ModelProductPage: «P 30 V» -> «P30 V», чтобы анкор совпадал с H1 страницы модели.
	return name.replace(/([A-Za-zА-Яа-я])\s+(\d+)/g, '$1$2').replace(/\s+/g, ' ').trim()
}

function withHeight(parts: string[], heights: string, label = 'высота'): string {
	return [...parts, heights ? `${label} ${heights} мм` : ''].filter(Boolean).join(', ')
}

function typeLineFor(model: ModelJson): string {
	const variants = variantsOf(model.id)
	const heights = rangeText(variants.map(item => catalogNumber(item.height)))

	if (model.type === 'columns') {
		const tubes = Number.parseInt(model.id[0], 10)
		const sections = variants.map(item => catalogNumber(item.sections)).filter(value => value > 0)
		const sectionsText = sections.length ? `${Math.min(...sections)}-${Math.max(...sections)} секций` : ''
		return [withHeight([Number.isFinite(tubes) ? `${tubes}-трубчатый` : 'Трубчатый'], heights), sectionsText]
			.filter(Boolean)
			.join(', ')
	}
	if (model.type === 'design') {
		const orientation = model.orientation === 'horizontal' ? 'Горизонтальный' : 'Вертикальный'
		const profile = designProfileById.get(model.id)
		return withHeight([orientation, profile ?? ''].filter(Boolean), heights)
	}
	if (model.type === 'ironcast') {
		return withHeight(['Чугун', model.id.startsWith('nostalgia') ? 'с орнаментом' : 'без орнамента'], heights)
	}
	if (model.type === 'convector') {
		return withHeight([model.short_comment.split('.')[0].trim()], heights, 'высота короба')
	}
	// floor
	const depths = rangeText(variants.map(item => catalogNumber(item.width)))
	return [heights ? `Высота ${heights} мм` : '', depths ? `глубина ${depths} мм` : ''].filter(Boolean).join(', ')
}

export type ArticleModelCard = {
	id: string
	title: string
	typeLine: string
	priceFrom: number
	priceNote?: string
	href: string
	image: string
}

export function getArticleModelCards(ids: string[]): ArticleModelCard[] {
	return ids.map(id => {
		const model = findModel(id)
		return {
			id: model.id,
			title: `${model.prefix} Velar ${normalizeModelName(model.name)}`,
			typeLine: typeLineFor(model),
			priceFrom: modelPriceFrom(model.id),
			// У конвекторов решетка в каталоге считается отдельно (см. CatalogExamples).
			priceNote: model.type === 'convector' ? 'без решетки' : undefined,
			href: getModelSlug(model),
			image: getModelMainImagePath(model.slug, model.type === 'columns'),
		}
	})
}
