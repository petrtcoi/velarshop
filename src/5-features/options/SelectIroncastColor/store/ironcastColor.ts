import { ironcastColors } from "@entities/IroncastColor"
import { persistentAtom } from "@nanostores/persistent"
import { computed } from 'nanostores'

const version = await import.meta.env.PUBLIC_LOCAL_STORAGE_VERSION


const ironcastColorId = persistentAtom<string>(`velarshop_ironcast_color_active/${ version }`, "")

const ironcastColor = computed(ironcastColorId, (colorId) => {
  return ironcastColors.find((color) => color.id === colorId)
})

const ironcastColorPostfix = computed(ironcastColor, (color) => {
  if (!color) return ''
  return `, ${ color.name }`
})

const ironcastColorPricePerSection = computed(ironcastColor, (color) => {
  if (!color) return 0
  return parseInt(color.price_section)
})


export {
  ironcastColorId,
  ironcastColor,
  ironcastColorPostfix,
  ironcastColorPricePerSection
}