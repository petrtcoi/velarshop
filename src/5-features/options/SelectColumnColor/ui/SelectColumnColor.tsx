import { useStore } from "@nanostores/preact"
import { useEffect } from "preact/hooks"

import ColorSwatches from "@shared/components/ColorSwatches"
import { columnColors } from "@entities/ColumnsColor"
import { columnColorId as storeColumnsColorId } from "../store/columnColor"

function SelectIroncastColor() {
  const ironcastColorId = useStore(storeColumnsColorId)
  const options = columnColors.map(color => ({
    id: color.id,
    label: (
      `${color.title} ` +
      (color.multiplicate === 1
        ? ""
        : `(+${Math.round((color.multiplicate - 1) * 100)}%)`)
    ).trim(),
  }))

  useEffect(() => {
    if (!storeColumnsColorId.get()) storeColumnsColorId.set(columnColors[0].id)
  }, [])

  const handleChange = (id: string) => {
    storeColumnsColorId.set(id)
  }

  return (
    <div class="mt-5 mb-2">
      <div
        id="select_radiator_color_label"
        class="block text-xs font-thin"
      >
        Цвет радиатора:
      </div>
      <ColorSwatches
        options={options}
        selected={ironcastColorId}
        onChange={handleChange}
        labelledBy="select_radiator_color_label"
      />
    </div>
  )
}

export default SelectIroncastColor
