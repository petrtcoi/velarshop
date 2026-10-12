type Dimensions = { width?: string | number; height: string | number; length: string | number }

export function formatDimensions(type: string, radiator: Dimensions): string {
	return type === 'convector'
		? `${radiator.width} × ${radiator.height} × ${radiator.length} мм (Ш × В × Д)`
		: `${radiator.height} × ${radiator.length} мм`
}

export function formatSections(value: string | number): string {
	const number = Number(value)
	const lastTwo = Math.abs(number) % 100
	const last = Math.abs(number) % 10
	const noun = lastTwo >= 11 && lastTwo <= 14 ? 'секций' : last === 1 ? 'секция' : last >= 2 && last <= 4 ? 'секции' : 'секций'
	return `${number} ${noun}`
}
