import { computed } from 'nanostores'

import { addonId } from "@features/options/SelectAddons"
import { convectorGrill } from '@features/options/SelectConvectorGrill'
import { ironcastColorPricePerSection } from '@features/options/SelectIroncastColor'

import { getConvectorGrillPrice } from "@shared/utils/getConvectorGrillPrice"
import type { ModelJson } from "@entities/Model"
import type { RadiatorJson } from "@entities/Radiator"



const getGrillCost = computed(convectorGrill, (convectorGrill) =>
  (model: ModelJson, radiator: RadiatorJson,) =>
    getConvectorGrillPrice({
      model,
      radiator,
      grill: convectorGrill,
    }))


const getIronCastCost = computed(ironcastColorPricePerSection, (ironcastColorPricePerSection) =>
  (model: ModelJson, radiator: RadiatorJson) =>
  (model.type !== 'ironcast'
    ? 0
    : ironcastColorPricePerSection * (parseInt(radiator?.sections || "0"))
  ))

const getAddonCost = computed(addonId, (addonId) => (radiator: RadiatorJson) =>
(addonId
  ? parseInt(radiator[ addonId as keyof RadiatorJson ] || "0")
  : 0
))


const getRadiatorTotalCost = computed(
  [ getGrillCost, getIronCastCost, getAddonCost ],
  (getGrillCost, getIronCastCost, getAddonCost) =>
    (model: ModelJson, radiator: RadiatorJson) => (
      parseInt(radiator.price)
      + getGrillCost(model, radiator)
      + getIronCastCost(model, radiator)
      + getAddonCost(radiator)
    )
)


export { getRadiatorTotalCost }