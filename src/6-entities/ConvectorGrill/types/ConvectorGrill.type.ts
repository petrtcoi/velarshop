type ConvectorGrillPriceGroup =
	| 'basiс_grille_price'
	| 'anod_color_grille_price'
	| 'premium_grille_price'
	| 'wood_grill_price'
	| 'grill_empty'
	| 'some_ral_grill'

export type ConvectorGrill = {
	id: string
	price_id: ConvectorGrillPriceGroup
	code: string
	title: string
}
