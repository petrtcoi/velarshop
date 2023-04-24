import { useEffect, useState } from 'preact/hooks'

import RadiatorRow from './RadiatorRow'
import RadiatorFilter from "./RadiatorFilter"
import RadiatorListHeader from './RadiatorListHeader'

import SelectAddon from '@features/options/SelectAddons'
import SelectConnection from '@features/options/SelectConnection'
import SelectIroncastColor from '@features/options/SelectIroncastColor'
import SelectConvectorGrill from '@features/options/SelectConvectorGrill'

import { ALL } from '../constants/filterAll'
import { filterRadiators } from '../utils/filterRadiators'

import type { ModelJson } from '@entities/Model'
import type { RadiatorJson } from "@entities/Radiator"





type Props = {
  model: ModelJson
  radiators: RadiatorJson[]
  initialFilteredRadiators: RadiatorJson[]
  heights: string[]
  lengths: string[]
  widths: string[]
  filterByHeight?: boolean
  filterByWidth?: boolean
  filterByLength?: boolean
}

function RadiatorList (props: Props) {

  const {
    model,
    radiators,
    initialFilteredRadiators,
    heights,
    lengths,
    widths,
    filterByHeight = false,
    filterByWidth = false,
    filterByLength = false
  } = props


  const [ lastFilterUpdate, setLastFilterUpdate ] = useState<'length' | 'height' | 'width'>('height')
  const [ selectedHeight, setSelectedHeight ] = useState<string>(filterByHeight ? heights[ 0 ] : ALL)
  const [ selectedWidth, setSelectedWidth ] = useState<string>(filterByWidth ? widths[ 0 ] : ALL)
  const [ selectedLength, setSelectedLength ] = useState<string>(filterByLength ? lengths[ 0 ] : ALL)
  const [ filteredRadiators, setFilteredRadiators ] = useState<RadiatorJson[]>(initialFilteredRadiators)


  // Track filter changes to avoid empty list
  const changeHeightFilter = (height: string) => {
    setSelectedHeight(height)
    setLastFilterUpdate('height')
  }
  const changeWidthFilter = (width: string) => {
    setSelectedWidth(width)
    setLastFilterUpdate('width')
  }
  const changeLengthFilter = (length: string) => {
    setSelectedLength(length)
    setLastFilterUpdate('length')
  }



  useEffect(() => {
    const escapeRadiator = radiators.find(r => (
      (selectedHeight === ALL || lastFilterUpdate !== 'height' || r.height === selectedHeight)
      && (selectedWidth === ALL || lastFilterUpdate !== 'width' || r.width === selectedWidth)
      && (selectedLength === ALL || lastFilterUpdate !== 'length' || r.length === selectedLength)
    ))
    if (escapeRadiator) {
      if (lastFilterUpdate !== 'height' && selectedHeight !== ALL) setSelectedHeight(escapeRadiator.height)
      if (lastFilterUpdate !== 'width' && selectedWidth !== ALL) setSelectedWidth(escapeRadiator.width)
      if (lastFilterUpdate !== 'length' && selectedLength !== ALL) setSelectedLength(escapeRadiator.length)
    }
  }, [ filteredRadiators ])


  // Track filter changes to display not available options
  const [ availableHeights, setAvailableHeights ] = useState<string[]>(heights)
  const [ availableWidths, setAvailableWidths ] = useState<string[]>(widths)
  const [ availableLengths, setAvailableLengths ] = useState<string[]>(lengths)
  useEffect(() => {
    setAvailableHeights(heights.filter(h => radiators.some(r =>
      (lastFilterUpdate === 'height' || selectedHeight === ALL) || (
        (h === r.height)
        && (selectedWidth === ALL || r.width === selectedWidth)
        && (selectedLength === ALL || r.length === selectedLength)
      )
    )))
    setAvailableWidths(widths.filter(w => radiators.some(r =>
      (lastFilterUpdate === 'width' || selectedWidth === ALL) || (
        (w === r.width)
        && (selectedHeight === ALL || r.height === selectedHeight)
        && (selectedLength === ALL || r.length === selectedLength)
      )
    )))
    setAvailableLengths(lengths.filter(l => radiators.some(r =>
      (lastFilterUpdate === 'length' || selectedLength === ALL) || (
        (l === r.length)
        && (selectedHeight === ALL || r.height === selectedHeight)
        && (selectedWidth === ALL || r.width === selectedWidth)
      )
    )))
  }, [ filteredRadiators ])


  useEffect(() => {
    setFilteredRadiators(filterRadiators({ radiators, selectedHeight, selectedLength, selectedWidth }))
  }, [ selectedHeight, selectedWidth, selectedLength ])


  return (
    <div id="radiators-list" class="mt-7 pt-3">
      { filterByLength &&
        <RadiatorFilter
          title={ "Длина (мм)" }
          options={ lengths }
          availableOptions={ availableLengths }
          selectedOption={ selectedLength }
          setSelectedOption={ changeLengthFilter }
        />
      }
      { filterByHeight &&
        <RadiatorFilter
          title={ "Высота (мм)" }
          options={ heights }
          availableOptions={ availableHeights }
          selectedOption={ selectedHeight }
          setSelectedOption={ changeHeightFilter }
        />
      }
      { filterByWidth &&
        <RadiatorFilter
          title={ "Глубина (мм)" }
          options={ widths }
          availableOptions={ availableWidths }
          selectedOption={ selectedWidth }
          setSelectedOption={ changeWidthFilter }
        />
      }

      { (model.type === 'design' || model.type === 'floor') &&
        <SelectConnection model={ model } />
      }
      { model.type === 'ironcast' &&
        <SelectIroncastColor />
      }
      { model.type === 'convector' &&
        <SelectConvectorGrill />
      }
      <SelectAddon model={ model } />

      <div class="mt-5">
        <table class="text-xs w-full text-left">
          <RadiatorListHeader />
          <tbody>
            { filteredRadiators.map((radiator) => (
              <RadiatorRow
                model={ model }
                radiator={ radiator }
              />
            )) }
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RadiatorList