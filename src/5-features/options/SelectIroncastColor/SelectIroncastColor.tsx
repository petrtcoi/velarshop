import { useStore } from '@nanostores/preact'
import { useEffect } from "preact/hooks"

import Select from "@shared/components/Select"
import { ironcastColors } from "@entities/IroncastColor"
import { ironcastColorId as storeIroncastColorId } from './store/ironcastColor'




function SelectIroncastColor () {

  const ironcastColorId = useStore(storeIroncastColorId)
  const options = ironcastColors.map(color => ({
    id: color.id,
    label: `${ color.title } (${ color.price_section } ₽ / сек.)`
  }))

  useEffect(() => {
    if (!ironcastColorId) storeIroncastColorId.set(ironcastColors[ 0 ].id)
  }, [])

  const handleChange = (id: string) => { storeIroncastColorId.set(id) }



  return (
    <div class='mt-5 mb-2'>
      <label
        for='select_radiator_color'
        class='block text-xs font-thin'
      >
        Цвет радиатора:
      </label>
      <Select
        id='select_radiator_color'
        options={ options }
        selected={ ironcastColorId }
        onChange={ handleChange }
      />
    </div>
  )
}


export default SelectIroncastColor
