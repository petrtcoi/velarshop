import type { RadiatorJson } from '@entities/Radiator'

// Поля радиатора, которые читают RadiatorsList и все, что он вызывает: фильтры (height, width, length, n_spacing),
// подписи и мощность (sections, dt70/60/50), цена с опциями (price, addon_design_radiators_legs для напольного монтажа,
// цены решеток конвекторов), slug для строк и сохраненного подбора. Остальное (model_id, e_spacing, d_spacing,
// weight, volume, related_items и др.) в острове не нужно и только раздувало HTML страницы модели.
type RadiatorListField =
	| 'slug'
	| 'sections'
	| 'width'
	| 'height'
	| 'length'
	| 'n_spacing'
	| 'dt50'
	| 'dt60'
	| 'dt70'
	| 'price'
	| 'addon_design_radiators_legs'
	| 'basiс_grille_price'
	| 'some_ral_grill'
	| 'anod_color_grille_price'
	| 'premium_grille_price'
	| 'wood_grill_price'

export type RadiatorListItem = Pick<RadiatorJson, RadiatorListField>

const RADIATOR_LIST_FIELDS: RadiatorListField[] = [
	'slug',
	'sections',
	'width',
	'height',
	'length',
	'n_spacing',
	'dt50',
	'dt60',
	'dt70',
	'price',
	'addon_design_radiators_legs',
	'basiс_grille_price',
	'some_ral_grill',
	'anod_color_grille_price',
	'premium_grille_price',
	'wood_grill_price',
]

/** Узкая копия радиатора для props острова RadiatorsList. Отсутствующие поля не добавляет, значения не меняет. */
export function pickRadiatorListFields(radiator: RadiatorJson): RadiatorListItem {
	const item: Partial<Record<RadiatorListField, string>> = {}
	for (const field of RADIATOR_LIST_FIELDS) {
		const value = radiator[field]
		if (value !== undefined) item[field] = value
	}
	return item as RadiatorListItem
}
