import type { RadiatorJson } from '../types/RadiatorJson.type'

import ironcast from './ironcast'
import kwh from './kwh'
import kwhv from './kwhv'
import radiatorsDesign from './radiatorsDesign'



const radiatorsJsonData: RadiatorJson[] = [
  ...ironcast,
  ...kwh,
  ...kwhv,
  ...radiatorsDesign
]



export { radiatorsJsonData }

