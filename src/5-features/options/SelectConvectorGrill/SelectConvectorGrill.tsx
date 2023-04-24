import { useStore } from '@nanostores/preact'
import { useEffect } from "preact/hooks"

import Select from "@shared/components/Select"

import { convectorGrillId as storeConvectorGrillId } from './store/convectorGrill'
import { convectorGrills } from '@entities/ConvectorGrill'



type Props = {}

function SelectConvectorGrill ({ }: Props) {

  const convectorGrillId = useStore(storeConvectorGrillId)
  const options = convectorGrills.map(grill => ({
    id: grill.id,
    label: grill.title
  }))

  useEffect(() => {
    if (!convectorGrillId) storeConvectorGrillId.set(convectorGrills[ 0 ].id)
  }, [])
  const handleChange = (id: string) => { storeConvectorGrillId.set(id) }




  return (
    <div class='mt-5 mb-2'>
      <label
        for='select_convector_grill'
        class='block text-xs font-thin'
      >
        Решетка для конвектора:
      </label>
      <Select
        options={ options }
        selected={ convectorGrillId }
        onChange={ handleChange }
        id='select_convector_grill'
      />

    </div>
  )
}


export default SelectConvectorGrill
