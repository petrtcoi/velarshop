import { persistentAtom } from '@nanostores/persistent'
import { computed } from 'nanostores'

import { designColors } from '@entities/DesignColor'

const version = await import.meta.env.PUBLIC_LOCAL_STORAGE_VERSION

const designColorId = persistentAtom<string>(
	`velarshop_design_color_active/${version}`,
	''
)

const designColor = computed(designColorId, colorId => {
	return designColors.find(color => color.id === colorId)
})

const designColorPostfix = computed(designColor, color => {
	if (!color) return ''
	return `, ${color.shortName.toLowerCase()}`
})

const designColorPriceMultiplicate = computed(designColor, color => {
	if (!color) return 1
	return color.multiplicate
})

export {
	designColorId,
	designColor,
	designColorPostfix,
	designColorPriceMultiplicate,
}
