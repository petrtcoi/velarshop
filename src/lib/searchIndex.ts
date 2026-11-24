import { getCollection } from 'astro:content'
import { modelsJsonData, type ModelJson } from '@entities/Model'
import { radiatorsJsonData, type RadiatorJson } from '@entities/Radiator'
import { getModelSlug } from '@shared/utils/getModelSlug'
import { catalogNumber } from './catalogFacts'
import { catalogCollections } from './catalogCollections'
import type { SearchIndex, SearchModelEntry, SearchPageEntry } from './searchTypes'

/**
 * Индекс сайтового поиска (/search-index.json). Источники те же, что у /tablica-modeley:
 * modelsJsonData + radiatorsJsonData. Ключи короткие, см. searchTypes.ts.
 */

const TYPE_KEY: Record<ModelJson['type'], SearchModelEntry['k']> = {
	columns: 'c',
	design: 'd',
	ironcast: 'r',
	convector: 'v',
	floor: 'f',
}

function uniqueSortedStrings(values: Array<string | undefined>): string[] {
	const byNumber = new Map<number, string>()
	for (const value of values) {
		const number = catalogNumber(value)
		if (number > 0 && !byNumber.has(number)) byNumber.set(number, String(number))
	}
	return [...byNumber.entries()].sort((a, b) => a[0] - b[0]).map(([, label]) => label)
}

function minPrice(variants: RadiatorJson[]): number {
	const prices = variants.map(item => catalogNumber(item.price)).filter(value => value > 0)
	return prices.length ? Math.min(...prices) : 0
}

function buildModelEntry(model: ModelJson): SearchModelEntry | null {
	const variants = radiatorsJsonData.filter(item => item.model_id === model.id)
	if (!variants.length) return null

	const entry: SearchModelEntry = {
		i: model.id,
		t: `Velar ${model.name.replace(/\s+/g, ' ').trim()}`,
		h: getModelSlug(model),
		k: TYPE_KEY[model.type],
		H: uniqueSortedStrings(variants.map(item => item.height)),
		// Как в modelTable.ts: у напольных и конвекторов n_spacing имеет другой смысл.
		S: model.type === 'floor' || model.type === 'convector' ? [] : uniqueSortedStrings(variants.map(item => item.n_spacing)),
		p: minPrice(variants),
	}
	if (model.orientation === 'vertical') entry.o = 'v'
	if (model.orientation === 'horizontal') entry.o = 'h'
	return entry
}

const hubs: SearchPageEntry[] = [
	{ t: 'Трубчатые радиаторы Velar', h: '/columns', d: 'Каталог трубчатых радиаторов', w: 'трубчатые трубчатый колонны каталог' },
	{ t: 'Дизайн-радиаторы Velar', h: '/design', d: 'Каталог дизайн-радиаторов', w: 'дизайн дизайнерские вертикальные горизонтальные цвет ral краска' },
	{ t: 'Ретро радиаторы Velar', h: '/retro', d: 'Чугунные ретро-радиаторы', w: 'ретро чугун чугунные' },
	{ t: 'Внутрипольные конвекторы Velar', h: '/convector', d: 'Конвекторы в пол', w: 'конвектор конвекторы внутрипольные в пол' },
	{ t: 'Напольные радиаторы Velar', h: '/floor', d: 'Напольные радиаторы', w: 'напольные пол' },
	{ t: 'Подборки радиаторов', h: '/collections', d: 'По высоте, межосевому расстоянию, числу труб', w: 'подборки высота межосевое расстояние' },
	{ t: 'Подборки по межосевому расстоянию', h: '/collections/radiatory-po-mezhosevomu-rasstoyaniyu', w: 'межосевое расстояние' },
	{ t: 'Вертикальные радиаторы 1800 мм', h: '/collections/verticalnye-radiatory-1800-mm', d: 'Высокие вертикальные радиаторы', w: '1800 вертикальный вертикальные высокие' },
	{ t: 'Таблица моделей', h: '/tablica-modeley', d: 'Сводная таблица всех моделей Velar', w: 'таблица сравнение размеры' },
	{ t: 'Доставка', h: '/delivery', d: 'Условия и сроки доставки', w: 'доставка сроки оплата самовывоз' },
	{ t: 'Гарантия', h: '/guarantees', d: 'Гарантийные условия', w: 'гарантии гарантия' },
	{ t: 'О магазине', h: '/about', w: 'о нас контакты' },
	{ t: 'О бренде Velar', h: '/velar', w: 'велар производитель бренд' },
	{ t: 'Статьи и информация', h: '/info', w: 'статьи информация' },
	{ t: 'Получить расчет', h: '/request', d: 'Подберем радиатор по вашим размерам', w: 'заявка расчет подбор запрос' },
	{ t: 'Корзина', h: '/cart', w: 'корзина заказ' },
]

export async function buildSearchIndex(): Promise<SearchIndex> {
	const models = modelsJsonData.map(buildModelEntry).filter((entry): entry is SearchModelEntry => entry !== null)

	const collectionPages: SearchPageEntry[] = catalogCollections.map(collection => ({
		t: collection.title,
		h: collection.href,
		w: collection.shortTitle,
	}))

	const articles = await getCollection('articles')
	const news = await getCollection('news')

	const articleEntries: SearchPageEntry[] = [...articles]
		.sort((a, b) => b.data.sortRank - a.data.sortRank)
		.map(article => ({
			t: article.data.title,
			h: `/info/${article.slug}`,
			d: article.data.short_description,
		}))

	const newsEntries: SearchPageEntry[] = news.map(item => ({
		t: item.data.title,
		h: `/news/${item.slug}`,
		d: item.data.short_description,
	}))

	return {
		m: models,
		s: [...hubs, ...collectionPages],
		a: [...articleEntries, ...newsEntries],
	}
}
