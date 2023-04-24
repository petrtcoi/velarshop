import { convectorGrills } from "@entities/ConvectorGrill"
import { persistentAtom } from "@nanostores/persistent"
import { computed } from 'nanostores'

const version = await import.meta.env.PUBLIC_LOCAL_STORAGE_VERSION


const convectorGrillId = persistentAtom<string>(`velarshop_convector_grill_active/${ version }`, "")

const convectorGrill = computed(convectorGrillId, (grillId) => {
  return convectorGrills.find((grill) => grill.id === grillId)
})

const convectorGrillPostfix = computed(convectorGrill, (grill) => {
  if (!grill) return ''
  return `, ${ grill.code }`
})

export {
  convectorGrillId,
  convectorGrill,
  convectorGrillPostfix
}