import BuyButton from "@features/order/ShoppingCart"
import type { ShoppingCartItem } from "@entities/shopping-cart"


type Props = ShoppingCartItem


function ShoppingCartRow (item: Props) {

  const { title, details, qnty, price } = item
  const total = price * qnty


  return (
    <tr class="hover:bg-neutral-50 py-3 text-xs border-b border-neutral-200 font-light ">
      <td class="py-3 pl-2 flex flex-col gap-1">
        <div class="text-red-600 font-normal hover:underline">
          <a href={ item.linkSlug }>
            { title }
          </a>
        </div>
        <div class="text-[10px] text-neutral-600 text-light">
          { details }
        </div>
      </td>

      <td class="py-3 text-center ">{ item.price.toLocaleString() }</td>
      <td class="justify-center ">
        <BuyButton itemTitle={ title } />
      </td>
      <td class="py-3 text-center pr-2 ">{ total.toLocaleString() }</td>

    </tr>
  )
}

export default ShoppingCartRow