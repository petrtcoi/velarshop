import { computed } from "nanostores"

import type { ModelJson } from "@entities/Model"
import type { RadiatorJson } from "@entities/Radiator"
import { radiatorConnPostfix } from "@features/options/SelectConnection"
import { columnConnPostfix } from "@features/options/SelectColumnConnection"
import { columnColorPostfix } from "@features/options/SelectColumnColor"
import { convectorGrillPostfix } from "@features/options/SelectConvectorGrill"
import { ironcastColorPostfix } from "@features/options/SelectIroncastColor"
import { getRadiatorTitle } from "@shared/utils/getRadiatorTitle"
import { addonPostfix } from "@features/options/SelectAddons"

const postfix = computed(
  [
    radiatorConnPostfix,
    ironcastColorPostfix,
    columnConnPostfix,
    columnColorPostfix,
    convectorGrillPostfix,
  ],
  (
      radiatorConnPostfix,
      ironcastColorPostfix,
      columnConnPostfix,
      columnColorPostfix,
      convectorGrillPostfix
    ) =>
    (model: ModelJson) => {
      return model.type === "design" || model.type === "floor"
        ? radiatorConnPostfix
        : model.type === "ironcast"
        ? ironcastColorPostfix
        : model.type === "convector"
        ? convectorGrillPostfix
        : model.type === "columns"
        ? `${columnConnPostfix}${columnColorPostfix}`
        : ""
    }
)

const radiatorTotalTitle = computed(
  [postfix, addonPostfix],
  (postfix, addonPostfix) => (model: ModelJson, radiator: RadiatorJson) => {
    const radiatorTitle = getRadiatorTitle({ model, radiator })
    return `${radiatorTitle}${postfix(model)}${addonPostfix}`
  }
)

export { radiatorTotalTitle }
