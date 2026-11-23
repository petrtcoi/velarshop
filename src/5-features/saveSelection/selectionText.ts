/** Selection text helpers: one plain line, no long dashes, no letter "ё", no emoji. */

export function lowerFirst(value: string): string {
	return value ? value.charAt(0).toLowerCase() + value.slice(1) : value
}

export function formatSectionsLabel(sections: string | number | undefined): string {
	const count = Number.parseInt(String(sections ?? ''), 10)
	if (!Number.isFinite(count) || count <= 0) return ''
	const lastTwo = count % 100
	const last = count % 10
	if (lastTwo >= 11 && lastTwo <= 14) return `${count} секций`
	if (last === 1) return `${count} секция`
	if (last >= 2 && last <= 4) return `${count} секции`
	return `${count} секций`
}

function cleanText(value: string): string {
	return value
		.replace(/[  ]/g, ' ')
		.replace(/[‒-―−]/g, '-')
		.replace(/ё/g, 'е')
		.replace(/Ё/g, 'Е')
		.replace(/\s+/g, ' ')
		.trim()
}

/** Joins non-empty parts and the price: "Velar 3057, высота 576 мм, 4 секции, ..., 6 560 ₽". */
export function buildSelectionText(parts: Array<string | undefined>, priceRub: number): string {
	const items = parts.filter((part): part is string => Boolean(part))
	if (priceRub > 0) items.push(`${priceRub.toLocaleString('ru-RU')} ₽`)
	return cleanText(items.join(', '))
}

/** Model page path that restores the selection: /columns/3057?radiator=3057-4&connection=lat1%2F2&color=ral_9016_gloss */
export function buildSelectionPath(modelHref: string, radiatorSlug: string, connectionId: string, colorId: string): string {
	const params = new URLSearchParams()
	params.set('radiator', radiatorSlug)
	if (connectionId) params.set('connection', connectionId)
	if (colorId) params.set('color', colorId)
	return `${modelHref}?${params.toString()}`
}
