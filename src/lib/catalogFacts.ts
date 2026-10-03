import type { RadiatorJson } from '@entities/Radiator'

export function catalogNumber(value?: string | number): number {
	const parsed = Number.parseFloat(String(value ?? '').replace(/\s/g, '').replace(',', '.'))
	return Number.isFinite(parsed) ? parsed : 0
}

export function catalogRange(variants: RadiatorJson[], key: keyof RadiatorJson, unit = 'мм'): string {
	const values = variants.map(item => catalogNumber(item[key])).filter(value => value > 0)
	if (!values.length) return 'уточняйте'
	const min = Math.min(...values).toLocaleString('ru-RU')
	const max = Math.max(...values).toLocaleString('ru-RU')
	return `${min === max ? min : `${min}–${max}`} ${unit}`
}

export function catalogPrices(variants: RadiatorJson[]) {
	const prices = variants.map(item => catalogNumber(item.price)).filter(value => value > 0)
	return {
		lowPrice: prices.length ? Math.min(...prices) : 0,
		highPrice: prices.length ? Math.max(...prices) : 0,
		offerCount: prices.length,
	}
}

/** Keep the price, dimensions, power and destination filter on the same height. */
export function variantsNearestHeight(variants: RadiatorJson[], targetHeight: number): RadiatorJson[] {
	const heights = [...new Set(variants.map(item => catalogNumber(item.height)).filter(value => value > 0))]
	const height = heights.sort((a, b) => Math.abs(a - targetHeight) - Math.abs(b - targetHeight) || a - b)[0]
	return height === undefined ? [] : variants.filter(item => catalogNumber(item.height) === height)
}

export function catalogConnections(connections: string): string {
	const codes = connections.split(',').map(value => value.trim())
	const labels = []
	if (codes.includes('lat')) labels.push('боковое')
	if (codes.some(code => ['l50', 'r50', '050'].includes(code))) labels.push('нижнее')
	if (codes.includes('lr')) labels.push('по схеме модели')
	return labels.join(' / ') || 'по чертежу модели'
}
