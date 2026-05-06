import type { ModelJson } from "@entities/Model"
import { exhaustedCheck } from "@shared/utils/exhaustedCheck"

const allFiltersOff = {
  filterByHeight: false,
  filterByWidth: false,
  filterByLength: false,
}


export function getModelFilters (model: Pick<ModelJson, 'type' | 'orientation'>): {
  filterByHeight: boolean,
  filterByWidth: boolean,
  filterByLength: boolean
} {

  const { type, orientation } = model

  if (type === 'convector') {
    return {
      ...allFiltersOff,
      filterByHeight: true,
      filterByWidth: true,
    }
  }
  if (type === 'columns') {
    return allFiltersOff
  }
  if (type === 'floor') return allFiltersOff
  if (type === 'ironcast') return allFiltersOff
  if (type === 'design') {
    return allFiltersOff
  }

  exhaustedCheck(type)
  return allFiltersOff
}
