import { useStore } from "@nanostores/preact"
import { storeCartTotalPrice, storeCartTotalQnty } from "@features/order/ShoppingCart"

function ShoppingCartListFooter () {

  const cartTotalQnty = useStore(storeCartTotalQnty)
  const cartTotalPrice = useStore(storeCartTotalPrice)

  return (
    <tfoot>
      <tr class="bg-neutral-50 font-medium">
        <td class="px-4 py-4 text-sm text-neutral-950">Итого</td>
        <td class="px-3 py-4 text-center text-sm text-neutral-500"></td>
        <td class="px-3 py-4 text-center text-sm text-neutral-950">{ cartTotalQnty }</td>
        <td class="px-4 py-4 text-right text-sm font-semibold text-neutral-950">{ cartTotalPrice.toLocaleString() } ₽</td>
      </tr>
    </tfoot>
  )
}

export default ShoppingCartListFooter
