import type { ConvectorGrill } from '@entities/ConvectorGrill'
import type { ModelJson } from '@entities/Model'
import type { RadiatorJson } from '@entities/Radiator'

type Props = {
	model: ModelJson
	radiator: RadiatorJson
	grill?: ConvectorGrill
}

export function getConvectorGrillPrice({ model, radiator, grill }: Props): number {
	if (!grill) return 0
	if (model.type !== 'convector') return 0
	if (grill.price_id === 'grill_empty') return 0

	if (grill.price_id === 'basiс_grille_price' && radiator?.basiс_grille_price)
		return parseInt(radiator.basiс_grille_price)

	if (grill.price_id === 'some_ral_grill' && radiator?.some_ral_grill) return parseInt(radiator.some_ral_grill)

	if (grill.price_id === 'anod_color_grille_price' && radiator?.anod_color_grille_price)
		return parseInt(radiator.anod_color_grille_price)

	if (grill.price_id === 'premium_grille_price' && radiator?.premium_grille_price)
		return parseInt(radiator.premium_grille_price)

	if (grill.price_id === 'wood_grill_price' && radiator?.wood_grill_price) return parseInt(radiator.wood_grill_price)

	return -100
}
