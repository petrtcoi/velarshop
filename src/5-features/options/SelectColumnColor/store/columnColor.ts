import { columnColors } from "@entities/ColumnsColor"
import { persistentAtom } from "@nanostores/persistent"
import { computed } from "nanostores"

const version = await import.meta.env.PUBLIC_LOCAL_STORAGE_VERSION

const columnColorId = persistentAtom<string>(
  `velarshop_columns_color_active/${version}`,
  ""
)

const columnColor = computed(columnColorId, colorId => {
  return columnColors.find(color => color.id === colorId)
})

const columnColorPostfix = computed(columnColor, color => {
  if (!color) return ""
  return `, ${color.shortName.toLowerCase()}`
})

const columnColorPriceMultiplicate = computed(columnColor, color => {
  if (!color) return 0
  return color.multiplicate
})

export {
  columnColorId,
  columnColor,
  columnColorPostfix,
  columnColorPriceMultiplicate,
}
