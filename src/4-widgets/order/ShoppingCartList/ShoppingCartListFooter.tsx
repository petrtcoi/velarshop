import { useStore } from "@nanostores/preact"
import { storeCartTotalPrice, storeCartTotalQnty } from "@features/order/ShoppingCart"

function ShoppingCartListFooter () {

  const cartTotalQnty = useStore(storeCartTotalQnty)
  const cartTotalPrice = useStore(storeCartTotalPrice)

  return (
    <tfoot>
      <tr class="font-semibold">
        <td class="text-xs py-3 pl-3"></td>
        <td class="text-xs  py-3 text-center"></td>
        <td class="text-xs  py-3 text-center">{ cartTotalQnty }</td>
        <td class="text-xs  py-3 text-center">{ cartTotalPrice.toLocaleString() }</td>
      </tr>
    </tfoot>
  )
}

export default ShoppingCartListFooter