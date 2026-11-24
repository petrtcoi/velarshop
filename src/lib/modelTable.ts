import { modelsJsonData, type ModelJson, type ModelType } from '@entities/Model'
import { radiatorsJsonData, type RadiatorJson } from '@entities/Radiator'
import { getModelSlug } from '@shared/utils/getModelSlug'
import { designSeries } from '../components/design/designData'
import { catalogNumber } from './catalogFacts'

/**
 * Строки сводной таблицы моделей (/tablica-modeley).
 * Данные считаются из тех же источников, что и каталог: modelsJsonData + radiatorsJsonData.
 * Минимальная цена - как в columnsData.ts / designData.ts / floor.astro: минимум price > 0
 * среди всех вариантов модели.
 */
export type ModelTableRow = {
	id: string
	type: ModelType
	title: string
	href: string
	profile: string
	heights: string
	centerDistance: string
	depth: string
	power: string
	priceFrom: number
	variantCount: number
}

export type ModelTableGroup = {
	type: ModelType
	anchor: string
	title: string
	hubHref: string
	intro: string
	rows: ModelTableRow[]
}

const NBSP = ' '

function fmt(value: number): string {
	return value.toLocaleString('ru-RU', { maximumFractionDigits: 1 })
}

function uniqueSorted(values: number[]): number[] {
	return [...new Set(values.filter(value => value > 0))].sort((a, b) => a - b)
}

/** До четырех значений - списком, иначе диапазон min-max. */
function listOrRange(values: number[]): string {
	const unique = uniqueSorted(values)
	if (!unique.length) return '-'
	if (unique.length === 1) return fmt(unique[0])
	if (unique.length <= 4) return unique.map(fmt).join(', ')
	return `${fmt(unique[0])}-${fmt(unique[unique.length - 1])}`
}

function range(values: number[]): string {
	const unique = uniqueSorted(values)
	if (!unique.length) return '-'
	const min = unique[0]
	const max = unique[unique.length - 1]
	return min === max ? fmt(min) : `${fmt(min)}-${fmt(max)}`
}

function numbers(variants: RadiatorJson[], key: keyof RadiatorJson): number[] {
	return variants.map(item => catalogNumber(item[key] as string | number | undefined))
}

function minPrice(variants: RadiatorJson[]): number {
	const prices = numbers(variants, 'price').filter(value => value > 0)
	return prices.length ? Math.min(...prices) : 0
}

function powerPerRadiator(variants: RadiatorJson[]): string {
	const text = range(numbers(variants, 'dt70'))
	return text === '-' ? '-' : `${text}${NBSP}Вт`
}

/** Трубчатые: мощность на одну секцию = dt70 / sections у варианта с наибольшим числом секций. */
function powerPerSection(variants: RadiatorJson[]): string {
	const widest = [...variants]
		.filter(item => catalogNumber(item.sections) > 0 && catalogNumber(item.dt70) > 0)
		.sort((a, b) => catalogNumber(b.sections) - catalogNumber(a.sections))[0]
	if (!widest) return '-'
	const perSection = catalogNumber(widest.dt70) / catalogNumber(widest.sections)
	return `${fmt(Number.parseFloat(perSection.toFixed(1)))}${NBSP}Вт на секцию`
}

const designProfileBySeries = new Map<string, string>()
for (const series of designSeries) {
	for (const model of series.models) designProfileBySeries.set(model.id, series.profile)
}

function profileFor(model: ModelJson): string {
	if (model.type === 'columns') {
		const tubes = Number.parseInt(model.id[0], 10)
		return Number.isFinite(tubes) ? `${tubes}-трубчатый` : 'трубчатый'
	}
	if (model.type === 'design') return designProfileBySeries.get(model.id) ?? '-'
	if (model.type === 'convector') return model.short_comment.split('.')[0].trim()
	if (model.type === 'ironcast') {
		return model.id.startsWith('nostalgia') ? 'чугун, с орнаментом' : 'чугун, без орнамента'
	}
	return model.prefix
}

function titleFor(model: ModelJson): string {
	return model.type === 'columns' ? `Velar ${model.name}` : `Velar ${model.name.replace(/\s+/g, ' ')}`
}

function buildRow(model: ModelJson): ModelTableRow {
	const variants = radiatorsJsonData.filter(item => item.model_id === model.id)
	const spacings = numbers(variants, 'n_spacing')

	return {
		id: model.id,
		type: model.type,
		title: titleFor(model),
		href: getModelSlug(model),
		profile: profileFor(model),
		heights: listOrRange(numbers(variants, 'height')),
		// Межосевое расстояние показываем для трубчатых, дизайн-радиаторов и чугунных; у напольных и конвекторов поле в данных иного смысла.
		centerDistance:
			model.type !== 'floor' && model.type !== 'convector' && spacings.some(value => value > 0) ? listOrRange(spacings) : '-',
		depth: listOrRange(numbers(variants, 'width')),
		power: model.type === 'columns' ? powerPerSection(variants) : powerPerRadiator(variants),
		priceFrom: minPrice(variants),
		variantCount: variants.filter(item => catalogNumber(item.price) > 0).length,
	}
}

function sortModels(models: ModelJson[]): ModelJson[] {
	// Трубчатые: по числовому id (как на /columns); остальные: порядок из modelsJsonData.
	return [...models].sort((a, b) => {
		if (a.type === 'columns' && b.type === 'columns') return Number.parseInt(a.id, 10) - Number.parseInt(b.id, 10)
		return 0
	})
}

const groupMeta: Array<Omit<ModelTableGroup, 'rows'>> = [
	{
		type: 'design',
		anchor: 'design',
		title: 'Дизайн-радиаторы',
		hubHref: '/design',
		intro:
			'Мощность указана для радиатора целиком (ΔT70) в диапазоне от самого малого до самого большого размера модели. Цена - от самого малого размера.',
	},
	{
		type: 'columns',
		anchor: 'columns',
		title: 'Трубчатые радиаторы',
		hubHref: '/columns',
		intro:
			'Мощность указана на одну секцию (ΔT70). Цена - за радиатор из 4 секций, минимальной конфигурации в каталоге; цена растет с числом секций.',
	},
	{
		type: 'ironcast',
		anchor: 'retro',
		title: 'Чугунные ретро-радиаторы',
		hubHref: '/retro',
		intro: 'Мощность указана для радиатора целиком (ΔT70) от минимального до максимального числа секций. Цена - от минимального числа секций.',
	},
	{
		type: 'convector',
		anchor: 'convector',
		title: 'Внутрипольные конвекторы',
		hubHref: '/convector',
		intro:
			'Мощность указана для конвектора целиком (ΔT70) в диапазоне типоразмеров. В колонке «Глубина» для конвекторов дана ширина короба, в колонке «Высота» - высота короба. Цена - от самого малого типоразмера.',
	},
	{
		type: 'floor',
		anchor: 'floor',
		title: 'Напольные радиаторы',
		hubHref: '/floor',
		intro: 'Мощность указана для радиатора целиком (ΔT70) в диапазоне размеров. Цена - от самого малого размера.',
	},
]

export function getModelTableGroups(): ModelTableGroup[] {
	return groupMeta.map(meta => ({
		...meta,
		rows: sortModels(modelsJsonData.filter(model => model.type === meta.type)).map(buildRow),
	}))
}
