import { useStore } from "@nanostores/preact"

import { addonRadiatorLegs } from "@entities/Addons"
import { isRadiatorsLegs } from "./store/addons"

import type { ModelJson } from "@entities/Model"
import type { WritableAtom } from "nanostores"

type Props = {
  model: Pick<ModelJson, "type" | "orientation">
}

function SelectAddon({ model }: Props) {
  let addonTitle: string | null = null
  let addonStore: WritableAtom<boolean> | null = null

  if (model.type === "design" && model.orientation === "horizontal") {
    addonTitle = addonRadiatorLegs.title
    addonStore = isRadiatorsLegs
  }
  if (!addonTitle || !addonStore) return null

  const addonValue = useStore(addonStore)

  return (
    <div class="mt-5 mb-5">
      <div class="block text-xs font-thin">Дополнительно:</div>
      <div class="flex flex-row gap-5 mt-1 justify-start items-center ">
        <label
          for="select_addon"
          class="text-xs hover:cursor-pointer"
        >
          {addonTitle}
        </label>
        <input
          id="select_addon"
          type="checkbox"
          class=" hover:cursor-pointer"
          checked={addonValue}
          onClick={() => addonStore!.set(!addonValue)}
        />
      </div>
    </div>
  )
}

export default SelectAddon
