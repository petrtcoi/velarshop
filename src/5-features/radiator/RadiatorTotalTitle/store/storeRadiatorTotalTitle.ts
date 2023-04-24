import { computed } from 'nanostores'

import type { ModelJson } from "@entities/Model"
import type { RadiatorJson } from "@entities/Radiator"
import { radiatorConnPostfix } from "@features/options/SelectConnection"
import { convectorGrillPostfix } from "@features/options/SelectConvectorGrill"
import { ironcastColorPostfix } from "@features/options/SelectIroncastColor"
import { useStore } from "@nanostores/preact"
import { getRadiatorTitle } from "@shared/utils/getRadiatorTitle"
import { addonPostfix } from "@features/options/SelectAddons"



const postfix = computed(
  [ radiatorConnPostfix, ironcastColorPostfix, convectorGrillPostfix ],
  (radiatorConnPostfix, ironcastColorPostfix, convectorGrillPostfix) =>
    (model: ModelJson) =>
      (model.type === 'design' || model.type === 'floor')
        ? radiatorConnPostfix
        : model.type === 'ironcast'
          ? ironcastColorPostfix
          : model.type === 'convector'
            ? convectorGrillPostfix
            : ''
)

const radiatorTotalTitle = computed(
  [ postfix, addonPostfix ],
  (postfix, addonPostfix) =>
    (model: ModelJson, radiator: RadiatorJson) => {
      const radiatorTitle = getRadiatorTitle({ model, radiator })
      return `${ radiatorTitle }${ postfix(model) }${ addonPostfix }`
    }
)

export { radiatorTotalTitle }





