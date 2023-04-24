import type { ModelJson } from "@entities/Model"
import type { RadiatorJson } from "@entities/Radiator"
import { getGrillNotFit } from "@features/options/GrillNotFit"
import BuyButton from "@features/order/ShoppingCart"
import { getRadiatorTotalCost } from "@features/radiator/RadiatorTotalCost"
import { radiatorTotalTitle } from "@features/radiator/RadiatorTotalTitle"
import { useStore } from "@nanostores/preact"

type Props = {
  radiator: RadiatorJson
  model: ModelJson
}

function BuyRadiator ({ radiator, model }: Props) {

  const totalPrice = useStore(getRadiatorTotalCost)(model, radiator)
  const totalTitle = useStore(radiatorTotalTitle)(model, radiator)
  const convectorGrillNotFit = useStore(getGrillNotFit)(model, radiator)


  if (convectorGrillNotFit) {
    return (
      <div class="my-8 sm:my-16  text-center px-8 text-red-500">
        Выбранная решетка не подходит для данной модели конвектора
      </div>
    )
  }

  return (
    <div class="mt-8 sm:mt-16">
      <div
        id='buy-radiator'
        class='flex flex-col gap-6 sm:flex-row sm:gap-8 items-center justify-center sm:justify-start w-full'
      >
        <div>
          <div class="w-48 mx-auto">
            <span class='text-sm mr-1 font-thin'>Цена:</span>
            <span class='mx-2 text-4xl text-neutral-900'>
              { totalPrice.toLocaleString("ru-RU") }
            </span>
            <span class='text-sm font-thin'>&#8381;</span>
          </div>
          <div class="text-center text-[10px] sm:hidden ">
            арт. { totalTitle }
          </div>
        </div>
        <BuyButton
          type="large"
          itemTitle={ totalTitle }
          price={ totalPrice }
          model={ model }
          radiator={ radiator }
        />
      </div>

      <div class="hidden sm:block text-left text-[10px] sm:font-thin mt-1">
        арт. { totalTitle }
      </div>
    </div>
  )
}

export default BuyRadiator