import type { ModelJson } from "@entities/Model"
import type { RadiatorJson } from "@entities/Radiator"
import { exhaustedCheck } from "./exhaustedCheck"

type Props = {
  model: ModelJson
  radiator: RadiatorJson
}

export function getRadiatorTitle({ model, radiator }: Props): string {
  if (model.type === "design") {
    const modelTitle = model.name
      .replace(/\s/g, "")
      .replace("H", "")
      .replace("V", "")
    const modelMeasure =
      model.orientation === "horizontal" ? radiator.length : radiator.height
    const sectionsPrefix = model.orientation === "horizontal" ? "H" : "V"

    return `${modelTitle} ${modelMeasure}  ${sectionsPrefix}${radiator.sections} `
  }

  if (model.type === "columns") {
    const modelTitle = model.name
    const sectionsPrefix =
      parseInt(radiator.sections || "1") > 9
        ? `0${radiator.sections}`
        : `${radiator.sections}`

    return `Velar ${modelTitle}, ${sectionsPrefix} сек. `
  }

  if (model.type === "floor") {
    const modelTitle = model.name.replace(/\s/g, "")
    return `${modelTitle} ${radiator.width}-${radiator.height}-${radiator.length}`
  }

  if (model.type === "ironcast") {
    const modelTitle = model.name
    return `${modelTitle} / ${radiator.sections}`
  }

  if (model.type === "convector") {
    const modelTitle = model.name.replace(/\s/g, "")
    return `${modelTitle} ${radiator.width}-${radiator.height}-${radiator.length}`
  }

  exhaustedCheck(model.type)
  return ""
}
