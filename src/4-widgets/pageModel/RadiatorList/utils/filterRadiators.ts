import type { RadiatorJson } from "@entities/Radiator"
import { ALL } from "../constants/filterAll"


type Props = {
  radiators: RadiatorJson[]
  selectedHeight: string,
  selectedWidth: string,
  selectedLength: string,
  selectedInterAxis?: string,
}

export function filterRadiators ({
  radiators,
  selectedHeight,
  selectedWidth,
  selectedLength,
  selectedInterAxis = ALL,
}: Props) {


  return radiators
    .filter((radiator) => {
      const heightMatch = selectedHeight === ALL || radiator.height === selectedHeight
      const widthMatch = selectedWidth === ALL || radiator.width === selectedWidth
      const lengthMatch = selectedLength === ALL || radiator.length === selectedLength
      const interAxisMatch = selectedInterAxis === ALL || radiator.n_spacing === selectedInterAxis
      return heightMatch && widthMatch && lengthMatch && interAxisMatch
    })

} 
