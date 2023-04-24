import { computed, atom } from 'nanostores'
import { addonRadiatorLegs, addonStainlessBody } from '@entities/Addons'



const isRadiatorsLegs = atom<boolean>(false)
const isStainlessBody = atom<boolean>(false)


const addonPostfix = computed([ isRadiatorsLegs, isStainlessBody ], (isRadiatorsLegs, isStainlessBody) =>
  isRadiatorsLegs
    ? `, ${ addonRadiatorLegs.code }`
    : isStainlessBody
      ? `, ${ addonStainlessBody.code }`
      : ''
)

const addonId = computed([ isRadiatorsLegs, isStainlessBody ], (isRadiatorsLegs, isStainlessBody) =>
  isRadiatorsLegs
    ? addonRadiatorLegs.id
    : isStainlessBody
      ? addonStainlessBody.id
      : null
)


export {
  isRadiatorsLegs,
  isStainlessBody,
  addonPostfix,
  addonId
}

