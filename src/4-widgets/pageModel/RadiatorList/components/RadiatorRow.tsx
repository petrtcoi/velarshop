import { useStore } from "@nanostores/preact"

import BuyButton from "@features/order/ShoppingCart"

import { getGrillNotFit } from "@features/options/GrillNotFit"
import { getRadiatorTotalCost } from "@features/radiator/RadiatorTotalCost"

import type { ModelJson } from "@entities/Model"
import type { RadiatorJson } from "@entities/Radiator"
import { radiatorTotalTitle } from "@features/radiator/RadiatorTotalTitle"


type Props = {
  model: ModelJson
  radiator: RadiatorJson
}

function RadiatorRow ({ model, radiator }: Props) {

  const totalPrice = useStore(getRadiatorTotalCost)(model, radiator)
  const totalTitle = useStore(radiatorTotalTitle)(model, radiator)
  const convectorGrillNotFit = useStore(getGrillNotFit)(model, radiator)


  return (
    <tr class="hover:bg-neutral-50 py-3 text-xs border-b border-neutral-200 font-light">
      <td class="py-3 pl-2 flex flex-col">
        <div class="text-red-600 font-normal hover:underline">
          <a href={ `/model/${ model.slug }/${ radiator.slug }` }>
            { totalTitle }
          </a>
        </div>
        <div class="text-[10px] text-neutral-600 md:hidden">
          { radiator.height }
          <span class="text-[8px] font-thin">x</span>
          { radiator.length }
          <span class="text-[8px] font-thin">x</span>
          { radiator.width } мм / { radiator.dt70 } Вт
        </div>
      </td>
      <td class="py-3 text-center hidden md:table-cell lg:hidden">{ radiator.height }<span class="text-xs font-thin mx-1">x</span>{ radiator.length }<span class="text-xs font-thin mx-1">x</span>{ radiator.width }</td>
      <td class="py-3 text-center hidden lg:table-cell">{ radiator.width }</td>
      <td class="py-3 text-center hidden lg:table-cell">{ radiator.height }</td>
      <td class="py-3 text-center hidden lg:table-cell">{ radiator.length }</td>
      <td class="py-3 text-center hidden md:table-cell">{ radiator.dt70 }</td>
      { convectorGrillNotFit
        ? <td class="py-3 text-neutral-400" colSpan={ 2 }>решетка не подходит</td>
        : (
          <>
            <td class="py-3">{ totalPrice.toLocaleString('ru-RU') }</td>
            <td class="justify-center ">
              <BuyButton
                itemTitle={ totalTitle }
                price={ totalPrice }
                model={ model }
                radiator={ radiator }
              />
            </td>
          </>
        )
      }

    </tr>
  )
}

export default RadiatorRow