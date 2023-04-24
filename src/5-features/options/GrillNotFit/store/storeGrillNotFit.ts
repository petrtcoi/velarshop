import { computed } from 'nanostores'
import { convectorGrill } from '@features/options/SelectConvectorGrill'

import { getConvectorGrillPrice } from '@shared/utils/getConvectorGrillPrice'

import type { ModelJson } from '@entities/Model'
import type { RadiatorJson } from '@entities/Radiator'


const getGrillNotFit = computed(convectorGrill, (convectorGrill) =>
  (model: ModelJson, radiator: RadiatorJson,) =>
    getConvectorGrillPrice({ model, radiator, grill: convectorGrill, }) < 0
      ? true
      : false
)

export { getGrillNotFit }