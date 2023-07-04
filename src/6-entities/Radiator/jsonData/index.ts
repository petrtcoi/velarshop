import type { RadiatorJson } from "../types/RadiatorJson.type"
import { getColumnRadiators } from "./column"

import ironcast from "./ironcast"
import kwh from "./kwh"
import kwhv from "./kwhv"
import radiatorsDesign from "./radiatorsDesign"

const radiatorsJsonData: RadiatorJson[] = [
  ...ironcast,
  ...kwh,
  ...kwhv,
  ...radiatorsDesign,
  ...getColumnRadiators(),
]

export { radiatorsJsonData }

function columnModels() {
  throw new Error("Function not implemented.")
}
