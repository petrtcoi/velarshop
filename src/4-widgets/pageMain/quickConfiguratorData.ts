import { modelsJsonData } from '@entities/Model'
import { getModelSlug } from '@shared/utils/getModelSlug'

import type { ModelOption } from './HeroQuickConfigurator'

export function buildQuickConfiguratorModels(options: { type?: ModelOption['type'] } = {}): ModelOption[] {
	const source = options.type ? modelsJsonData.filter(model => model.type === options.type) : modelsJsonData

	return source.map(model => ({
		id: model.id,
		slug: model.slug,
		name: model.name,
		type: model.type,
		orientation: model.orientation ?? '',
		prefix: model.prefix,
		href: getModelSlug(model),
		search: `${model.name} ${model.id} ${model.slug} ${model.short_comment} ${model.type}`.toLowerCase(),
	}))
}

export function getDefaultConfiguratorModel(pathname: string): string {
	const normalizedPath = pathname.replace(/\/$/, '') || '/'

	if (normalizedPath.includes('p30v')) return 'p30v'
	if (normalizedPath.includes('p30h')) return 'p30h'
	if (normalizedPath.includes('p60v')) return 'p60v'
	if (normalizedPath.includes('p60h')) return 'p60h'
	if (normalizedPath.includes('q40v')) return 'q40v'
	if (normalizedPath.includes('q40h')) return 'q40h'
	if (normalizedPath.includes('r32v')) return 'r32v'
	if (normalizedPath.includes('r32h')) return 'r32h'

	if (normalizedPath === '/design/p30') return 'p30v'
	if (normalizedPath === '/design/p60') return 'p60v'
	if (normalizedPath === '/design/q40') return 'q40v'
	if (normalizedPath === '/design/r32') return 'r32v'

	if (normalizedPath === '/columns' || normalizedPath === '/trubchatye-radiatory') return '3057'
	if (normalizedPath === '/convector' || normalizedPath === '/vnutripolnye-konvektory') return 'kwh'
	if (normalizedPath === '/retro' || normalizedPath === '/retro-radiatory') return 'nostalgia'

	return '3030'
}

export function resolveExistingModelId(models: ModelOption[], desiredId: string): string {
	if (models.some(model => model.id === desiredId)) return desiredId

	const fallbackByGroup: Record<string, string[]> = {
		kwh: ['kwh', 'kwhv'],
		nostalgia: ['nostalgia', 'retro', '3030'],
		'2180': ['2180', '3030'],
	}
	const fallback = fallbackByGroup[desiredId] ?? [desiredId, '3030']

	for (const candidate of fallback) {
		const match = models.find(model => model.id === candidate)
		if (match) return match.id
	}

	return models[0]?.id ?? '3030'
}
