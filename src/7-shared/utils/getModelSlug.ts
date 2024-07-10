import { ModelJson } from '@entities/Model'

export function getModelSlug(model: ModelJson): string {
	if (model.type === 'columns') return `/columns/${model.slug}`

	return `/model/${model.slug}`
}
