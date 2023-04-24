import { useStore } from "@nanostores/preact"
import { storeShoppingCart } from '@features/order/ShoppingCart'
import ShoppingCartListHeader from "./ShoppingCartListHeader"
import ShoppingCartRow from "./ShoppingCartRow"
import ShoppingCartListFooter from "./ShoppingCartListFooter"

function ShoppingCartList () {

  const shoppingCart = useStore(storeShoppingCart)

  if (shoppingCart.items.length === 0) return (
    <div class="mx-auto mt-5 py-14 text-center border rounded-xl border-neutral-200">
      <p class="text-sm">Ваша корзина покупок пуста</p>
      <p class="text-sm font-thin">Пожалуйста, перейдите в каталог, чтобы выбрать подходящие радиаторы</p>
    </div>
  )

  return (
    <div class="mt-5 overflow-x-auto">
      <table class="text-xs w-full text-left">
        <ShoppingCartListHeader />
        <tbody>
          { shoppingCart.items
            .sort((a, b) => a.itemType === 'radiator' && b.itemType !== 'radiator' ? -1 : 1)
            .map((item) => {
              return (
                <ShoppingCartRow { ...item } />
              )
            }) }
        </tbody>
        <ShoppingCartListFooter />
      </table>
    </div>
  )


}

export default ShoppingCartList