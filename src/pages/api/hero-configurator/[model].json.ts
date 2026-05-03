import type { APIRoute } from 'astro'

import { columnColors } from '@entities/ColumnsColor'
import { convectorGrills } from '@entities/ConvectorGrill'
import { modelsJsonData } from '@entities/Model'
import { radiatorsJsonData } from '@entities/Radiator'
import { columnConnections, radiatorConnections } from '@entities/RadiatorConnection'
import { addonRadiatorLegs, addonStainlessBody } from '@entities/Addons'
import { ALL } from '@widgets/pageModel/RadiatorList/constants/filterAll'
import { filterRadiators } from '@widgets/pageModel/RadiatorList/utils/filterRadiators'
import { getModelFilters } from '@widgets/pageModel/RadiatorList/utils/getModelFilters'
import { sortStringsAsInts } from '@shared/utils/sortStringsAsInts'
import { getModelSlug } from '@shared/utils/getModelSlug'
import { getRadiatorTitle } from '@shared/utils/getRadiatorTitle'

export function getStaticPaths() {
	return modelsJsonData.map(model => ({
		params: { model: model.id },
	}))
}

function uniqueSorted(values: Array<string | undefined>): string[] {
	return [...new Set(values.filter((value): value is string => Boolean(value)))].sort(sortStringsAsInts)
}

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'content-type': 'application/json; charset=utf-8',
		},
	})
}

export const get: APIRoute = ({ params }) => {
	const modelId = params.model
	const model = modelsJsonData.find(item => item.id === modelId || item.slug === modelId)

	if (!model) return json({ error: 'Model not found' }, 404)

	const radiators = radiatorsJsonData.filter(radiator => radiator.model_id === model.id)
	const heights = uniqueSorted(radiators.map(radiator => radiator.height))
	const widths = uniqueSorted(radiators.map(radiator => radiator.width))
	const lengths = uniqueSorted(radiators.map(radiator => radiator.length))
	const sections = uniqueSorted(radiators.map(radiator => radiator.sections))
	const tubes = model.type === 'columns' ? [model.id.slice(0, 1)] : []

	const { filterByHeight, filterByWidth, filterByLength } = getModelFilters(model)
	const initialFilteredRadiators = filterRadiators({
		radiators,
		selectedHeight: filterByHeight ? heights[0] ?? ALL : ALL,
		selectedLength: filterByLength ? lengths[0] ?? ALL : ALL,
		selectedWidth: filterByWidth ? widths[0] ?? ALL : ALL,
	})

	const modelConnections = model.connections.split(',').filter(Boolean)
	const connections = model.type === 'columns'
		? columnConnections
		: radiatorConnections.filter(connection => modelConnections.includes(connection.id))

	const addon = model.type === 'design' && model.orientation === 'horizontal'
		? addonRadiatorLegs
		: model.type === 'convector'
			? addonStainlessBody
			: undefined

	return json({
		model: {
			id: model.id,
			slug: model.slug,
			name: model.name,
			type: model.type,
			orientation: model.orientation ?? '',
			prefix: model.prefix,
			search: `${model.name} ${model.id} ${model.slug} ${model.short_comment} ${model.type}`.toLowerCase(),
			href: getModelSlug(model),
		},
		filters: {
			height: model.type === 'columns' ? heights.length > 0 : filterByHeight,
			width: model.type === 'convector' ? widths.length > 0 : filterByWidth,
			length: filterByLength || (model.type === 'convector' && lengths.length > 0),
			sections: model.type === 'columns' || model.type === 'ironcast' || (model.type === 'design' && sections.length > 1),
			tubes: model.type === 'columns',
			connection: connections.length > 0,
			color: model.type === 'columns',
			grill: model.type === 'convector',
			addon: Boolean(addon),
		},
		options: {
			heights,
			widths,
			lengths,
			sections,
			tubes,
			connections: connections.map(connection => ({
				id: connection.id,
				label: connection.description,
				code: connection.code,
				priceRub: 'priceRub' in connection ? connection.priceRub : 0,
			})),
			colors: model.type === 'columns'
				? columnColors.map(color => ({
					id: color.id,
					label: color.shortName,
					multiplicate: color.multiplicate,
				}))
				: [],
			grills: model.type === 'convector'
				? convectorGrills.map(grill => ({
					id: grill.id,
					label: grill.title,
					code: grill.code,
					priceId: grill.price_id,
				}))
				: [],
			addon: addon ? { id: addon.id, label: addon.title, code: addon.code } : undefined,
		},
		initialFilteredRadiators: initialFilteredRadiators.map(radiator => radiator.slug),
		variants: radiators.map(radiator => ({
			slug: radiator.slug,
			title: getRadiatorTitle({ model, radiator }),
			height: radiator.height,
			width: radiator.width,
			length: radiator.length,
			sections: radiator.sections,
			nSpacing: radiator.n_spacing,
			dt70: radiator.dt70,
			price: radiator.price,
			addonDesignRadiatorsLegs: radiator.addon_design_radiators_legs,
			addonStainlessBody: radiator.addon_stainless_body,
			grillPrices: {
				'basiс_grille_price': radiator.basiс_grille_price,
				anod_color_grille_price: radiator.anod_color_grille_price,
				some_ral_grill: radiator.some_ral_grill,
				premium_grille_price: radiator.premium_grille_price,
				wood_grill_price: radiator.wood_grill_price,
				grill_empty: '0',
			},
		})),
	})
}
