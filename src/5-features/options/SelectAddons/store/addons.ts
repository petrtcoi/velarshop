import { computed, atom } from 'nanostores'
import { addonRadiatorLegs } from '@entities/Addons'



const isRadiatorsLegs = atom<boolean>(false)


const addonPostfix = computed(isRadiatorsLegs, isRadiatorsLegs =>
  isRadiatorsLegs
    ? `, ${ addonRadiatorLegs.code }`
    : ''
)

const addonId = computed(isRadiatorsLegs, isRadiatorsLegs =>
  isRadiatorsLegs
    ? addonRadiatorLegs.id
    : null
)


export {
  isRadiatorsLegs,
  addonPostfix,
  addonId
}
