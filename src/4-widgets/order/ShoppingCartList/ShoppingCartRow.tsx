import BuyButton from "@features/order/ShoppingCart"
import type { ShoppingCartItem } from "@entities/shopping-cart"


type Props = ShoppingCartItem


function ShoppingCartRow (item: Props) {

  const { title, details, qnty, price } = item
  const total = price * qnty


  return (
    <tr class="border-b border-neutral-200 text-sm transition hover:bg-neutral-50">
      <td class="px-4 py-4">
        <div class="flex flex-col gap-1">
        <div class="font-medium text-neutral-950">
          <a href={ item.linkSlug } class="text-[#b91c1c] underline decoration-[#b91c1c]/40 underline-offset-[3px] hover:no-underline">
            { title }
          </a>
        </div>
        <div class="text-xs leading-5 text-neutral-600">
          { details }
        </div>
        </div>
      </td>

      <td class="px-3 py-4 text-center text-sm text-neutral-700">{ item.price.toLocaleString() } ₽</td>
      <td class="px-3 py-4">
        <BuyButton itemTitle={ title } />
      </td>
      <td class="px-4 py-4 text-right text-sm font-medium text-neutral-950">{ total.toLocaleString() } ₽</td>

    </tr>
  )
}

export default ShoppingCartRow
