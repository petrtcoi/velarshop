import { ModelJson } from '@entities/Model'

export function getModelSlug(model: Pick<ModelJson, 'type' | 'slug'>): string {
	if (model.type === 'columns') return `/columns/${model.slug}`

	return `/model/${model.slug}`
}
