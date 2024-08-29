import type { ColumnColor } from '../types/ColumnColor.type'

export const columnColors: ColumnColor[] = [
	{
		id: 'ral_9016_gloss',
		title: 'Белый RAL 9016 глянец',
		shortName: 'RAL 9016 глянец',
		multiplicate: 1,
	},
	{
		id: 'ral_9016_matte',
		title: 'Белый RAL 9016 матовый',
		shortName: 'RAL 9016 мат.',
		multiplicate: 1.3,
	},
	{
		id: 'ral_9005_gloss',
		title: 'Черный RAL 9005 глянец',
		shortName: 'RAL 9005 глянец',
		multiplicate: 1,
	},
	{
		id: 'ral_9005_matte',
		title: 'Черный RAL 9005 матовый',
		shortName: 'RAL 9005 мат.',
		multiplicate: 1,
	},
	{
		id: 'ral_any',
		title: 'По шкале RAL',
		shortName: 'свой RAL',
		multiplicate: 1.3,
	},
]
